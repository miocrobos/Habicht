/**
 * Apply Final Found Logos
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FINAL_FOUND_LOGOS: { name: string; logo: string }[] = [
  {
    name: 'STV Buttisholz',
    logo: 'https://volley-buttisholz.ch/fileservlet?type=image&id=1001008&s=dj0KZrPrGZ0KEdyruqxv_uzXsY4ZZO6nrYqj8TSZcS21ZKs=&imageFormat=_512x512'
  },
  {
    name: 'VBC Seftigen',
    logo: 'https://www.vbcseftigen.ch/media/fc8dbca4-fb77-407f-8e61-76cc0380f627.png'
  }
]

async function main() {
  console.log('🔧 Applying Final Found Logos\n')
  console.log('==============================\n')

  for (const item of FINAL_FOUND_LOGOS) {
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
      data: { logo: item.logo }
    })

    console.log(`✅ ${item.name}: Logo added`)
  }

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  // List remaining clubs without logos
  const remaining = await prisma.club.findMany({
    where: { logo: null },
    select: { name: true, website: true },
    orderBy: { name: 'asc' }
  })

  console.log(`\n📋 Clubs still without logos (${remaining.length}):\n`)
  remaining.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}${c.website ? ' - ' + c.website : ''}`)
  })

  await prisma.$disconnect()
}

main()
