import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; chapterNumber: string }> }
) {
  try {
    const { id, chapterNumber } = await params
    const seriesId = id
    const chapterNum = parseInt(chapterNumber)

    // Obtener el capítulo
    const chapter = await db.chapter.findFirst({
      where: {
        seriesId,
        chapterNumber: chapterNum
      },
      include: {
        series: {
          select: {
            id: true,
            title: true,
            author: true,
            status: true
          }
        },
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { message: 'Capítulo no encontrado' },
        { status: 404 }
      )
    }

    // Obtener lista de capítulos para navegación
    const chaptersList = await db.chapter.findMany({
      where: {
        seriesId
      },
      select: {
        id: true,
        chapterNumber: true,
        title: true
      },
      orderBy: {
        chapterNumber: 'asc'
      }
    })

    return NextResponse.json({
      ...chapter,
      chaptersList
    })

  } catch (error) {
    console.error('Error fetching chapter:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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