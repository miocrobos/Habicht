import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const all = await prisma.club.count()
  const withWebsite = await prisma.club.count({ where: { website: { not: null } } })
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  
  console.log('='.repeat(40))
  console.log('Club Database Summary')
  console.log('='.repeat(40))
  console.log(`Total clubs: ${all}`)
  console.log(`With website: ${withWebsite} (${Math.round(withWebsite/all*100)}%)`)
  console.log(`With logo: ${withLogo} (${Math.round(withLogo/all*100)}%)`)
  console.log('')
  
  // Show some examples with website and logo
  const examples = await prisma.club.findMany({
    where: { 
      website: { not: null },
      logo: { not: null }
    },
    take: 10
  })
  
  console.log('Examples with website + logo:')
  for (const club of examples) {
    console.log(`- ${club.name}`)
    console.log(`  Website: ${club.website}`)
    console.log(`  Logo: ${club.logo?.substring(0, 60)}...`)
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
