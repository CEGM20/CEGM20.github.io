'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  Eye,
  MessageSquare,
  Calendar,
  User,
  Flag,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  user: {
    id: string
    username: string
  }
  series: {
    id: string
    title: string
  }
  chapter?: {
    id: string
    chapterNumber: number
  }
  parentComment?: {
    id: string
    content: string
  }
  replies?: Comment[]
}

export default function ModerateCommentsPage() {
  const { isAdmin, isLoading } = useAdminAuth()
  const router = useRouter()
  
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [moderationNote, setModerationNote] = useState('')

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchComments()
    }
  }, [isAdmin, currentPage, searchTerm, statusFilter])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })
      
      const response = await fetch(`/api/admin/comments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Error fetching comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchComments()
  }

  const handleModerate = async (commentId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          action,
          note: moderationNote
        })
      })

      if (response.ok) {
        setSelectedComment(null)
        setModerationNote('')
        fetchComments()
      } else {
        console.error('Error moderating comment')
      }
    } catch (error) {
      console.error('Error moderating comment:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        setSelectedComment(null)
        fetchComments()
      } else {
        console.error('Error deleting comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'APPROVED': return 'bg-green-500'
      case 'REJECTED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente'
      case 'APPROVED': return 'Aprobado'
      case 'REJECTED': return 'Rechazado'
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
              <h1 className="text-2xl font-bold text-gray-900">Moderar Comentarios</h1>
            </div>
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
                  placeholder="Buscar en comentarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="APPROVED">Aprobados</SelectItem>
                  <SelectItem value="REJECTED">Rechazados</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit">Buscar</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Comentarios ({comments.length})</CardTitle>
                <CardDescription>
                  Lista de comentarios para moderar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedComment?.id === comment.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedComment(comment)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{comment.user.username}</span>
                              <Badge className={`${getStatusColor(comment.status)} text-white`}>
                                {getStatusText(comment.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            En: <span className="font-medium">{comment.series.title}</span>
                            {comment.chapter && ` - Capítulo ${comment.chapter.chapterNumber}`}
                          </div>
                          
                          <p className="text-sm line-clamp-2">{comment.content}</p>
                          
                          {comment.parentComment && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <div className="text-xs text-gray-500 mb-1">Respondiendo a:</div>
                              <p className="line-clamp-2">{comment.parentComment.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
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
          </div>

          {/* Comment Detail */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Detalle del Comentario</CardTitle>
                <CardDescription>
                  {selectedComment ? 'Revisa y modera el comentario seleccionado' : 'Selecciona un comentario para ver detalles'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedComment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedComment.user.username}</span>
                      </div>
                      <Badge className={`${getStatusColor(selectedComment.status)} text-white`}>
                        {getStatusText(selectedComment.status)}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedComment.createdAt).toLocaleString('es-ES')}
                      </div>
                      <div>
                        En: <span className="font-medium">{selectedComment.series.title}</span>
                        {selectedComment.chapter && ` - Capítulo ${selectedComment.chapter.chapterNumber}`}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Contenido:</label>
                      <div className="p-3 bg-gray-50 rounded text-sm">
                        {selectedComment.content}
                      </div>
                    </div>

                    {selectedComment.parentComment && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Respondiendo a:</label>
                        <div className="p-3 bg-gray-100 rounded text-sm">
                          {selectedComment.parentComment.content}
                        </div>
                      </div>
                    )}

                    {selectedComment.status === 'PENDING' && (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Nota de moderación (opcional):</label>
                          <Textarea
                            value={moderationNote}
                            onChange={(e) => setModerationNote(e.target.value)}
                            placeholder="Añade una nota sobre esta decisión..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleModerate(selectedComment.id, 'APPROVE')}
                            className="flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => handleModerate(selectedComment.id, 'REJECT')}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </>
                    )}

                    <Button
                      onClick={() => handleDelete(selectedComment.id)}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar comentario
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecciona un comentario de la lista para ver sus detalles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}