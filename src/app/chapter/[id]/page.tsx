'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown,
  Menu,
  X,
  MessageCircle,
  Heart,
  Share2,
  Settings,
  Sun,
  Moon
} from 'lucide-react'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  publishDate: string
  views: number
  series: {
    id: string
    title: string
  }
}

interface ChapterImage {
  id: string
  imageUrl: string
  order: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name?: string
    image?: string
  }
  replies?: Comment[]
}

export default function ChapterViewerPage() {
  const params = useParams()
  const router = useRouter()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [images, setImages] = useState<ChapterImage[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [imageSize, setImageSize] = useState(100) // percentage
  const [newComment, setNewComment] = useState('')
  
  const imagesContainerRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (params.id) {
      fetchChapterData()
    }
  }, [params.id])

  useEffect(() => {
    const handleScroll = () => {
      if (!imagesContainerRef.current) return
      
      const container = imagesContainerRef.current
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      // Find the current image based on scroll position
      for (let i = 0; i < imageRefs.current.length; i++) {
        const imageElement = imageRefs.current[i]
        if (imageElement) {
          const rect = imageElement.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          const relativeTop = rect.top - containerRect.top
          
          if (relativeTop >= -containerHeight / 2 && relativeTop <= containerHeight / 2) {
            setCurrentImageIndex(i)
            break
          }
        }
      }
    }

    const container = imagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [images])

  const fetchChapterData = async () => {
    try {
      setLoading(true)
      const [chapterRes, imagesRes, commentsRes] = await Promise.all([
        fetch(`/api/chapters/${params.id}`),
        fetch(`/api/chapters/${params.id}/images`),
        fetch(`/api/chapters/${params.id}/comments`)
      ])

      if (chapterRes.ok) {
        const chapterData = await chapterRes.json()
        setChapter(chapterData)
      }

      if (imagesRes.ok) {
        const imagesData = await imagesRes.json()
        setImages(imagesData)
        // Initialize image refs
        imageRefs.current = new Array(imagesData.length).fill(null)
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData)
      }
    } catch (error) {
      console.error('Error fetching chapter data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateToChapter = async (direction: 'prev' | 'next') => {
    if (!chapter) return
    
    try {
      const response = await fetch(`/api/chapters/${params.id}/${direction}`)
      if (response.ok) {
        const nextChapter = await response.json()
        router.push(`/chapter/${nextChapter.id}`)
      }
    } catch (error) {
      console.error('Error navigating chapter:', error)
    }
  }

  const scrollToImage = (index: number) => {
    const imageElement = imageRefs.current[index]
    if (imageElement && imagesContainerRef.current) {
      imageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    // TODO: Implement comment submission when auth is ready
    setNewComment('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Capítulo no encontrado</h1>
          <Button onClick={() => router.push('/catalog')}>
            Volver al catálogo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header Controls */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} border-b transition-colors`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="text-sm">
              <Link href={`/series/${chapter.series.id}`} className="hover:underline">
                {chapter.series.title}
              </Link>
              <span className="mx-2">•</span>
              <span>Capítulo {chapter.chapterNumber}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Main Content */}
        <div className="flex-1">
          {/* Navigation Controls */}
          <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToChapter('prev')}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToChapter('next')}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Images Container */}
          <div 
            ref={imagesContainerRef}
            className="overflow-y-auto"
            style={{ height: '100vh' }}
          >
            <div className="max-w-4xl mx-auto p-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  ref={el => imageRefs.current[index] = el}
                  className="mb-4"
                >
                  <img
                    src={image.imageUrl}
                    alt={`Página ${index + 1}`}
                    className="w-full"
                    style={{ 
                      transform: `scale(${imageSize / 100})`,
                      transformOrigin: 'center top'
                    }}
                    onLoad={() => {
                      // Increment view count when image loads
                      if (index === 0) {
                        fetch(`/api/chapters/${params.id}/view`, { method: 'POST' })
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Page Indicator */}
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
            <Card className="bg-black/80 text-white border-white/20">
              <CardContent className="p-2 text-sm">
                {currentImageIndex + 1} / {images.length}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className={`w-80 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} border-l p-4 overflow-y-auto transition-colors`} style={{ height: '100vh' }}>
            <div className="space-y-6">
              {/* Chapter Info */}
              <div>
                <h3 className="font-semibold mb-2">{chapter.title}</h3>
                <p className="text-sm opacity-75">
                  Publicado: {formatDate(chapter.publishDate)}
                </p>
                <p className="text-sm opacity-75">
                  Vistas: {chapter.views.toLocaleString()}
                </p>
              </div>

              {/* Image Size Control */}
              <div>
                <h4 className="font-semibold mb-2">Tamaño de imagen</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageSize(Math.max(50, imageSize - 10))}
                  >
                    -
                  </Button>
                  <span className="text-sm">{imageSize}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImageSize(Math.min(150, imageSize + 10))}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Quick Navigation */}
              <div>
                <h4 className="font-semibold mb-2">Navegación rápida</h4>
                <div className="grid grid-cols-4 gap-1">
                  {images.slice(0, 8).map((_, index) => (
                    <Button
                      key={index}
                      variant={currentImageIndex === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => scrollToImage(index)}
                      className="text-xs"
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Comments Toggle */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Comentarios ({comments.length})
              </Button>

              {/* Comments Section */}
              {showComments && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Comentarios</h4>
                  
                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="space-y-2">
                    <Input
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-sm"
                    />
                    <Button type="submit" size="sm" className="w-full">
                      Comentar
                    </Button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>
                              {comment.user.name?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {comment.user.name || 'Anónimo'}
                              </span>
                              <span className="text-xs opacity-75">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback>
                                    {reply.user.name?.charAt(0) || 'A'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">
                                      {reply.user.name || 'Anónimo'}
                                    </span>
                                    <span className="text-xs opacity-75">
                                      {formatDate(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}