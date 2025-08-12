import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'popular'
    const search = searchParams.get('search') || ''
    const genreId = searchParams.get('genre') || 'all'
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (genreId !== 'all') {
      where.genres = {
        some: {
          genreId: genreId
        }
      }
    }

    if (status !== 'all') {
      where.status = status
    }

    // Build order by
    let orderBy: any = {}
    switch (sortBy) {
      case 'recent':
        orderBy = { updatedAt: 'desc' }
        break
      case 'rating':
        orderBy = { ratings: { _count: 'desc' } }
        break
      case 'views':
        orderBy = { views: 'desc' }
        break
      case 'popular':
      default:
        orderBy = { views: 'desc' }
        break
    }

    const [series, totalCount] = await Promise.all([
      db.series.findMany({
        where,
        include: {
          genres: {
            include: {
              genre: true
            }
          },
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
        orderBy,
        skip,
        take: limit
      }),
      db.series.count({ where })
    ])

    const seriesWithAvgRating = series.map(seriesItem => {
      const avgRating = seriesItem.ratings.length > 0 
        ? seriesItem.ratings.reduce((sum, rating) => sum + rating.rating, 0) / seriesItem.ratings.length
        : 0
      
      return {
        ...seriesItem,
        avgRating,
        ratings: undefined
      }
    })

    const hasMore = skip + limit < totalCount

    return NextResponse.json({
      series: seriesWithAvgRating,
      hasMore,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      { error: 'Error fetching series' },
      { status: 500 }
    )
  }
}