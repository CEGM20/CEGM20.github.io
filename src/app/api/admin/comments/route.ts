import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

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
    const status = searchParams.get('status') || 'ALL'

    const skip = (page - 1) * limit

    // Construir where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' as const } },
        { user: { username: { contains: search, mode: 'insensitive' as const } } },
        { series: { title: { contains: search, mode: 'insensitive' as const } } }
      ]
    }

    if (status !== 'ALL') {
      where.status = status
    }

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          series: {
            select: {
              id: true,
              title: true
            }
          },
          chapter: {
            select: {
              id: true,
              chapterNumber: true
            }
          },
          parentComment: {
            select: {
              id: true,
              content: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.comment.count({ where })
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}