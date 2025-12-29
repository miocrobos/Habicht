import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // VBC Muri-Gümligen got VBC Swiss (generic, wrong)
  // Volley Bern got Volley Uni Bern (different club)
  const wrong = ['VBC Muri-Gümligen', 'Volley Bern']
  
  for (const name of wrong) {
    await prisma.club.updateMany({ where: { name }, data: { logo: null } })
    console.log(`Removed wrong logo for ${name}`)
  }
  
  const remaining = await prisma.club.findMany({
    where: { logo: null },
    select: { name: true },
    orderBy: { name: 'asc' }
  })
  
  console.log(`\nClubs without logos (${remaining.length}):`)
  remaining.forEach(c => console.log(`  - ${c.name}`))
  
  await prisma.$disconnect()
}

main()
