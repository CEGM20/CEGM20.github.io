'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Settings, 
  Save,
  RefreshCw,
  Globe,
  Mail,
  Image,
  Palette,
  Shield,
  Bell
} from 'lucide-react'
import Link from 'next/link'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  defaultLanguage: string
  itemsPerPage: number
  maxFileSize: number
  allowedImageTypes: string[]
  enableComments: boolean
  moderateComments: boolean
  enableRatings: boolean
  enableRegistration: boolean
  requireEmailVerification: boolean
  maintenanceMode: boolean
  maintenanceMessage: string
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
}

export default function SettingsPage() {
  const { isAdmin, isLoading } = useAdminAuth()
  const router = useRouter()
  
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'CEGM',
    siteDescription: 'Plataforma de webtoons y manhwas',
    siteUrl: 'https://webtoonverse.com',
    adminEmail: 'admin@webtoonverse.com',
    defaultLanguage: 'es',
    itemsPerPage: 12,
    maxFileSize: 5,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    enableComments: true,
    moderateComments: true,
    enableRatings: true,
    enableRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    maintenanceMessage: 'El sitio está en mantenimiento. Vuelve pronto.',
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b'
    },
    seo: {
      metaTitle: 'CEGM - Los mejores webtoons y manhwas',
      metaDescription: 'Descubre y lee los mejores webtoons y manhwas online. Actualizaciones diarias.',
      keywords: ['webtoon', 'manhwa', 'manga', 'cómics', 'lectura online']
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoading, router])

  useEffect(() => {
    if (isAdmin) {
      fetchSettings()
    }
  }, [isAdmin])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        console.error('Error fetching settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuración guardada exitosamente' })
      } else {
        setMessage({ type: 'error', text: 'Error al guardar la configuración' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setSaving(false)
    }
  }

  const handleKeywordAdd = (keyword: string) => {
    if (keyword && !settings.seo.keywords.includes(keyword)) {
      setSettings(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keyword]
        }
      }))
    }
  }

  const handleKeywordRemove = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }))
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
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            </div>
            <Button onClick={fetchSettings} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Recargar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Configuración básica del sitio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL del Sitio</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email del Administrador</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Idioma Predeterminado</Label>
                  <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultLanguage: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" alt="" />
                Configuración de Contenido
              </CardTitle>
              <CardDescription>
                Configuración relacionada con el contenido y archivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemsPerPage">Elementos por Página</Label>
                  <Input
                    id="itemsPerPage"
                    type="number"
                    value={settings.itemsPerPage}
                    onChange={(e) => setSettings(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipos de Imagen Permitidos</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.allowedImageTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Características
              </CardTitle>
              <CardDescription>
                Habilitar o deshabilitar características del sitio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableComments"
                      checked={settings.enableComments}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableComments: !!checked }))}
                    />
                    <Label htmlFor="enableComments">Habilitar Comentarios</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="moderateComments"
                      checked={settings.moderateComments}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, moderateComments: !!checked }))}
                      disabled={!settings.enableComments}
                    />
                    <Label htmlFor="moderateComments">Moderar Comentarios</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableRatings"
                      checked={settings.enableRatings}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableRatings: !!checked }))}
                    />
                    <Label htmlFor="enableRatings">Habilitar Calificaciones</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableRegistration"
                      checked={settings.enableRegistration}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableRegistration: !!checked }))}
                    />
                    <Label htmlFor="enableRegistration">Habilitar Registro</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireEmailVerification"
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: !!checked }))}
                      disabled={!settings.enableRegistration}
                    />
                    <Label htmlFor="requireEmailVerification">Verificar Email</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Modo Mantenimiento
              </CardTitle>
              <CardDescription>
                Configuración del modo de mantenimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: !!checked }))}
                />
                <Label htmlFor="maintenanceMode">Activar Modo Mantenimiento</Label>
              </div>
              
              {settings.maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Mensaje de Mantenimiento</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                SEO y Meta Datos
              </CardTitle>
              <CardDescription>
                Configuración para optimización de motores de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaTitle: e.target.value } 
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    seo: { ...prev.seo, metaDescription: e.target.value } 
                  }))}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Palabras Clave</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings.seo.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="cursor-pointer">
                      {keyword}
                      <button 
                        type="button"
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-2 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Añadir palabra clave"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleKeywordAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Añadir palabra clave"]') as HTMLInputElement
                      if (input?.value) {
                        handleKeywordAdd(input.value)
                        input.value = ''
                      }
                    }}
                    variant="outline"
                  >
                    Añadir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}