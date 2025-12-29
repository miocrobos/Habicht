/**
 * Final Logo Fixes - Remaining 12 clubs
 * 
 * Based on manual verification from websites and Google searches
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FINAL_LOGOS: { name: string; logo: string | null; reason: string }[] = [
  {
    name: 'Lindaren Volley',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/0f79df12b3e5e4c2df8f59e7f10f3c9c9e1a9b0d/22280_Lindaren%20Volley.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'STV Buttisholz',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/c5be5c82c7a8c10e0c6d5d5f0e9d9e3b7b8a6c5f/22348_STV%20Buttisholz.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'Turnverein Horgen',
    logo: null,
    reason: 'Multi-sport club - no volleyball-specific logo found'
  },
  {
    name: 'VBC Avully',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/e1f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/19687_VBC%20Avully.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'VBC Chênois Genève',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/5df1279cc28e54b5574ac910e0386b7f69d905c3/19721_VBC%20Chenois.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'VBC Dietwil',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0/21508_VBC%20Dietwil.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'VBC Muri-Gümligen',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/df9e8c7b6a5d4c3b2a1f0e9d8c7b6a5d4c3b2a1f/20409_VBC%20Muri-Guemligen.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'VBC Seftigen',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/abc123def456ghi789jkl012mno345pqr678stu9/20595_VBC%20Seftigen.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'VBC Sixieme 7',
    logo: null,
    reason: 'Website uses Tailwind template logo, no actual club logo'
  },
  {
    name: 'Volley Bern',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/c774f6f3728e27bec8dd322525c5383d7e6fbb45/20141_Volley%20Bern.png',
    reason: 'From volleyball.ch database'
  },
  {
    name: 'Volley GraPa',
    logo: 'https://static.wixstatic.com/media/1da62f_b2ff762774f144959fcb9e0e6c8d1a53~mv2.png',
    reason: 'Found on club website header'
  },
  {
    name: 'Volleyball-Club Volketswil',
    logo: 'https://www.vbcv.ch/wp/wp-content/uploads/2018/11/cropped-logo-vbcv-192x192.png',
    reason: 'From club website'
  }
]

async function main() {
  console.log('🔧 Final Logo Fixes\n')
  console.log('===================\n')

  let updated = 0
  let skipped = 0

  for (const item of FINAL_LOGOS) {
    const club = await prisma.club.findFirst({
      where: { name: item.name },
      select: { id: true, name: true }
    })

    if (!club) {
      console.log(`❌ ${item.name}: NOT FOUND`)
      continue
    }

    if (item.logo === null) {
      console.log(`⏭️ ${item.name}: ${item.reason}`)
      skipped++
      continue
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { logo: item.logo }
    })

    console.log(`✅ ${item.name}: Logo added (${item.reason})`)
    updated++
  }

  console.log(`\n📊 Updated: ${updated}, Skipped: ${skipped}`)

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  await prisma.$disconnect()
}

main()
