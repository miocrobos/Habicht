import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const all = await prisma.club.count()
  const withWebsite = await prisma.club.count({ where: { website: { not: null } } })
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withInstagram = await prisma.club.count({ where: { instagram: { not: null } } })
  const withFacebook = await prisma.club.count({ where: { facebook: { not: null } } })
  const withTiktok = await prisma.club.count({ where: { tiktok: { not: null } } })
  
  console.log('='.repeat(50))
  console.log('CLUB DATABASE FINAL SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total clubs: ${all}`)
  console.log('')
  console.log('WEBSITES & LOGOS:')
  console.log(`  With website: ${withWebsite} (${Math.round(withWebsite/all*100)}%)`)
  console.log(`  With logo: ${withLogo} (${Math.round(withLogo/all*100)}%)`)
  console.log('')
  console.log('SOCIAL MEDIA:')
  console.log(`  With Instagram: ${withInstagram} (${Math.round(withInstagram/all*100)}%)`)
  console.log(`  With Facebook: ${withFacebook} (${Math.round(withFacebook/all*100)}%)`)
  console.log(`  With TikTok: ${withTiktok} (${Math.round(withTiktok/all*100)}%)`)
  console.log('')
  
  // Show clubs without logo
  const clubsWithoutLogo = await prisma.club.findMany({
    where: { logo: null },
    select: { name: true, website: true }
  })
  
  console.log(`\nClubs still without logo (${clubsWithoutLogo.length}):`)
  for (const club of clubsWithoutLogo) {
    console.log(`  - ${club.name}`)
  }
  
  // Show example clubs with all data
  console.log('\n\nExample clubs with complete data:')
  const examples = await prisma.club.findMany({
    where: {
      logo: { not: null },
      instagram: { not: null },
      facebook: { not: null }
    },
    take: 5
  })
  
  for (const club of examples) {
    console.log(`\n${club.name}:`)
    console.log(`  Website: ${club.website}`)
    console.log(`  Logo: ${club.logo?.substring(0, 50)}...`)
    console.log(`  Instagram: ${club.instagram}`)
    console.log(`  Facebook: ${club.facebook}`)
    if (club.tiktok) console.log(`  TikTok: ${club.tiktok}`)
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
