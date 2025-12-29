/**
 * Deep TikTok Search for Swiss Volleyball Clubs
 * Searches each club's website and DuckDuckGo for TikTok links
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('='.repeat(60))
  console.log('Deep TikTok Search for All Clubs')
  console.log('='.repeat(60))
  
  // Get all clubs without TikTok
  const clubs = await prisma.club.findMany({
    where: { tiktok: null },
    orderBy: { name: 'asc' }
  })
  
  console.log(`\n${clubs.length} clubs without TikTok\n`)
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page = await browser.newPage()
  
  let found = 0
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      console.log(`[${i + 1}/${clubs.length}] ${club.name}`)
      
      let tiktok: string | null = null
      
      // Step 1: Check club website for TikTok link
      if (club.website && !tiktok) {
        try {
          await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 10000 })
          await page.waitForTimeout(1500)
          
          tiktok = await page.evaluate((clubName: string) => {
            const nameParts = clubName.toLowerCase().split(/[\s\-'`]+/).filter((w: string) => w.length > 2)
            const links = document.querySelectorAll('a[href*="tiktok.com"]')
            
            for (const link of Array.from(links)) {
              const href = (link as HTMLAnchorElement).href
              const match = href.match(/tiktok\.com\/@?([^\/\?\&]+)/)
              if (match && match[1]) {
                const handle = match[1].replace('@', '').toLowerCase()
                // Validate it's related to the club
                for (const part of nameParts) {
                  if (handle.includes(part) || part.includes(handle.substring(0, 4))) {
                    return `https://tiktok.com/@${match[1].replace('@', '')}`
                  }
                }
                // Also accept if it just exists on their site
                if (!['tiktok', 'share', 'embed'].includes(handle)) {
                  return `https://tiktok.com/@${match[1].replace('@', '')}`
                }
              }
            }
            return null
          }, club.name)
          
          if (tiktok) {
            console.log(`  Website: ${tiktok}`)
          }
        } catch {}
      }
      
      // Step 2: Search DuckDuckGo for club TikTok
      if (!tiktok) {
        try {
          const query = encodeURIComponent(`${club.name} volleyball tiktok site:tiktok.com`)
          await page.goto(`https://duckduckgo.com/?q=${query}`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
          })
          await page.waitForTimeout(2000)
          
          tiktok = await page.evaluate((clubName: string) => {
            const nameParts = clubName.toLowerCase().split(/[\s\-'`]+/).filter((w: string) => w.length > 2)
            const links = document.querySelectorAll('a[href*="tiktok.com"]')
            
            for (const link of Array.from(links)) {
              const href = (link as HTMLAnchorElement).href
              if (href.includes('duckduckgo.')) continue
              
              const match = href.match(/tiktok\.com\/@?([^\/\?\&]+)/)
              if (match && match[1]) {
                const handle = match[1].replace('@', '').toLowerCase()
                // Must be related to club name
                for (const part of nameParts) {
                  if (handle.includes(part) || part.includes(handle.substring(0, 4))) {
                    return `https://tiktok.com/@${match[1].replace('@', '')}`
                  }
                }
              }
            }
            return null
          }, club.name)
          
          if (tiktok) {
            console.log(`  DDG: ${tiktok}`)
          }
        } catch {}
      }
      
      // Update database if found
      if (tiktok) {
        await prisma.club.update({
          where: { id: club.id },
          data: { tiktok }
        })
        found++
        console.log(`  ✓ Saved`)
      }
      
      // Rate limit
      await page.waitForTimeout(1000 + Math.random() * 500)
      
      // Progress
      if ((i + 1) % 30 === 0) {
        console.log(`\n--- Progress: ${i + 1}/${clubs.length} | Found: ${found} ---\n`)
      }
    }
    
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log(`COMPLETE! Found ${found} new TikTok accounts`)
  console.log('='.repeat(60))
}

main().catch(console.error)
