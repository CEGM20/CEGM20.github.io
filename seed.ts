import { db } from './src/lib/db'
import { SeriesStatus } from '@prisma/client'

async function seedDatabase() {
  try {
    // Create admin user
    const admin = await db.admin.create({
      data: {
        username: 'admin',
        password: 'admin123', // En producción, usarías hash de contraseña
        email: 'admin@webtoon.com'
      }
    })

    console.log('Admin user created:', admin.username)
    // Create genres
    const genres = await Promise.all([
      db.genre.create({ data: { name: 'Romance' } }),
      db.genre.create({ data: { name: 'Acción' } }),
      db.genre.create({ data: { name: 'Fantasía' } }),
      db.genre.create({ data: { name: 'Comedia' } }),
      db.genre.create({ data: { name: 'Drama' } }),
      db.genre.create({ data: { name: 'Terror' } }),
      db.genre.create({ data: { name: 'Ciencia Ficción' } }),
      db.genre.create({ data: { name: 'Aventura' } }),
    ])

    // Create sample series
    const seriesData = [
      {
        title: 'El Reino Perdido',
        description: 'Un joven príncipe debe recuperar su reino perdido con la ayuda de poderosos aliados.',
        author: 'Kim Min-jun',
        status: SeriesStatus.ONGOING,
        isFeatured: true,
        views: 15420,
        genreIds: [genres[1].id, genres[2].id, genres[7].id] // Acción, Fantasía, Aventura
      },
      {
        title: 'Amor en el Campus',
        description: 'Una historia de amor universitaria llena de giros inesperados y personajes memorables.',
        author: 'Park Soo-min',
        status: SeriesStatus.ONGOING,
        isFeatured: true,
        views: 23150,
        genreIds: [genres[0].id, genres[3].id] // Romance, Comedia
      },
      {
        title: 'El Último Superviviente',
        description: 'En un mundo post-apocalíptico, un hombre lucha por sobrevivir y proteger a los que ama.',
        author: 'Lee Ji-hoon',
        status: SeriesStatus.COMPLETED,
        isFeatured: false,
        views: 31200,
        genreIds: [genres[1].id, genres[5].id] // Acción, Terror
      },
      {
        title: 'Magia Moderna',
        description: 'En el siglo XXI, la magia ha vuelto al mundo y solo unos pocos pueden controlarla.',
        author: 'Choi Eun-ji',
        status: SeriesStatus.ONGOING,
        isFeatured: true,
        views: 18900,
        genreIds: [genres[2].id, genres[6].id] // Fantasía, Ciencia Ficción
      },
      {
        title: 'Café de los Sueños',
        description: 'Un misterioso café donde los sueños se hacen realidad, pero siempre con un precio.',
        author: 'Kim Hye-soo',
        status: SeriesStatus.HIATUS,
        isFeatured: false,
        views: 8750,
        genreIds: [genres[2].id, genres[4].id] // Fantasía, Drama
      },
      {
        title: 'Rebelión Estudiantil',
        description: 'Un grupo de estudiantes se rebela contra el sistema educativo corrupto.',
        author: 'Park Jin-woo',
        status: SeriesStatus.ONGOING,
        isFeatured: true,
        views: 27650,
        genreIds: [genres[1].id, genres[4].id] // Acción, Drama
      }
    ]

    for (const seriesInfo of seriesData) {
      const { genreIds, ...seriesData } = seriesInfo
      
      const series = await db.series.create({
        data: seriesData
      })

      // Connect genres to series
      for (const genreId of genreIds) {
        await db.seriesGenre.create({
          data: {
            seriesId: series.id,
            genreId: genreId
          }
        })
      }

      // Create sample chapters for each series
      const chapterCount = seriesInfo.status === SeriesStatus.COMPLETED ? 15 : Math.floor(Math.random() * 10) + 3
      
      for (let i = 1; i <= chapterCount; i++) {
        await db.chapter.create({
          data: {
            title: `Capítulo ${i}`,
            chapterNumber: i,
            seriesId: series.id,
            publishDate: new Date(Date.now() - (chapterCount - i) * 7 * 24 * 60 * 60 * 1000), // One week apart
            views: Math.floor(Math.random() * 5000) + 100
          }
        })
      }
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seedDatabase()
  .then(() => {
    console.log('Seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })