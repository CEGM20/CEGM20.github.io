'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  BookOpen,
  Users,
  MessageSquare,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  description?: string
  author: string
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED'
  isFeatured: boolean
  coverImage?: string
  views: number
  createdAt: string
  _count: {
    chapters: number
    ratings: number
    follows: number
    comments: number
  }
  genres: Array<{
    genre: {
      id: string
      name: string
    }
  }>
}

export default function ManageSeriesPage() {
  const { isAdmin, isLoading } = useAdminAuth()
  const router = useRouter()
  
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchSeries()
    }
  }, [isAdmin, currentPage, searchTerm])

  const fetchSeries = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      })
      
      const response = await fetch(`/api/admin/series?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(data.series)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Error fetching series')
      }
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSeries()
  }

  const handleDelete = async (seriesId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta serie? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/series/${seriesId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        fetchSeries()
      } else {
        console.error('Error deleting series')
      }
    } catch (error) {
      console.error('Error deleting series:', error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Gestionar Series</h1>
            </div>
            <Link href="/admin/series/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Serie
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por título o autor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        {/* Series Table */}
        <Card>
          <CardHeader>
            <CardTitle>Series ({series.length})</CardTitle>
            <CardDescription>
              Lista de todas las series en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serie</TableHead>
                        <TableHead>Autor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Géneros</TableHead>
                        <TableHead>Estadísticas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {series.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {item.coverImage ? (
                                  <img 
                                    src={item.coverImage} 
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
                                    <span className="text-white text-xs font-bold">{item.title.charAt(0)}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.title}</div>
                                {item.isFeatured && (
                                  <Badge variant="secondary" className="text-xs">
                                    Destacado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(item.status)} text-white`}>
                              {getStatusText(item.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.genres.map((genreRelation) => (
                                <Badge key={genreRelation.genre.id} variant="outline" className="text-xs">
                                  {genreRelation.genre.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {item._count.chapters} caps
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {item._count.follows} seguidores
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {item._count.comments} comentarios
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link href={`/series/${item.id}`} target="_blank">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/series/${item.id}/chapters?seriesId=${item.id}`}>
                                <Button variant="outline" size="sm">
                                  <BookOpen className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}