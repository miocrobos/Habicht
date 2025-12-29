/**
 * List Wix-hosted logos for verification
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Clubs with Wix-hosted logos:\n')
  
  const clubs = await prisma.club.findMany({
    where: { 
      logo: { contains: 'wixstatic.com' }
    },
    select: { name: true, logo: true, website: true }
  })

  for (const club of clubs) {
    console.log(`📌 ${club.name}`)
    console.log(`   Website: ${club.website || 'N/A'}`)
    console.log(`   Logo: ${club.logo}`)
    console.log('')
  }

  console.log(`Total: ${clubs.length} clubs with Wix-hosted logos`)
  
  await prisma.$disconnect()
}

main()
