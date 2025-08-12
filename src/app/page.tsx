'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Star, Clock, Eye } from 'lucide-react'

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
}

export default function Home() {
  const [featuredSeries, setFeaturedSeries] = useState<Series[]>([])
  const [recentUpdates, setRecentUpdates] = useState<Series[]>([])
  const [popularSeries, setPopularSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const [featuredRes, recentRes, popularRes] = await Promise.all([
        fetch('/api/series/featured'),
        fetch('/api/series/recent'),
        fetch('/api/series/popular')
      ])

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        setFeaturedSeries(featuredData)
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json()
        setRecentUpdates(recentData)
      }

      if (popularRes.ok) {
        const popularData = await popularRes.json()
        setPopularSeries(popularData)
      }
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

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
                />
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/catalog" className="text-sm font-medium hover:text-red-600 transition-colors">
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
                <Link href="/admin/login">
                  <Button variant="outline" size="sm">
                    Administración
                  </Button>
                </Link>
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

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Featured Series */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Destacados</h2>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>

        {/* Recent Updates */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Actualizaciones Recientes</h2>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentUpdates.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>

        {/* Popular Series */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Populares</h2>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSeries.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CEGM. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}