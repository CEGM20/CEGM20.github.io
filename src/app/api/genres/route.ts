import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const genres = await db.genre.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(genres)
  } catch (error) {
    console.error('Error fetching genres:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}