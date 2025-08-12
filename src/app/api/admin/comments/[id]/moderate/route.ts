import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function POST(
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
    const { action, note } = await request.json()

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { message: 'Acción inválida' },
        { status: 400 }
      )
    }

    // Actualizar el estado del comentario
    const updatedComment = await db.comment.update({
      where: { id },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        series: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Aquí podrías agregar lógica para enviar notificaciones al usuario
    // o guardar la nota de moderación en una tabla separada

    return NextResponse.json({
      message: `Comentario ${action === 'APPROVE' ? 'aprobado' : 'rechazado'} exitosamente`,
      comment: updatedComment
    })

  } catch (error) {
    console.error('Error moderating comment:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}