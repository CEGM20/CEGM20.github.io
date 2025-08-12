import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación de administrador
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Eliminar relaciones primero (géneros, capítulos, etc.)
    await db.seriesGenre.deleteMany({
      where: { seriesId: id }
    })

    await db.chapter.deleteMany({
      where: { seriesId: id }
    })

    await db.rating.deleteMany({
      where: { seriesId: id }
    })

    await db.follow.deleteMany({
      where: { seriesId: id }
    })

    await db.comment.deleteMany({
      where: { seriesId: id }
    })

    await db.readHistory.deleteMany({
      where: { seriesId: id }
    })

    // Eliminar la serie
    await db.series.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Serie eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting series:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}