/**
 * Fix Facebook links to be just handles like Instagram
 * And verify VTV Horw
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing Facebook links...')
  
  const clubs = await prisma.club.findMany({
    where: { facebook: { not: null } }
  })
  
  let fixed = 0
  for (const club of clubs) {
    if (!club.facebook) continue
    
    let handle = club.facebook
    
    // Extract handle from full URL
    if (handle.includes('facebook.com/')) {
      const match = handle.match(/facebook\.com\/([^\/\?\&]+)/)
      if (match) handle = match[1]
    }
    
    // Skip invalid
    if (['sharer', 'share', 'dialog', 'plugins', 'hashtag', 'pages', 'profile.php'].includes(handle)) {
      await prisma.club.update({
        where: { id: club.id },
        data: { facebook: null }
      })
      fixed++
      continue
    }
    
    // Store as just the handle
    if (club.facebook !== handle) {
      await prisma.club.update({
        where: { id: club.id },
        data: { facebook: handle }
      })
      fixed++
    }
  }
  
  console.log(`Fixed ${fixed} Facebook entries`)
  
  // Show VTV Horw
  const vtvHorw = await prisma.club.findFirst({ where: { name: 'VTV Horw' } })
  console.log('\nVTV Horw:')
  console.log(`  Website: ${vtvHorw?.website}`)
  console.log(`  Logo: ${vtvHorw?.logo ? '✓' : '✗'}`)
  console.log(`  Instagram: ${vtvHorw?.instagram || '✗'}`)
  console.log(`  Facebook: ${vtvHorw?.facebook || '✗'}`)
  console.log(`  TikTok: ${vtvHorw?.tiktok || '✗'}`)
  
  // Show sample
  console.log('\nSample clubs:')
  const samples = await prisma.club.findMany({
    where: { facebook: { not: null } },
    take: 5,
    select: { name: true, instagram: true, facebook: true, tiktok: true }
  })
  
  for (const club of samples) {
    console.log(`  ${club.name}:`)
    console.log(`    IG: ${club.instagram} | FB: ${club.facebook} | TT: ${club.tiktok || '-'}`)
  }
  
  // Final count
  const igCount = await prisma.club.count({ where: { instagram: { not: null } } })
  const fbCount = await prisma.club.count({ where: { facebook: { not: null } } })
  const ttCount = await prisma.club.count({ where: { tiktok: { not: null } } })
  
  console.log('\nFinal counts:')
  console.log(`  Instagram: ${igCount}`)
  console.log(`  Facebook: ${fbCount}`)
  console.log(`  TikTok: ${ttCount}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)
