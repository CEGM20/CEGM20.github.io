import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params

    // Eliminar respuestas primero
    await db.comment.deleteMany({
      where: { parentCommentId: id }
    })

    // Eliminar el comentario
    await db.comment.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Comentario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}