/**
 * Fix Verified Wrong Logos
 * 
 * Based on manual verification, these logos are WRONG and need to be removed:
 * 
 * 1. Volley GraPa - Has a stock photo of volleyball players, NOT their logo
 * 2. Bienne Volleyboys - Has generic Wix favicon, NOT their logo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Logos that are verified to be WRONG (not actual club logos)
const WRONG_LOGOS = [
  {
    name: 'Volley GraPa',
    reason: 'Stock photo of volleyball players "Joueuses de volley qui viennent de marquer un point" - NOT a logo'
  },
  {
    name: 'Bienne Volleyboys',
    reason: 'Generic Wix/Parastorage favicon (pfavico.ico) - NOT the club logo'
  },
]

async function main() {
  console.log('🔧 Removing Verified Wrong Logos\n')
  console.log('=================================\n')

  for (const wrong of WRONG_LOGOS) {
    const club = await prisma.club.findFirst({
      where: { name: wrong.name },
      select: { id: true, name: true, logo: true }
    })

    if (!club) {
      console.log(`❌ ${wrong.name}: NOT FOUND`)
      continue
    }

    if (!club.logo) {
      console.log(`⚠️ ${wrong.name}: Already has no logo`)
      continue
    }

    console.log(`📌 ${wrong.name}`)
    console.log(`   Old logo: ${club.logo.substring(0, 60)}...`)
    console.log(`   Reason for removal: ${wrong.reason}`)

    await prisma.club.update({
      where: { id: club.id },
      data: { logo: null }
    })

    console.log(`   ✅ REMOVED\n`)
  }

  // Summary
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  await prisma.$disconnect()
}

main()
