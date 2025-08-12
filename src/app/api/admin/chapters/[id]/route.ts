import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { rm } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    const chapterId = params.id

    // Obtener información del capítulo para eliminar archivos
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: {
        images: true
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { message: 'Capítulo no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar archivos de imágenes del sistema de archivos
    for (const image of chapter.images) {
      const imagePath = join(process.cwd(), 'public', image.imageUrl)
      if (existsSync(imagePath)) {
        await rm(imagePath)
      }
    }

    // Eliminar directorio del capítulo si existe
    const chapterDir = join(process.cwd(), 'public', 'uploads', 'chapters', chapterId)
    if (existsSync(chapterDir)) {
      await rm(chapterDir, { recursive: true })
    }

    // Eliminar registros de la base de datos
    await db.chapterImage.deleteMany({
      where: { chapterId }
    })

    await db.chapter.delete({
      where: { id: chapterId }
    })

    return NextResponse.json({
      message: 'Capítulo eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting chapter:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const chapterId = params.id
    const { status, publishDate, scheduledDate } = await request.json()

    // Obtener el capítulo actual
    const existingChapter = await db.chapter.findUnique({
      where: { id: chapterId }
    })

    if (!existingChapter) {
      return NextResponse.json(
        { message: 'Capítulo no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {
      isPublished: status === 'PUBLISHED',
      scheduledAt: status === 'SCHEDULED' ? (scheduledDate ? new Date(scheduledDate) : existingChapter.scheduledAt) : null
    }

    if (publishDate) {
      updateData.publishDate = new Date(publishDate)
    }

    // Actualizar el capítulo
    const updatedChapter = await db.chapter.update({
      where: { id: chapterId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Capítulo actualizado exitosamente',
      chapter: updatedChapter
    })

  } catch (error) {
    console.error('Error updating chapter:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}