'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  BookOpen,
  Calendar,
  Upload,
  Image as ImageIcon,
  GripVertical,
  X,
  Clock,
  LayoutDashboard,
  BarChart3,
  Users,
  MessageSquare,
  CheckCircle
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  publishDate: string
  scheduledAt?: string
  isPublished: boolean
  views: number
  series: {
    id: string
    title: string
  }
  _count?: {
    images: number
  }
}

interface Series {
  id: string
  title: string
}

interface ChapterImage {
  id: string
  imageUrl: string
  order: number
}

interface SortableImageItemProps {
  image: ChapterImage
  onRemove: (id: string) => void
}

function SortableImageItem({ image, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden">
        <img
          src={image.imageUrl}
          alt={`Página ${image.order + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute top-2 left-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-move bg-white/20 p-1 rounded"
            >
              <GripVertical className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="destructive"
              className="w-6 h-6 p-0"
              onClick={() => onRemove(image.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            Página {image.order + 1}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminChaptersPage() {
  const router = useRouter()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [seriesFilter, setSeriesFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadedImages, setUploadedImages] = useState<ChapterImage[]>([])
  const [formData, setFormData] = useState({
    title: '',
    chapterNumber: 1,
    seriesId: '',
    publishDate: new Date().toISOString().split('T')[0],
    scheduledAt: '',
    isPublished: true
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    checkAdminAuth()
    fetchChapters()
    fetchSeries()
  }, [])

  const checkAdminAuth = () => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      router.push('/admin/login')
    }
  }

  const fetchChapters = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/chapters')
      if (response.ok) {
        const chaptersData = await response.json()
        setChapters(chaptersData)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series')
      if (response.ok) {
        const seriesData = await response.json()
        setSeries(seriesData)
      }
    } catch (error) {
      console.error('Error fetching series:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
      
      // Create preview URLs
      const imagePreviews = Array.from(files).map((file, index) => ({
        id: `preview-${index}`,
        imageUrl: URL.createObjectURL(file),
        order: index
      }))
      setUploadedImages(imagePreviews)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploadingImages(true)
    const formData = new FormData()
    
    Array.from(selectedFiles).forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })

    try {
      const response = await fetch('/api/upload/chapter-images', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        const uploadedImageUrls = result.images.map((url: string, index: number) => ({
          id: `uploaded-${Date.now()}-${index}`,
          imageUrl: url,
          order: index
        }))
        setUploadedImages(uploadedImageUrls)
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setUploadedImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }))
      })
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadedImages.length === 0) {
      alert('Debes subir al menos una imagen para el capítulo')
      return
    }

    try {
      const url = editingChapter ? `/api/admin/chapters/${editingChapter.id}` : '/api/admin/chapters'
      const method = editingChapter ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImages.map((img, index) => ({
            imageUrl: img.imageUrl,
            order: index
          }))
        })
      })

      if (response.ok) {
        await fetchChapters()
        setShowCreateDialog(false)
        setEditingChapter(null)
        setFormData({
          title: '',
          chapterNumber: 1,
          seriesId: '',
          publishDate: new Date().toISOString().split('T')[0],
          scheduledAt: '',
          isPublished: true
        })
        setSelectedFiles(null)
        setUploadedImages([])
      }
    } catch (error) {
      console.error('Error saving chapter:', error)
    }
  }

  const handleEdit = async (chapter: Chapter) => {
    setEditingChapter(chapter)
    setFormData({
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      seriesId: chapter.series.id,
      publishDate: new Date(chapter.publishDate).toISOString().split('T')[0],
      scheduledAt: chapter.scheduledAt ? new Date(chapter.scheduledAt).toISOString().split('T')[0] : '',
      isPublished: chapter.isPublished
    })

    // Fetch existing images
    try {
      const response = await fetch(`/api/chapters/${chapter.id}/images`)
      if (response.ok) {
        const images = await response.json()
        setUploadedImages(images)
      }
    } catch (error) {
      console.error('Error fetching chapter images:', error)
    }

    setShowCreateDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este capítulo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/chapters/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchChapters()
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (response.ok) {
        await fetchChapters()
      } else {
        console.error('Error updating chapter status')
      }
    } catch (error) {
      console.error('Error updating chapter status:', error)
    }
  }

  const filteredChapters = chapters.filter(chapter => {
    const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.series.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeries = seriesFilter === 'all' || chapter.series.id === seriesFilter
    return matchesSearch && matchesSeries
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Admin Panel</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/admin" className="text-gray-300 hover:text-white">
                  Dashboard
                </Link>
                <Link href="/admin/series" className="text-gray-300 hover:text-white">
                  Series
                </Link>
                <Link href="/admin/chapters" className="text-white font-medium">
                  Capítulos
                </Link>
                <Link href="/admin/users" className="text-gray-300 hover:text-white">
                  Usuarios
                </Link>
                <Link href="/admin/comments" className="text-gray-300 hover:text-white">
                  Comentarios
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Capítulo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingChapter ? 'Editar Capítulo' : 'Nuevo Capítulo'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {editingChapter ? 'Edita la información del capítulo' : 'Agrega un nuevo capítulo a la plataforma'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seriesId">Serie *</Label>
                        <Select 
                          value={formData.seriesId} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, seriesId: value }))}
                          disabled={!!editingChapter}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Seleccionar serie" />
                          </SelectTrigger>
                          <SelectContent>
                            {series.map((seriesItem) => (
                              <SelectItem key={seriesItem.id} value={seriesItem.id}>
                                {seriesItem.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="chapterNumber">Número de Capítulo *</Label>
                        <Input
                          id="chapterNumber"
                          type="number"
                          value={formData.chapterNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) }))}
                          className="bg-gray-700 border-gray-600 text-white"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="publishDate">Fecha de Publicación</Label>
                        <Input
                          id="publishDate"
                          type="date"
                          value={formData.publishDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scheduledAt">Programar para (opcional)</Label>
                        <Input
                          id="scheduledAt"
                          type="datetime-local"
                          value={formData.scheduledAt}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="rounded border-gray-600 bg-gray-700 text-purple-600"
                      />
                      <Label htmlFor="isPublished">Publicado inmediatamente</Label>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                      <div>
                        <Label>Imágenes del Capítulo *</Label>
                        <p className="text-sm text-gray-400">Sube las imágenes en orden. Puedes arrastrar para reorganizar.</p>
                      </div>

                      <div className="space-y-4">
                        {/* File Upload */}
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-white mb-2">Selecciona las imágenes del capítulo</p>
                            <p className="text-sm text-gray-400">O arrastra y suelta los archivos aquí</p>
                            <Button type="button" variant="outline" className="mt-4 border-gray-600 text-white hover:bg-gray-700">
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Seleccionar Archivos
                            </Button>
                          </label>
                        </div>

                        {/* Upload Button */}
                        {selectedFiles && selectedFiles.length > 0 && (
                          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                            <div>
                              <p className="text-white font-medium">
                                {selectedFiles.length} archivo(s) seleccionado(s)
                              </p>
                              <p className="text-sm text-gray-400">
                                Tamaño total: {(Array.from(selectedFiles).reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button 
                              onClick={handleImageUpload} 
                              disabled={uploadingImages}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              {uploadingImages ? 'Subiendo...' : 'Subir Imágenes'}
                            </Button>
                          </div>
                        )}

                        {/* Image Grid */}
                        {uploadedImages.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white font-medium">
                                Imágenes subidas ({uploadedImages.length})
                              </h4>
                              <p className="text-sm text-gray-400">Arrastra para reordenar</p>
                            </div>
                            
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                            >
                              <SortableContext
                                items={uploadedImages.map(img => img.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                  {uploadedImages.map((image) => (
                                    <SortableImageItem
                                      key={image.id}
                                      image={image}
                                      onRemove={handleRemoveImage}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={uploadedImages.length === 0}
                      >
                        {editingChapter ? 'Actualizar' : 'Crear'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowCreateDialog(false)
                          setEditingChapter(null)
                          setFormData({
                            title: '',
                            chapterNumber: 1,
                            seriesId: '',
                            publishDate: new Date().toISOString().split('T')[0],
                            scheduledAt: '',
                            isPublished: true
                          })
                          setSelectedFiles(null)
                          setUploadedImages([])
                        }}
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <nav className="p-4 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="/admin/series" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
              <BookOpen className="w-5 h-5" />
              Series
            </Link>
            <Link href="/admin/chapters" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-600 text-white">
              <BarChart3 className="w-5 h-5" />
              Capítulos
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
              <Users className="w-5 h-5" />
              Usuarios
            </Link>
            <Link href="/admin/comments" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
              <MessageSquare className="w-5 h-5" />
              Comentarios
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Gestión de Capítulos</h1>
                <p className="text-gray-400">Administra los capítulos de la plataforma</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar capítulos..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las series</SelectItem>
                  {series.map((seriesItem) => (
                    <SelectItem key={seriesItem.id} value={seriesItem.id}>
                      {seriesItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chapters List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChapters.map((chapter) => (
                <Card key={chapter.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold text-white">{chapter.title}</h3>
                          <Badge variant="outline" className="border-gray-600 text-white">
                            Cap. {chapter.chapterNumber}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Select
                              value={chapter.isPublished ? 'PUBLISHED' : 'DRAFT'}
                              onValueChange={(value) => handleStatusChange(chapter.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DRAFT">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                    Borrador
                                  </div>
                                </SelectItem>
                                <SelectItem value="PUBLISHED">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                    Publicado
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {chapter.scheduledAt && (
                            <Badge className="bg-blue-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Programado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span>Serie: {chapter.series.title}</span>
                          <span>Publicado: {formatDate(chapter.publishDate)}</span>
                          <span>Vistas: {chapter.views.toLocaleString()}</span>
                          <span>Imágenes: {chapter._count?.images || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                          <Link href={`/chapter/${chapter.id}`} className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            Ver
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(chapter)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(chapter.id)}
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredChapters.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-semibold text-white mb-2">No se encontraron capítulos</h3>
                  <p className="text-gray-400 mb-4">
                    No hay capítulos que coincidan con tus criterios de búsqueda
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Nuevo Capítulo
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}