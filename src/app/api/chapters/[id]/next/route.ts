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

    const nextChapter = await db.chapter.findFirst({
      where: {
        seriesId: currentChapter.seriesId,
        chapterNumber: {
          gt: currentChapter.chapterNumber
        },
        isPublished: true
      },
      orderBy: {
        chapterNumber: 'asc'
      }
    })

    if (!nextChapter) {
      return NextResponse.json(
        { error: 'No next chapter found' },
        { status: 404 }
      )
    }

    return NextResponse.json(nextChapter)
  } catch (error) {
    console.error('Error fetching next chapter:', error)
    return NextResponse.json(
      { error: 'Error fetching next chapter' },
      { status: 500 }
    )
  }
}