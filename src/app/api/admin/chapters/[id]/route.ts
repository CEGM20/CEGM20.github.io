import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

// OJO: Las siguientes importaciones son para manejar archivos locales.
// NO funcionarán en Vercel y no son necesarias con Cloudinary.
// Las dejamos por ahora, pero la lógica que las usa será comentada.
import { rm } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// --- FUNCIÓN DELETE CORREGIDA Y OPTIMIZADA ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Esta es la firma correcta
) {
  try {
    // Verificar autenticación de administrador
    const admin = await getAdminFromRequest(request); // Añadido 'await' por si la función es asíncrona
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const chapterId = params.id;

    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { images: true },
    });

    if (!chapter) {
      return NextResponse.json({ message: 'Capítulo no encontrado' }, { status: 404 });
    }

    // --- LÓGICA DE BORRADO DE IMÁGENES ---
    // ¡IMPORTANTE! El código original intenta borrar archivos del servidor.
    // Esto NO funciona en Vercel y NO borra nada de Cloudinary.
    // Lo correcto es hacer una llamada a la API de Cloudinary para borrar cada imagen.
    // He comentado el código antiguo y te dejo un ejemplo de cómo sería con Cloudinary.

    /*
    // CÓDIGO ANTIGUO (NO FUNCIONAL EN VERCEL/CLOUDINARY) - LO COMENTAMOS
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
    
    // EJEMPLO DE CÓMO SERÍA LA LÓGICA CORRECTA CON CLOUDINARY (necesitarías instalar 'cloudinary')
    // for (const image of chapter.images) {
    //   // Asumiendo que guardas el 'public_id' de Cloudinary en tu base de datos
    //   if (image.publicId) {
    //     await cloudinary.v2.uploader.destroy(image.publicId);
    //   }
    // }

    // Eliminar registros de la base de datos (Esto sí es correcto)
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

// --- FUNCIÓN PATCH CORREGIDA ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } } // Esta es la firma correcta
) {
  try {
    // Verificar autenticación de administrador
    const admin = await getAdminFromRequest(request); // Añadido 'await' por si la función es asíncrona
    if (!admin) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const chapterId = params.id;
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