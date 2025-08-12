import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const popularSeries = await db.series.findMany({
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
        }
      },
      orderBy: {
        views: 'desc'
      },
      take: 12
    })

    const seriesWithAvgRating = popularSeries.map(series => {
      const avgRating = series.ratings.length > 0 
        ? series.ratings.reduce((sum, rating) => sum + rating.rating, 0) / series.ratings.length
        : 0
      
      return {
        ...series,
        avgRating,
        ratings: undefined
      }
    })

    return NextResponse.json(seriesWithAvgRating)
  } catch (error) {
    console.error('Error fetching popular series:', error)
    return NextResponse.json(
      { error: 'Error fetching popular series' },
      { status: 500 }
    )
  }
}