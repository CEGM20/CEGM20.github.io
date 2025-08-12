import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterNumber: string }> }
) {
  try {
    const { id, chapterNumber } = await params
    const seriesId = id
    const chapterNum = parseInt(chapterNumber)

    // Incrementar vistas del capítulo
    await db.chapter.updateMany({
      where: {
        seriesId,
        chapterNumber: chapterNum
      },
      data: {
        views: {
          increment: 1
        }
      }
    })

    // Incrementar vistas de la serie
    await db.series.update({
      where: { id: seriesId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Vista registrada'
    })

  } catch (error) {
    console.error('Error registering view:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}