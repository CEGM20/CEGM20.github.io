import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar administrador en la base de datos
    const admin = await db.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json(
        { message: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Devolver respuesta exitosa
    return NextResponse.json({
      message: 'Login exitoso',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name
      }
    })

  } catch (error) {
    console.error('Error en login de admin:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}