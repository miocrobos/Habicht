/**
 * Deep TikTok Search - Only from club websites
 * This is more accurate as it only finds TikToks linked on the club's own site
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('='.repeat(60))
  console.log('Deep TikTok Search (Website Only)')
  console.log('='.repeat(60))
  
  // Get all clubs with websites but without TikTok
  const clubs = await prisma.club.findMany({
    where: {
      website: { not: null },
      tiktok: null
    },
    orderBy: { name: 'asc' }
  })
  
  console.log(`\n${clubs.length} clubs to check\n`)
  
  const browser = await chromium.launch({ headless: true, slowMo: 50 })
  const page = await browser.newPage()
  
  let found = 0
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      
      if (!club.website) continue
      
      try {
        await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 10000 })
        await page.waitForTimeout(1000)
        
        // Find TikTok links on the page
        const tiktok = await page.evaluate(() => {
          const links = document.querySelectorAll('a[href*="tiktok.com"]')
          
          for (const link of Array.from(links)) {
            const href = (link as HTMLAnchorElement).href
            const match = href.match(/tiktok\.com\/@?([^\/\?\&]+)/)
            if (match && match[1]) {
              const handle = match[1].replace('@', '')
              // Skip generic/share links
              if (['share', 'embed', 'tag', 'discover'].includes(handle.toLowerCase())) continue
              return `https://tiktok.com/@${handle}`
            }
          }
          return null
        })
        
        if (tiktok) {
          await prisma.club.update({
            where: { id: club.id },
            data: { tiktok }
          })
          found++
          console.log(`[${i + 1}/${clubs.length}] ${club.name}: ${tiktok}`)
        }
        
      } catch {}
      
      // Progress update every 50
      if ((i + 1) % 50 === 0) {
        console.log(`\n--- Checked ${i + 1}/${clubs.length} | Found: ${found} ---\n`)
      }
    }
    
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`COMPLETE! Found ${found} TikTok accounts from websites`)
  console.log('='.repeat(60))
  
  // Show final count
  const total = await prisma.club.count({ where: { tiktok: { not: null } } })
  console.log(`\nTotal clubs with TikTok: ${total}`)
}

main().catch(console.error)
