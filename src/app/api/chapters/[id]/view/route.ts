import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.chapter.update({
      where: {
        id: params.id
      },
      data: {
        views: {
          increment: 1
        }
      }
    })

    // Also update series views
    const chapter = await db.chapter.findUnique({
      where: { id: params.id },
      select: { seriesId: true }
    })

    if (chapter) {
      await db.series.update({
        where: {
          id: chapter.seriesId
        },
        data: {
          views: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating view count:', error)
    return NextResponse.json(
      { error: 'Error updating view count' },
      { status: 500 }
    )
  }
}