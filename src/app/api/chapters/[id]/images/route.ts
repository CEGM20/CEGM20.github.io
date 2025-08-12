import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const images = await db.chapterImage.findMany({
      where: {
        chapterId: params.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching chapter images:', error)
    return NextResponse.json(
      { error: 'Error fetching chapter images' },
      { status: 500 }
    )
  }
}