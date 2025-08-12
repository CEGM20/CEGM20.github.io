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
    const timeRange = searchParams.get('timeRange') || '7d'

    // Calcular fecha de inicio según el rango
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Obtener estadísticas generales
    const [
      totalSeries,
      totalUsers,
      totalChapters,
      totalComments,
      totalViews,
      totalRatings
    ] = await Promise.all([
      db.series.count(),
      db.user.count(),
      db.chapter.count(),
      db.comment.count(),
      db.series.aggregate({ _sum: { views: true } }),
      db.rating.count()
    ])

    // Calcular calificación promedio
    const ratingsResult = await db.rating.aggregate({
      _avg: { rating: true }
    })
    const avgRating = ratingsResult._avg.rating || 0

    // Obtener series más populares
    const topSeries = await db.series.findMany({
      include: {
        _count: {
          select: {
            chapters: true,
            follows: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 10
    })

    // Calcular calificaciones promedio para cada serie
    const topSeriesWithRatings = topSeries.map(series => {
      const avgRating = series.ratings.length > 0 
        ? series.ratings.reduce((sum, rating) => sum + rating.rating, 0) / series.ratings.length 
        : 0
      
      return {
        id: series.id,
        title: series.title,
        views: series.views,
        avgRating,
        chapters: series._count.chapters,
        follows: series._count.follows
      }
    })

    // Obtener géneros más populares
    const genreStats = await db.seriesGenre.groupBy({
      by: ['genreId'],
      _count: {
        genreId: true
      },
      orderBy: {
        _count: {
          genreId: 'desc'
        }
      },
      take: 10
    })

    const topGenres = await Promise.all(
      genreStats.map(async (stat) => {
        const genre = await db.genre.findUnique({
          where: { id: stat.genreId }
        })
        return {
          name: genre?.name || 'Desconocido',
          count: stat._count.genreId
        }
      })
    )

    // Obtener actividad reciente
    const recentActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const startOfDay = new Date(date.setHours(0, 0, 0, 0))
      const endOfDay = new Date(date.setHours(23, 59, 59, 999))

      const [
        newUsers,
        newSeries,
        newComments,
        dailyViews
      ] = await Promise.all([
        db.user.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        db.series.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        db.comment.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        db.series.aggregate({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          },
          _sum: {
            views: true
          }
        })
      ])

      recentActivity.push({
        date: startOfDay.toISOString(),
        newUsers,
        newSeries,
        newComments,
        views: dailyViews._sum.views || 0
      })
    }

    return NextResponse.json({
      totalSeries,
      totalUsers,
      totalChapters,
      totalComments,
      totalViews: totalViews._sum.views || 0,
      totalRatings,
      avgRating,
      topSeries: topSeriesWithRatings,
      topGenres,
      recentActivity
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}