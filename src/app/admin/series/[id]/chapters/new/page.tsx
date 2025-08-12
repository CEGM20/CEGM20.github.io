'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { 
  ArrowLeft, 
  Save,
  Upload,
  Calendar,
  Clock,
  BookOpen,
  Image as ImageIcon,
  Plus,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Series {
  id: string
  title: string
  author: string
}

interface ChapterPreview {
  id: string
  title: string
  chapterNumber: number
}

export default function NewChapterPage() {
  const { isAdmin, isLoading } = useAdminAuth()
  const router = useRouter()
  const params = useParams()
  const seriesId = params.id as string
  
  const [series, setSeries] = useState<Series | null>(null)
  const [existingChapters, setExistingChapters] = useState<ChapterPreview[]>([])
  const [formData, setFormData] = useState({
    title: '',
    chapterNumber: '',
    status: 'PUBLISHED',
    publishDate: new Date().toISOString().slice(0, 16),
    scheduledDate: '',
    isPublished: true
  })
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin && seriesId) {
      fetchSeries()
      fetchExistingChapters()
    }
  }, [isAdmin, seriesId])

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

  const fetchExistingChapters = async () => {
    try {
      const response = await fetch(`/api/admin/series/${seriesId}/chapters?sortBy=chapterNumber&sortOrder=desc`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExistingChapters(data.chapters)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validar archivos
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!validTypes.includes(file.type)) {
        setError(`El archivo ${file.name} no es una imagen válida`)
        return false
      }
      
      if (file.size > maxSize) {
        setError(`El archivo ${file.name} es demasiado grande (máximo 10MB)`)
        return false
      }
      
      return true
    })
    
    setSelectedFiles(prev => [...prev, ...validFiles])
    setError('')
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      // Validar formulario
      if (!formData.title || !formData.chapterNumber) {
        setError('Título y número de capítulo son requeridos')
        setIsUploading(false)
        return
      }

      if (selectedFiles.length === 0) {
        setError('Debes seleccionar al menos una imagen para el capítulo')
        setIsUploading(false)
        return
      }

      // Crear capítulo
      const chapterResponse = await fetch(`/api/admin/series/${seriesId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          title: formData.title,
          chapterNumber: parseInt(formData.chapterNumber),
          status: formData.status,
          publishDate: formData.publishDate,
          scheduledDate: formData.scheduledDate || null
        })
      })

      if (!chapterResponse.ok) {
        const errorData = await chapterResponse.json()
        setError(errorData.message || 'Error al crear el capítulo')
        setIsUploading(false)
        return
      }

      const chapterData = await chapterResponse.json()

      // Subir imágenes
      const formDataUpload = new FormData()
      selectedFiles.forEach((file) => {
        formDataUpload.append('images', file)
      })

      const uploadResponse = await fetch(`/api/admin/chapters/${chapterData.chapter.id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formDataUpload
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        setError(errorData.message || 'Error al subir las imágenes')
        setIsUploading(false)
        return
      }

      setSuccess('Capítulo creado e imágenes subidas exitosamente')
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/admin/series/${seriesId}/chapters`)
      }, 2000)

    } catch (error) {
      console.error('Error creating chapter:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
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
              <Link href={`/admin/series/${seriesId}/chapters`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Capítulos
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Capítulo</h1>
                {series && (
                  <p className="text-sm text-gray-600">
                    {series.title} - {series.author}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Capítulo</CardTitle>
            <CardDescription>
              Completa los datos para crear un nuevo capítulo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded-md">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Capítulo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ej: El comienzo de todo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapterNumber">Número de Capítulo *</Label>
                  <Input
                    id="chapterNumber"
                    type="number"
                    value={formData.chapterNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: e.target.value }))}
                    required
                    placeholder="1"
                    min="1"
                  />
                  {existingChapters.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Último capítulo: {existingChapters[0]?.chapterNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="SCHEDULED">Programado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publishDate">Fecha de Publicación</Label>
                  <Input
                    id="publishDate"
                    type="datetime-local"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                  />
                </div>
              </div>

              {formData.status === 'SCHEDULED' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Fecha Programada</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Imágenes del Capítulo *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Haz clic para subir</span> o arrastra y suelta
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, WebP hasta 10MB cada uno
                      </div>
                    </label>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Archivos Seleccionados ({selectedFiles.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Link href={`/admin/series/${seriesId}/chapters`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isUploading || selectedFiles.length === 0}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando Capítulo...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Capítulo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}