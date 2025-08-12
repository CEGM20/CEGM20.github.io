import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'

// Configuración por defecto
const defaultSettings = {
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
}

// En una aplicación real, esto se guardaría en una base de datos
// Para este ejemplo, usaremos un objeto en memoria
let currentSettings = { ...defaultSettings }

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de administrador
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    return NextResponse.json(currentSettings)

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación de administrador
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const settings = await request.json()

    // Validar datos básicos
    if (!settings.siteName || !settings.siteUrl) {
      return NextResponse.json(
        { message: 'Nombre del sitio y URL son requeridos' },
        { status: 400 }
      )
    }

    // Actualizar configuración
    currentSettings = {
      ...defaultSettings,
      ...settings,
      theme: {
        ...defaultSettings.theme,
        ...settings.theme
      },
      seo: {
        ...defaultSettings.seo,
        ...settings.seo
      }
    }

    return NextResponse.json({
      message: 'Configuración actualizada exitosamente',
      settings: currentSettings
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}