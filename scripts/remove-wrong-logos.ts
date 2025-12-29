/**
 * Remove wrong logos that were incorrectly matched
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// These clubs got logos from OTHER clubs - WRONG!
const WRONG_LOGOS = [
  { name: 'Lindaren Volley', wrongClub: 'G&B Scuola Volley' },
  { name: 'Turnverein Horgen', wrongClub: 'VBC Stäfa' },
  { name: 'VBC Avully', wrongClub: 'Pully VBC' },
  // VBC Chênois Genève - CORRECT, keep it
  { name: 'VBC Dietwil', wrongClub: 'VBC Fribourg' },
  { name: 'VBC Muri-Gümligen', wrongClub: 'VBC Merenschwand-Muri' },
  { name: 'VBC Sixieme 7', wrongClub: 'Cheseaux VBC' },
  { name: 'Volley Bern', wrongClub: 'Volley Uni Bern' },
]

async function main() {
  console.log('🔧 Removing Wrong Logos\n')
  console.log('========================\n')

  for (const item of WRONG_LOGOS) {
    const club = await prisma.club.findFirst({
      where: { name: item.name },
      select: { id: true, name: true }
    })

    if (!club) {
      console.log(`❌ ${item.name}: NOT FOUND`)
      continue
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { logo: null }
    })

    console.log(`✅ ${item.name}: Removed wrong logo (was ${item.wrongClub}'s logo)`)
  }

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  if (withoutLogo > 0) {
    const remaining = await prisma.club.findMany({
      where: { logo: null },
      select: { name: true },
      orderBy: { name: 'asc' }
    })
    console.log('\n📋 Clubs without logos:')
    remaining.forEach(c => console.log(`   - ${c.name}`))
  }

  await prisma.$disconnect()
}

main()
