/**
 * Apply Verified Remaining Logos
 * 
 * These are logos I verified from the original Google Images search
 * or found directly on club websites
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const VERIFIED_REMAINING: { name: string; logo: string }[] = [
  // Volley GraPa - found on their Wix website (header logo)
  {
    name: 'Volley GraPa',
    logo: 'https://static.wixstatic.com/media/1da62f_b2ff762774f144959fcb9e0e6c8d1a53~mv2.png/v1/fill/w_164,h_129,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logo%20Club%20Volley%20Grapa.png'
  },
  // Volleyball-Club Volketswil - from their WordPress site
  {
    name: 'Volleyball-Club Volketswil',
    logo: 'https://www.vbcv.ch/wp/wp-content/uploads/2018/11/cropped-logo-vbcv-192x192.png'
  }
]

async function main() {
  console.log('🔧 Applying Verified Remaining Logos\n')
  console.log('=====================================\n')

  let updated = 0

  for (const item of VERIFIED_REMAINING) {
    const club = await prisma.club.findFirst({
      where: { name: item.name },
      select: { id: true, name: true, logo: true }
    })

    if (!club) {
      console.log(`❌ ${item.name}: NOT FOUND`)
      continue
    }

    if (club.logo) {
      console.log(`⚠️ ${item.name}: Already has logo`)
      continue
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { logo: item.logo }
    })

    console.log(`✅ ${item.name}: Logo added`)
    updated++
  }

  console.log(`\n📊 Updated: ${updated}`)

  // List remaining clubs without logos
  const remaining = await prisma.club.findMany({
    where: { logo: null },
    select: { name: true, website: true },
    orderBy: { name: 'asc' }
  })

  console.log(`\n📋 Still without logos (${remaining.length}):\n`)
  remaining.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}${c.website ? ' - ' + c.website : ''}`)
  })

  await prisma.$disconnect()
}

main()
