'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Star, 
  Eye, 
  Calendar, 
  Heart, 
  Share2, 
  BookOpen, 
  ArrowLeft,
  Clock,
  User
} from 'lucide-react'

interface Series {
  id: string
  title: string
  description?: string
  coverImage?: string
  author?: string
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED'
  views: number
  createdAt: string
  updatedAt: string
  _count?: {
    chapters: number
    ratings: number
    follows: number
  }
  avgRating?: number
  genres?: {
    genre: {
      id: string
      name: string
    }
  }[]
  chapters?: Chapter[]
}

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  publishDate: string
  views: number
  isPublished: boolean
}

export default function SeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [series, setSeries] = useState<Series | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [userRating, setUserRating] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchSeriesDetail()
    }
  }, [params.id])

  const fetchSeriesDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/series/${params.id}`)
      if (response.ok) {
        const seriesData = await response.json()
        setSeries(seriesData)
      } else {
        router.push('/catalog')
      }
    } catch (error) {
      console.error('Error fetching series detail:', error)
      router.push('/catalog')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    // TODO: Implement follow functionality when auth is ready
    setIsFollowing(!isFollowing)
  }

  const handleRating = async (rating: number) => {
    // TODO: Implement rating functionality when auth is ready
    setUserRating(rating)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Serie no encontrada</h1>
          <Button onClick={() => router.push('/catalog')}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Link href="/" className="text-2xl font-bold text-red-600">
                CEGM
              </Link>
            </div>
            
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
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Series Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden shadow-lg">
                {series.coverImage ? (
                  <img 
                    src={series.coverImage} 
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
                    <span className="text-white text-6xl font-bold">{series.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1" 
                  onClick={handleFollow}
                  variant={isFollowing ? "secondary" : "default"}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Series Info */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Badge className={`${getStatusColor(series.status)} text-white mb-4`}>
                {getStatusText(series.status)}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{series.title}</h1>
              {series.author && (
                <p className="text-lg text-muted-foreground mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  por {series.author}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {series.views.toLocaleString()} vistas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  {series.avgRating?.toFixed(1) || 'N/A'} ({series._count?.ratings || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {series._count?.follows || 0} seguidores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {series._count?.chapters || 0} capítulos
                </span>
              </div>
            </div>

            {/* Genres */}
            {series.genres && series.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">Géneros</h3>
                <div className="flex flex-wrap gap-2">
                  {series.genres.map(({ genre }) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Calificar esta serie</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRating(rating)}
                    className="p-0 h-8 w-8"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        rating <= userRating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                ))}
              </div>
            </div>

            {/* Description */}
            {series.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sinopsis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {series.description}
                </p>
              </div>
            )}

            {/* Publication Info */}
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Publicado: {formatDate(series.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Actualizado: {formatDate(series.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Chapters List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Capítulos</h2>
            <div className="text-sm text-muted-foreground">
              {series.chapters?.length || 0} capítulos disponibles
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.chapters?.map((chapter) => (
              <Card key={chapter.id} className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <Link href={`/chapter/${chapter.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">{chapter.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        Cap. {chapter.chapterNumber}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {chapter.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(chapter.publishDate)}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {(!series.chapters || series.chapters.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay capítulos disponibles aún.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}