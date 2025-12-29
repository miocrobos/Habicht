/**
 * Final Logo Cleanup
 * 
 * Removes broken Google Sites logos that return 403 errors
 * and handles any remaining issues
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as https from 'https'

const prisma = new PrismaClient()

async function checkLogoAccessible(url: string): Promise<boolean> {
  try {
    await axios.head(url, {
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    return true
  } catch {
    try {
      await axios.get(url, {
        timeout: 10000,
        responseType: 'arraybuffer',
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      return true
    } catch {
      return false
    }
  }
}

async function main() {
  console.log('🧹 Final Logo Cleanup\n')

  // Find all clubs with Google Sites hosted logos
  const googleLogos = await prisma.club.findMany({
    where: {
      logo: { contains: 'googleusercontent' }
    },
    select: { id: true, name: true, logo: true, website: true }
  })

  console.log(`Found ${googleLogos.length} clubs with Google-hosted logos\n`)

  let removed = 0
  let kept = 0

  for (const club of googleLogos) {
    process.stdout.write(`Checking ${club.name}... `)
    
    const accessible = await checkLogoAccessible(club.logo!)
    
    if (!accessible) {
      await prisma.club.update({
        where: { id: club.id },
        data: { logo: null }
      })
      console.log('❌ REMOVED (403/not accessible)')
      removed++
    } else {
      console.log('✅ OK')
      kept++
    }
  }

  // Also check for the remaining Instagram logo
  const instaLogos = await prisma.club.findMany({
    where: { logo: { contains: 'instagram' } },
    select: { id: true, name: true, logo: true }
  })

  console.log(`\n\nFound ${instaLogos.length} clubs with Instagram logos:`)
  for (const club of instaLogos) {
    console.log(`  - ${club.name}`)
    // Check if accessible
    const accessible = await checkLogoAccessible(club.logo!)
    if (accessible) {
      console.log(`    ✅ Accessible - keeping (shows actual club logo)`)
    } else {
      console.log(`    ❌ Not accessible - removing`)
      await prisma.club.update({
        where: { id: club.id },
        data: { logo: null }
      })
      removed++
    }
  }

  // Summary
  console.log('\n\n📊 Final Summary')
  console.log('================')
  console.log(`Google logos removed: ${removed}`)
  console.log(`Google logos kept: ${kept}`)

  const totalWithLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const totalWithoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log(`\nTotal clubs with logo: ${totalWithLogo}`)
  console.log(`Total clubs without logo: ${totalWithoutLogo}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
