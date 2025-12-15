import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const clubCount = await prisma.club.count()
    console.log(`Total clubs in database: ${clubCount}`)

    if (clubCount > 0) {
      const sampleClubs = await prisma.club.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          canton: true,
          town: true,
          league: true,
          website: true
        }
      })
      
      console.log('\nSample clubs:')
      sampleClubs.forEach(club => {
        console.log(`- ${club.name} (${club.canton}, ${club.league})`)
      })
    }

    // Check by canton
    const byCantonCount = await prisma.club.groupBy({
      by: ['canton'],
      _count: true
    })
    
    console.log('\nClubs by canton:')
    byCantonCount.forEach(item => {
      console.log(`${item.canton}: ${item._count}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
