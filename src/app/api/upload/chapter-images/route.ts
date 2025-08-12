import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Función para manejar uploads según el proveedor
async function handleUpload(files: File[], provider: string = 'local') {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'chapters')
  
  // Crear directorio si no existe
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch (error) {
    // Directory already exists
  }

  const uploadedUrls = []

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generar nombre de archivo único
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomId}.${extension}`
      
      const filepath = join(uploadDir, filename)
      
      // Escribir archivo
      await writeFile(filepath, buffer)
      
      // Retornar URL
      const url = `/uploads/chapters/${filename}`
      uploadedUrls.push(url)
    }
  }

  return uploadedUrls
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    // Obtener proveedor de uploads desde variables de entorno
    const uploadProvider = process.env.UPLOAD_PROVIDER || 'local'
    
    // Validar tamaño de archivos (10MB máximo por archivo)
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large (max 10MB)` },
          { status: 400 }
        )
      }
    }

    let uploadedUrls: string[] = []

    // Manejar uploads según el proveedor
    switch (uploadProvider) {
      case 'local':
        uploadedUrls = await handleUpload(files, 'local')
        break
      case 'vercel':
        // Aquí iría la lógica para Vercel Blob
        // Por ahora, fallback a local
        uploadedUrls = await handleUpload(files, 'local')
        break
      case 'cloudinary':
        // Aquí iría la lógica para Cloudinary
        // Por ahora, fallback a local
        uploadedUrls = await handleUpload(files, 'local')
        break
      case 's3':
        // Aquí iría la lógica para AWS S3
        // Por ahora, fallback a local
        uploadedUrls = await handleUpload(files, 'local')
        break
      default:
        uploadedUrls = await handleUpload(files, 'local')
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      images: uploadedUrls,
      provider: uploadProvider
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { error: 'Error uploading files' },
      { status: 500 }
    )
  }
}