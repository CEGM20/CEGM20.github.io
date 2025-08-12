import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentChapter = await db.chapter.findUnique({
      where: {
        id: params.id
      },
      select: {
        chapterNumber: true,
        seriesId: true
      }
    })

    if (!currentChapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    const previousChapter = await db.chapter.findFirst({
      where: {
        seriesId: currentChapter.seriesId,
        chapterNumber: {
          lt: currentChapter.chapterNumber
        },
        isPublished: true
      },
      orderBy: {
        chapterNumber: 'desc'
      }
    })

    if (!previousChapter) {
      return NextResponse.json(
        { error: 'No previous chapter found' },
        { status: 404 }
      )
    }

    return NextResponse.json(previousChapter)
  } catch (error) {
    console.error('Error fetching previous chapter:', error)
    return NextResponse.json(
      { error: 'Error fetching previous chapter' },
      { status: 500 }
    )
  }
}