import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { SeriesStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación de administrador
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { title, description, author, status, isFeatured, coverImage, genres } = await request.json()

    if (!title || !author) {
      return NextResponse.json(
        { message: 'Título y autor son requeridos' },
        { status: 400 }
      )
    }

    // Crear la serie
    const series = await db.series.create({
      data: {
        title,
        description: description || null,
        author,
        status: status || SeriesStatus.ONGOING,
        isFeatured: isFeatured || false,
        coverImage: coverImage || null
      }
    })

    // Asignar géneros si se proporcionaron
    if (genres && genres.length > 0) {
      await db.seriesGenre.createMany({
        data: genres.map((genreId: string) => ({
          seriesId: series.id,
          genreId
        }))
      })
    }

    return NextResponse.json({
      message: 'Serie creada exitosamente',
      series: {
        id: series.id,
        title: series.title,
        description: series.description,
        author: series.author,
        status: series.status,
        isFeatured: series.isFeatured,
        coverImage: series.coverImage,
        createdAt: series.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating series:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Construir where clause para búsqueda
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { author: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const [series, total] = await Promise.all([
      db.series.findMany({
        where,
        include: {
          _count: {
            select: {
              chapters: true,
              ratings: true,
              follows: true,
              comments: true
            }
          },
          genres: {
            include: {
              genre: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.series.count({ where })
    ])

    return NextResponse.json({
      series,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}