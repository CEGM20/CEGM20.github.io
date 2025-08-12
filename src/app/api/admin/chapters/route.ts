import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const chapters = await db.chapter.findMany({
      include: {
        series: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json(
      { error: 'Error fetching chapters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, chapterNumber, seriesId, publishDate, scheduledAt, isPublished, images } = await request.json()

    if (!title || !chapterNumber || !seriesId) {
      return NextResponse.json(
        { error: 'Title, chapter number, and series ID are required' },
        { status: 400 }
      )
    }

    // Check if series exists
    const series = await db.series.findUnique({
      where: { id: seriesId }
    })

    if (!series) {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      )
    }

    const newChapter = await db.chapter.create({
      data: {
        title,
        chapterNumber,
        seriesId,
        publishDate: new Date(publishDate),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isPublished: isPublished !== false
      }
    })

    // Create chapter images if provided
    if (images && images.length > 0) {
      for (const image of images) {
        await db.chapterImage.create({
          data: {
            chapterId: newChapter.id,
            imageUrl: image.imageUrl,
            order: image.order
          }
        })
      }
    }

    // Fetch the created chapter with relations
    const createdChapter = await db.chapter.findUnique({
      where: { id: newChapter.id },
      include: {
        series: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            images: true
          }
        }
      }
    })

    return NextResponse.json(createdChapter)
  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json(
      { error: 'Error creating chapter' },
      { status: 500 }
    )
  }
}