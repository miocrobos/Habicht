import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // Check VBC clubs that had broken logos
  const clubs = await p.club.findMany({
    where: { name: { in: ['VBC Chatel-St-Denis', 'VBC Eburo', 'VBC Meggen'] } },
    select: { name: true, logo: true, website: true }
  })
  
  console.log('Clubs that had broken logos:')
  for (const c of clubs) {
    console.log(`\n${c.name}:`)
    console.log(`  Logo: ${c.logo ? c.logo.substring(0, 80) : 'NULL'}`)
    console.log(`  Website: ${c.website}`)
  }
  
  // Count summary
  const instaCount = await p.club.count({ where: { logo: { contains: 'instagram' } } })
  const googleCount = await p.club.count({ where: { logo: { contains: 'googleusercontent' } } })
  const noLogoCount = await p.club.count({ where: { logo: null } })
  const withLogoCount = await p.club.count({ where: { logo: { not: null } } })
  
  console.log('\n\n=== SUMMARY ===')
  console.log(`Instagram logos: ${instaCount}`)
  console.log(`Google logos: ${googleCount}`)
  console.log(`Clubs with logo: ${withLogoCount}`)
  console.log(`Clubs without logo: ${noLogoCount}`)
  
  await p.$disconnect()
}

main()
