import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const recentSeries = await db.series.findMany({
      include: {
        _count: {
          select: {
            chapters: true,
            ratings: true,
            follows: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        },
        chapters: {
          orderBy: {
            publishDate: 'desc'
          },
          take: 1,
          select: {
            publishDate: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 12
    })

    const seriesWithAvgRating = recentSeries.map(series => {
      const avgRating = series.ratings.length > 0 
        ? series.ratings.reduce((sum, rating) => sum + rating.rating, 0) / series.ratings.length
        : 0
      
      return {
        ...series,
        avgRating,
        ratings: undefined,
        chapters: undefined
      }
    })

    return NextResponse.json(seriesWithAvgRating)
  } catch (error) {
    console.error('Error fetching recent series:', error)
    return NextResponse.json(
      { error: 'Error fetching recent series' },
      { status: 500 }
    )
  }
}