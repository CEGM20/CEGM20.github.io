'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Star, Eye, Grid, List } from 'lucide-react'

interface Series {
  id: string
  title: string
  description?: string
  coverImage?: string
  author?: string
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED'
  views: number
  createdAt: string
  _count?: {
    chapters: number
    ratings: number
    follows: number
  }
  avgRating?: number
  genres?: {
    genre: {
      name: string
    }
  }[]
}

interface Genre {
  id: string
  name: string
}

export default function CatalogPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchGenres()
    fetchSeries()
  }, [page, sortBy, selectedGenre, selectedStatus])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1)
      fetchSeries()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres')
      if (response.ok) {
        const genresData = await response.json()
        setGenres(genresData)
      }
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  const fetchSeries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
        search: searchTerm,
        genre: selectedGenre,
        status: selectedStatus
      })

      const response = await fetch(`/api/series?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setSeries(data.series)
        } else {
          setSeries(prev => [...prev, ...data.series])
        }
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'bg-green-500'
      case 'COMPLETED': return 'bg-blue-500'
      case 'HIATUS': return 'bg-yellow-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ONGOING': return 'En emisión'
      case 'COMPLETED': return 'Completado'
      case 'HIATUS': return 'Pausa'
      case 'CANCELLED': return 'Cancelado'
      default: return 'Desconocido'
    }
  }

  const SeriesCard = ({ series }: { series: Series }) => (
    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105">
      <Link href={`/series/${series.id}`}>
        <div className="relative">
          <div className="aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
            {series.coverImage ? (
              <img 
                src={series.coverImage} 
                alt={series.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-pink-400">
                <span className="text-white text-lg font-bold">{series.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="absolute top-2 left-2">
            <Badge className={`${getStatusColor(series.status)} text-white text-xs`}>
              {getStatusText(series.status)}
            </Badge>
          </div>
          {series.avgRating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {series.avgRating.toFixed(1)}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{series.title}</h3>
          {series.author && (
            <p className="text-xs text-gray-600 mb-2">por {series.author}</p>
          )}
          {series.genres && series.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {series.genres.slice(0, 2).map(({ genre }) => (
                <Badge key={genre.id} variant="secondary" className="text-xs">
                  {genre.name}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {series.views}
            </div>
            {series._count?.chapters && (
              <div className="flex items-center gap-1">
                <span>{series._count.chapters} caps</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )

  const SeriesListItem = ({ series }: { series: Series }) => (
    <Card className="group cursor-pointer transition-all hover:shadow-lg">
      <Link href={`/series/${series.id}`}>
        <CardContent className="p-4 flex gap-4">
          <div className="flex-shrink-0 w-24 h-32 bg-gray-200 rounded-lg overflow-hidden">
            {series.coverImage ? (
              <img 
                src={series.coverImage} 
                alt={series.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-pink-400">
                <span className="text-white text-lg font-bold">{series.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{series.title}</h3>
              <Badge className={`${getStatusColor(series.status)} text-white text-xs`}>
                {getStatusText(series.status)}
              </Badge>
            </div>
            {series.author && (
              <p className="text-sm text-gray-600 mb-2">por {series.author}</p>
            )}
            {series.description && (
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{series.description}</p>
            )}
            {series.genres && series.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {series.genres.map(({ genre }) => (
                  <Badge key={genre.id} variant="secondary" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {series.views}
              </div>
              {series._count?.chapters && (
                <div className="flex items-center gap-1">
                  <span>{series._count.chapters} capítulos</span>
                </div>
              )}
              {series.avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {series.avgRating.toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-red-600">
              CEGM
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Buscar webtoons..." 
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/catalog" className="text-sm font-medium text-red-600">
                  Catálogo
                </Link>
                <Link href="/popular" className="text-sm font-medium hover:text-red-600 transition-colors">
                  Popular
                </Link>
                <Link href="/recent" className="text-sm font-medium hover:text-red-600 transition-colors">
                  Recientes
                </Link>
              </nav>
              
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Catálogo de Series</h1>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los géneros</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ONGOING">En emisión</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="HIATUS">Pausa</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="rating">Mejor calificados</SelectItem>
                <SelectItem value="views">Más vistos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Series Grid/List */}
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {series.map((seriesItem) => (
                  <SeriesCard key={seriesItem.id} series={seriesItem} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {series.map((seriesItem) => (
                  <SeriesListItem key={seriesItem.id} series={seriesItem} />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={loadMore} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </Button>
              </div>
            )}

            {!hasMore && series.length > 0 && (
              <div className="text-center mt-8 text-gray-500">
                Has llegado al final del catálogo
              </div>
            )}

            {series.length === 0 && !loading && (
              <div className="text-center mt-8 text-gray-500">
                No se encontraron series que coincidan con tus criterios de búsqueda
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}