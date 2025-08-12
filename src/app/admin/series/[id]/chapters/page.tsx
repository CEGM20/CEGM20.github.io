'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Eye,
  BookOpen,
  Calendar,
  Upload,
  Image as ImageIcon,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  publishDate: string
  views: number
  isPublished: boolean
  scheduledAt?: string
  _count: {
    images: number
  }
}

interface Series {
  id: string
  title: string
  author: string
  status: string
}

export default function ManageChaptersPage() {
  const { isAdmin, isLoading } = useAdminAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const seriesId = searchParams.get('seriesId') || ''
  
  const [series, setSeries] = useState<Series | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('chapterNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin && seriesId) {
      fetchSeries()
      fetchChapters()
    }
  }, [isAdmin, seriesId, searchTerm, statusFilter, sortBy, sortOrder])

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/series/${seriesId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSeries(data)
      }
    } catch (error) {
      console.error('Error fetching series:', error)
    }
  }

  const fetchChapters = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        sortBy,
        sortOrder
      })
      
      const response = await fetch(`/api/admin/series/${seriesId}/chapters?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setChapters(data.chapters)
      } else {
        console.error('Error fetching chapters')
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchChapters()
  }

  const handleDelete = async (chapterId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este capítulo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        fetchChapters()
      } else {
        console.error('Error deleting chapter')
      }
    } catch (error) {
      console.error('Error deleting chapter:', error)
    }
  }

  const handleStatusChange = async (chapterId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          publishDate: new Date().toISOString()
        })
      })

      if (response.ok) {
        fetchChapters()
      } else {
        console.error('Error updating chapter status')
      }
    } catch (error) {
      console.error('Error updating chapter status:', error)
    }
  }

  const getStatusColor = (isPublished: boolean, scheduledAt?: string) => {
    if (scheduledAt) return 'bg-blue-500'
    return isPublished ? 'bg-green-500' : 'bg-gray-500'
  }

  const getStatusText = (isPublished: boolean, scheduledAt?: string) => {
    if (scheduledAt) return 'Programado'
    return isPublished ? 'Publicado' : 'Borrador'
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
              <Link href={`/admin/series`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Series
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestionar Capítulos</h1>
                {series && (
                  <p className="text-sm text-gray-600">
                    {series.title} - {series.author}
                  </p>
                )}
              </div>
            </div>
            <Link href={`/admin/series/${seriesId}/chapters/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Capítulo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar capítulos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="SCHEDULED">Programado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chapterNumber">Número</SelectItem>
                  <SelectItem value="publishDate">Fecha</SelectItem>
                  <SelectItem value="views">Vistas</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente</SelectItem>
                  <SelectItem value="desc">Descendente</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        {/* Chapters Table */}
        <Card>
          <CardHeader>
            <CardTitle>Capítulos ({chapters.length})</CardTitle>
            <CardDescription>
              Lista de capítulos de la serie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Capítulo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Imágenes</TableHead>
                      <TableHead>Vistas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapters.map((chapter) => (
                      <TableRow key={chapter.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Cap. {chapter.chapterNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            {chapter.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={chapter.scheduledAt ? 'SCHEDULED' : chapter.isPublished ? 'PUBLISHED' : 'DRAFT'}
                              onValueChange={(value) => handleStatusChange(chapter.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PUBLISHED">Publicado</SelectItem>
                                <SelectItem value="DRAFT">Borrador</SelectItem>
                                <SelectItem value="SCHEDULED">Programado</SelectItem>
                              </SelectContent>
                            </Select>
                            {chapter.scheduledAt && (
                              <div className="text-xs text-gray-500">
                                {new Date(chapter.scheduledAt).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(chapter.publishDate).toLocaleDateString('es-ES')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            <span>{chapter._count.images}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{chapter.views}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/series/${seriesId}/chapters/${chapter.id}/upload`}>
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/series/${seriesId}/${chapter.chapterNumber}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDelete(chapter.id)}
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}