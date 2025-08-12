import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const series = await db.series.findUnique({
      where: { id },
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        chapters: {
          where: {
            isPublished: true
          },
          orderBy: {
            chapterNumber: 'asc'
          }
        },
        _count: {
          select: {
            chapters: true,
            ratings: true,
            follows: true,
            comments: true
          }
        }
      }
    })

    if (!series) {
      return NextResponse.json(
        { message: 'Serie no encontrada' },
        { status: 404 }
      )
    }

    // Calcular calificación promedio
    const ratings = await db.rating.findMany({
      where: { seriesId: id },
      select: { rating: true }
    })

    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0

    return NextResponse.json({
      ...series,
      avgRating
    })

  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}