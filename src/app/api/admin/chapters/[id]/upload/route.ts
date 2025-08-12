import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(
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

    // Verificar que el capítulo existe
    const chapter = await db.chapter.findUnique({
      where: { id }
    })

    if (!chapter) {
      return NextResponse.json(
        { message: 'Capítulo no encontrado' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    
    if (files.length === 0) {
      return NextResponse.json(
        { message: 'No se proporcionaron archivos' },
        { status: 400 }
      )
    }

    // Crear directorio para las imágenes si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'chapters', id)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uploadedImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validar archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { message: `El archivo ${file.name} no es una imagen válida` },
          { status: 400 }
        )
      }
      
      if (file.size > maxSize) {
        return NextResponse.json(
          { message: `El archivo ${file.name} es demasiado grande (máximo 10MB)` },
          { status: 400 }
        )
      }

      // Generar nombre de archivo único
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomId}.${extension}`
      const filePath = join(uploadDir, fileName)

      // Guardar archivo
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Guardar en la base de datos
      const chapterImage = await db.chapterImage.create({
        data: {
          chapterId: id,
          imageUrl: `/uploads/chapters/${id}/${fileName}`,
          order: i + 1
        }
      })

      uploadedImages.push({
        id: chapterImage.id,
        imageUrl: chapterImage.imageUrl,
        order: chapterImage.order
      })
    }

    return NextResponse.json({
      message: 'Imágenes subidas exitosamente',
      images: uploadedImages
    })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}