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

    // Eliminar relaciones primero
    await db.rating.deleteMany({
      where: { userId: id }
    })

    await db.comment.deleteMany({
      where: { userId: id }
    })

    await db.follow.deleteMany({
      where: { userId: id }
    })

    await db.readHistory.deleteMany({
      where: { userId: id }
    })

    // Eliminar el usuario
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Usuario eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}