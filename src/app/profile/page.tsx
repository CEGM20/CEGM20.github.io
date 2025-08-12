'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  BookOpen, 
  Star,
  Edit,
  Settings,
  LogOut,
  Eye
} from 'lucide-react'

interface UserProfile {
  id: string
  name?: string
  email: string
  image?: string
  createdAt: string
  emailVerified: boolean
}

interface FollowedSeries {
  id: string
  title: string
  coverImage?: string
  author?: string
  status: string
  lastReadChapter?: number
  unreadChapters?: number
}

interface UserRating {
  id: string
  rating: number
  series: {
    id: string
    title: string
    coverImage?: string
  }
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [followedSeries, setFollowedSeries] = useState<FollowedSeries[]>([])
  const [userRatings, setUserRatings] = useState<UserRating[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setEditForm({
      name: parsedUser.name || '',
      email: parsedUser.email
    })

    fetchUserProfile()
    fetchFollowedSeries()
    fetchUserRatings()
  }, [router])

  const fetchUserProfile = async () => {
    try {
      // TODO: Implement actual user profile fetch
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const fetchFollowedSeries = async () => {
    try {
      // TODO: Implement actual followed series fetch
      setFollowedSeries([])
    } catch (error) {
      console.error('Error fetching followed series:', error)
    }
  }

  const fetchUserRatings = async () => {
    try {
      // TODO: Implement actual user ratings fetch
      setUserRatings([])
    } catch (error) {
      console.error('Error fetching user ratings:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update
      if (user) {
        const updatedUser = { ...user, name: editForm.name, email: editForm.email }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setEditMode(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
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
              <Link href="/profile" className="text-sm font-medium text-red-600">
                Mi Perfil
              </Link>
            </nav>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {editMode ? (
                      <div className="space-y-2">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nombre"
                          className="text-center"
                        />
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Email"
                          className="text-center"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveProfile}>
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold">{user.name || 'Usuario'}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar perfil
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Miembro desde</span>
                    <span className="text-sm">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email verificado</span>
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? "Verificado" : "No verificado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="series" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="series">Series Seguidas</TabsTrigger>
                <TabsTrigger value="ratings">Mis Calificaciones</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>

              <TabsContent value="series" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Series que sigues</h3>
                  <Badge variant="outline">{followedSeries.length} series</Badge>
                </div>

                {followedSeries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {followedSeries.map((series) => (
                      <Card key={series.id} className="group cursor-pointer transition-all hover:shadow-lg">
                        <Link href={`/series/${series.id}`}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-16 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                {series.coverImage ? (
                                  <img 
                                    src={series.coverImage} 
                                    alt={series.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-pink-400">
                                    <span className="text-white text-sm font-bold">{series.title.charAt(0)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold line-clamp-1 mb-1">{series.title}</h4>
                                {series.author && (
                                  <p className="text-xs text-muted-foreground mb-2">{series.author}</p>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${getStatusColor(series.status)} text-white text-xs`}>
                                    {getStatusText(series.status)}
                                  </Badge>
                                  {series.unreadChapters && series.unreadChapters > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {series.unreadChapters} nuevos
                                    </Badge>
                                  )}
                                </div>
                                {series.lastReadChapter && (
                                  <p className="text-xs text-muted-foreground">
                                    Último capítulo leído: {series.lastReadChapter}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aún no sigues ninguna serie</h3>
                    <p className="text-muted-foreground mb-4">
                      Explora nuestro catálogo y encuentra series que te interesen
                    </p>
                    <Link href="/catalog">
                      <Button>Explorar catálogo</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ratings" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tus calificaciones</h3>
                  <Badge variant="outline">{userRatings.length} calificaciones</Badge>
                </div>

                {userRatings.length > 0 ? (
                  <div className="space-y-4">
                    {userRatings.map((rating) => (
                      <Card key={rating.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {rating.series.coverImage ? (
                                  <img 
                                    src={rating.series.coverImage} 
                                    alt={rating.series.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-pink-400">
                                    <span className="text-white text-xs font-bold">{rating.series.title.charAt(0)}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Link href={`/series/${rating.series.id}`} className="font-semibold hover:underline">
                                  {rating.series.title}
                                </Link>
                                <div className="flex items-center gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      className={`w-4 h-4 ${
                                        star <= rating.rating 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-muted-foreground'
                                      }`} 
                                    />
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Calificado el {formatDate(rating.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aún no has calificado ninguna serie</h3>
                    <p className="text-muted-foreground mb-4">
                      Califica las series que lees para ayudar a otros usuarios a descubrir nuevas historias
                    </p>
                    <Link href="/catalog">
                      <Button>Explorar catálogo</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de la cuenta</CardTitle>
                    <CardDescription>
                      Administra tu cuenta y preferencias
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Notificaciones</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Nuevos capítulos</p>
                            <p className="text-sm text-muted-foreground">
                              Recibe notificaciones cuando se publiquen nuevos capítulos de series que sigues
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Configurar
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Respuestas a comentarios</p>
                            <p className="text-sm text-muted-foreground">
                              Notificaciones cuando alguien responda a tus comentarios
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3">Privacidad</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Perfil público</p>
                            <p className="text-sm text-muted-foreground">
                              Permite que otros usuarios vean tu perfil y actividad
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Configurar
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Historial de lectura</p>
                            <p className="text-sm text-muted-foreground">
                              Muestra tu historial de lectura en tu perfil
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Configurar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 text-red-600">Zona de peligro</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                          Eliminar mi cuenta
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}