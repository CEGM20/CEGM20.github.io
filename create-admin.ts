import { db } from './src/lib/db'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await db.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@webtoonverse.com',
        name: 'Administrador'
      }
    })

    console.log('Admin created successfully:', admin)
    console.log('Username: admin')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error creating admin:', error)
  }
}

createAdmin()
  .then(() => {
    console.log('Admin creation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Admin creation failed:', error)
    process.exit(1)
  })