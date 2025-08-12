import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

// OJO: Las siguientes importaciones son para manejar archivos locales.
// NO funcionarán en Vercel y no son necesarias con Cloudinary.
import { rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// --- FUNCIÓN DELETE CON LA CORRECCIÓN DEFINITIVA ---
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } // CAMBIO CLAVE AQUÍ: Recibimos 'context' completo
) {
  try {
    const { id: chapterId } = context.params; // Y lo desarmamos aquí adentro.

    // Verificar autenticación de administrador
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { images: true },
    });

    if (!chapter) {
      return NextResponse.json({ message: 'Capítulo no encontrado' }, { status: 404 });
    }

    // --- LÓGICA DE BORRADO DE IMÁGENES ---
    // He comentado esta sección porque NO funcionará en Vercel con Cloudinary.
    // La solución real es llamar a la API de Cloudinary para borrar las imágenes.
    /*
    for (const image of chapter.images) {
      const imagePath = join(process.cwd(), 'public', image.imageUrl);
      if (existsSync(imagePath)) {
        await rm(imagePath);
      }
    }
    const chapterDir = join(process.cwd(), 'public', 'uploads', 'chapters', chapterId);
    if (existsSync(chapterDir)) {
      await rm(chapterDir, { recursive: true });
    }
    */

    // Eliminar registros de la base de datos
    await db.chapterImage.deleteMany({
      where: { chapterId },
    });

    await db.chapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({
      message: 'Capítulo eliminado exitosamente',
    });

  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// --- FUNCIÓN PATCH CON LA MISMA CORRECCIÓN ---
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } } // CAMBIO CLAVE AQUÍ: Recibimos 'context' completo
) {
  try {
    const { id: chapterId } = context.params; // Y lo desarmamos aquí adentro.

    // Verificar autenticación de administrador
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { status, publishDate, scheduledDate } = await request.json();

    const existingChapter = await db.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!existingChapter) {
      return NextResponse.json({ message: 'Capítulo no encontrado' }, { status: 404 });
    }

    const updateData: any = {
      isPublished: status === 'PUBLISHED',
      scheduledAt: status === 'SCHEDULED' ? (scheduledDate ? new Date(scheduledDate) : existingChapter.scheduledAt) : null,
    };

    if (publishDate) {
      updateData.publishDate = new Date(publishDate);
    }

    const updatedChapter = await db.chapter.update({
      where: { id: chapterId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Capítulo actualizado exitosamente',
      chapter: updatedChapter,
    });

  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}