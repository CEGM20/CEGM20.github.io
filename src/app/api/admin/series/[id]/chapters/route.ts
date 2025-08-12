import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación de administrador
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'ALL'
    const sortBy = searchParams.get('sortBy') || 'chapterNumber'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Construir where clause
    const where: any = { seriesId: id }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } }
      ]
    }

    if (status !== 'ALL') {
      if (status === 'PUBLISHED') {
        where.isPublished = true
      } else if (status === 'DRAFT') {
        where.isPublished = false
      }
    }

    const chapters = await db.chapter.findMany({
      where,
      include: {
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc'
      }
    })

    return NextResponse.json({
      chapters
    })

  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación de administrador
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { title, chapterNumber, status, publishDate, scheduledDate } = await request.json()

    if (!title || !chapterNumber) {
      return NextResponse.json(
        { message: 'Título y número de capítulo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un capítulo con ese número
    const existingChapter = await db.chapter.findFirst({
      where: {
        seriesId: id,
        chapterNumber: parseInt(chapterNumber)
      }
    })

    if (existingChapter) {
      return NextResponse.json(
        { message: 'Ya existe un capítulo con ese número' },
        { status: 400 }
      )
    }

    // Crear el capítulo
    const chapter = await db.chapter.create({
      data: {
        title,
        chapterNumber: parseInt(chapterNumber),
        publishDate: new Date(publishDate),
        scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
        isPublished: status === 'PUBLISHED',
        seriesId: id
      }
    })

    return NextResponse.json({
      message: 'Capítulo creado exitosamente',
      chapter
    })

  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}