'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  BookOpen, 
  Settings,
  Share,
  Heart,
  Eye,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  publishDate: string
  views: number
  description?: string
  series: {
    id: string
    title: string
    author: string
    status: string
  }
  images: Array<{
    id: string
    imageUrl: string
    order: number
  }>
  chaptersList: Array<{
    id: string
    chapterNumber: number
    title: string
  }>
}

export default function ChapterReaderPage() {
  const params = useParams()
  const router = useRouter()
  const seriesId = params.id as string
  const chapterNumber = parseInt(params.chapterNumber as string)
  
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [readingSettings, setReadingSettings] = useState({
    fitWidth: true,
    showControls: true,
    darkMode: false
  })

  useEffect(() => {
    fetchChapter()
  }, [seriesId, chapterNumber])

  const fetchChapter = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/series/${seriesId}/chapters/${chapterNumber}`)
      
      if (response.ok) {
        const data = await response.json()
        setChapter(data)
        setCurrentImageIndex(0)
      } else if (response.status === 404) {
        setError('Capítulo no encontrado')
      } else {
        setError('Error al cargar el capítulo')
      }
    } catch (error) {
      console.error('Error fetching chapter:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevChapter = () => {
    if (!chapter) return
    
    const currentIndex = chapter.chaptersList.findIndex(c => c.chapterNumber === chapterNumber)
    if (currentIndex > 0) {
      const prevChapter = chapter.chaptersList[currentIndex - 1]
      router.push(`/series/${seriesId}/${prevChapter.chapterNumber}`)
    }
  }

  const handleNextChapter = () => {
    if (!chapter) return
    
    const currentIndex = chapter.chaptersList.findIndex(c => c.chapterNumber === chapterNumber)
    if (currentIndex < chapter.chaptersList.length - 1) {
      const nextChapter = chapter.chaptersList[currentIndex + 1]
      router.push(`/series/${seriesId}/${nextChapter.chapterNumber}`)
    }
  }

  const handleChapterSelect = (selectedChapterNumber: string) => {
    router.push(`/series/${seriesId}/${selectedChapterNumber}`)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!chapter) return
    
    switch (e.key) {
      case 'ArrowLeft':
        if (currentImageIndex > 0) {
          setCurrentImageIndex(prev => prev - 1)
        } else {
          handlePrevChapter()
        }
        break
      case 'ArrowRight':
        if (currentImageIndex < chapter.images.length - 1) {
          setCurrentImageIndex(prev => prev + 1)
        } else {
          handleNextChapter()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })
        break
      case 'ArrowDown':
        e.preventDefault()
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
        break
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [chapter, currentImageIndex])

  const handleImageLoad = () => {
    // Incrementar vistas cuando se carga la primera imagen
    if (currentImageIndex === 0 && chapter) {
      fetch(`/api/series/${seriesId}/chapters/${chapterNumber}/view`, {
        method: 'POST'
      }).catch(console.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 text-white">
          <CardContent className="p-8 text-center">
            <p className="text-xl mb-4">{error || 'Capítulo no encontrado'}</p>
            <Link href={`/series/${seriesId}`}>
              <Button>Volver a la serie</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentIndex = chapter.chaptersList.findIndex(c => c.chapterNumber === chapterNumber)
  const hasNext = currentIndex < chapter.chaptersList.length - 1
  const hasPrev = currentIndex > 0

  return (
    <div className={`min-h-screen ${readingSettings.darkMode ? 'bg-black' : 'bg-gray-900'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${
        readingSettings.darkMode ? 'bg-black/90' : 'bg-gray-800/90'
      } backdrop-blur-sm border-b border-gray-700`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/series/${seriesId}`}>
                <Button variant="ghost" size="sm" className="text-white hover:text-gray-300">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
              </Link>
              <div className="text-white">
                <h1 className="font-semibold">{chapter.series.title}</h1>
                <p className="text-sm text-gray-300">
                  Cap. {chapter.chapterNumber} - {chapter.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-white text-sm">
                {currentImageIndex + 1} / {chapter.images.length}
              </div>
              
              <Select value={chapterNumber.toString()} onValueChange={handleChapterSelect}>
                <SelectTrigger className="w-40 bg-gray-700 text-white border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chapter.chaptersList.map((ch) => (
                    <SelectItem key={ch.id} value={ch.chapterNumber.toString()}>
                      Cap. {ch.chapterNumber} - {ch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-40 bg-gray-800 rounded-lg p-4 shadow-xl">
          <h3 className="text-white font-medium mb-3">Configuración de Lectura</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                checked={readingSettings.fitWidth}
                onChange={(e) => setReadingSettings(prev => ({ ...prev, fitWidth: e.target.checked }))}
                className="rounded"
              />
              Ajustar al ancho
            </label>
            <label className="flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                checked={readingSettings.showControls}
                onChange={(e) => setReadingSettings(prev => ({ ...prev, showControls: e.target.checked }))}
                className="rounded"
              />
              Mostrar controles
            </label>
            <label className="flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                checked={readingSettings.darkMode}
                onChange={(e) => setReadingSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                className="rounded"
              />
              Modo oscuro
            </label>
          </div>
        </div>
      )}

      {/* Chapter Info */}
      <div className="pt-20 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className={`rounded-lg p-4 ${
            readingSettings.darkMode ? 'bg-gray-800' : 'bg-gray-700'
          }`}>
            <h2 className={`text-xl font-bold mb-2 ${
              readingSettings.darkMode ? 'text-white' : 'text-gray-100'
            }`}>
              {chapter.title}
            </h2>
            {chapter.description && (
              <p className={`text-sm mb-3 ${
                readingSettings.darkMode ? 'text-gray-300' : 'text-gray-200'
              }`}>
                {chapter.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-1 ${
                readingSettings.darkMode ? 'text-gray-400' : 'text-gray-300'
              }`}>
                <Calendar className="w-4 h-4" />
                {new Date(chapter.publishDate).toLocaleDateString('es-ES')}
              </div>
              <div className={`flex items-center gap-1 ${
                readingSettings.darkMode ? 'text-gray-400' : 'text-gray-300'
              }`}>
                <Eye className="w-4 h-4" />
                {chapter.views.toLocaleString()} vistas
              </div>
              <Badge className={
                readingSettings.darkMode 
                  ? 'bg-green-600 text-white' 
                  : 'bg-green-500 text-white'
              }>
                {chapter.series.status === 'ONGOING' ? 'En emisión' : 
                 chapter.series.status === 'COMPLETED' ? 'Completado' :
                 chapter.series.status === 'HIATUS' ? 'Pausa' : 'Cancelado'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Images Container */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="space-y-2">
          {chapter.images.map((image, index) => (
            <div key={image.id} className="relative">
              <img
                src={image.imageUrl}
                alt={`Página ${index + 1}`}
                className={`w-full ${
                  readingSettings.fitWidth ? 'max-w-full' : 'max-w-none'
                } h-auto block mx-auto rounded-lg ${
                  readingSettings.darkMode ? 'bg-black' : 'bg-gray-800'
                }`}
                onLoad={index === 0 ? handleImageLoad : undefined}
                onError={() => {
                  console.error(`Error loading image: ${image.imageUrl}`)
                }}
              />
              
              {readingSettings.showControls && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={`fixed bottom-0 left-0 right-0 ${
        readingSettings.darkMode ? 'bg-black/90' : 'bg-gray-800/90'
      } backdrop-blur-sm border-t border-gray-700`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevChapter}
              disabled={!hasPrev}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <div className="text-white text-sm">
              Cap. {chapter.chapterNumber} de {chapter.chaptersList.length}
            </div>
            
            <Button
              variant="outline"
              onClick={handleNextChapter}
              disabled={!hasNext}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard Controls Hint */}
      <div className="fixed bottom-20 left-4 bg-black/70 text-white px-3 py-2 rounded text-xs">
        Usa las flechas para navegar
      </div>
    </div>
  )
}