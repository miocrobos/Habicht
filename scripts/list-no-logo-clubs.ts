import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const clubs = await prisma.club.findMany({
    where: { logo: null },
    select: { name: true, website: true },
    orderBy: { name: 'asc' }
  })

  console.log(`Clubs without logos (${clubs.length}):\n`)
  clubs.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}${c.website ? ' - ' + c.website : ' (no website)'}`)
  })

  await prisma.$disconnect()
}

main()
