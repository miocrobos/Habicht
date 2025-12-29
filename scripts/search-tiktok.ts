/**
 * Deep Search for Club TikTok Accounts
 * Search DuckDuckGo and club websites more thoroughly for TikTok links
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
      
      // Method 1: Check club website for TikTok link
      if (club.website) {
        try {
          await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 12000 })
          await page.waitForTimeout(1500)
          
          tiktok = await page.evaluate(() => {
            const links = document.querySelectorAll('a[href*="tiktok.com"]')
            for (const link of Array.from(links)) {
              const href = (link as HTMLAnchorElement).href
              const match = href.match(/tiktok\.com\/@?([^\/\?]+)/)
              if (match && match[1]) {
                const handle = match[1].replace('@', '')
                if (!['trending', 'discover', 'foryou', 'following'].includes(handle)) {
                  return `https://tiktok.com/@${handle}`
                }
              }
            }
            return null
          })
          
          if (tiktok) {
            console.log(`  Website: ${tiktok}`)
          }
        } catch {}
      }
      
      // Method 2: Search DuckDuckGo for club TikTok
      if (!tiktok) {
        try {
          const query = encodeURIComponent(`${club.name} volleyball tiktok`)
          await page.goto(`https://duckduckgo.com/?q=${query}`, {
            waitUntil: 'domcontentloaded',
            timeout: 12000
          })
          await page.waitForTimeout(2000)
          
          tiktok = await page.evaluate((clubName: string) => {
            const nameParts = clubName.toLowerCase().split(/[\s\-'`]+/).filter((w: string) => w.length > 2)
            const links = document.querySelectorAll('a[href*="tiktok.com"]')
            
            for (const link of Array.from(links)) {
              const href = (link as HTMLAnchorElement).href
              const match = href.match(/tiktok\.com\/@?([^\/\?]+)/)
              if (match && match[1]) {
                const handle = match[1].replace('@', '').toLowerCase()
                if (['trending', 'discover', 'foryou', 'following', 'explore'].includes(handle)) continue
                
                // Check if handle relates to club name
                for (const part of nameParts) {
                  if (handle.includes(part) || part.includes(handle.substring(0, 4))) {
                    return `https://tiktok.com/@${match[1].replace('@', '')}`
                  }
                }
                
                // Accept if it contains "volley" or "vbc"
                if (handle.includes('volley') || handle.includes('vbc')) {
                  return `https://tiktok.com/@${match[1].replace('@', '')}`
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
      
      // Method 3: Direct TikTok search with common naming patterns
      if (!tiktok) {
        const possibleHandles = [
          club.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          club.name.toLowerCase().replace(/[^a-z0-9]/g, '').replace('vbc', ''),
          club.name.toLowerCase().replace(/[^a-z0-9]/g, '') + 'volleyball',
          'vbc' + club.name.toLowerCase().replace(/[^a-z0-9]/g, '').replace('vbc', ''),
          club.name.toLowerCase().split(/[\s\-]+/)[0] + 'volley'
        ]
        
        for (const handle of possibleHandles.slice(0, 2)) {
          try {
            const searchQuery = encodeURIComponent(`site:tiktok.com/@${handle}`)
            await page.goto(`https://duckduckgo.com/?q=${searchQuery}`, {
              waitUntil: 'domcontentloaded',
              timeout: 10000
            })
            await page.waitForTimeout(1500)
            
            const foundTiktok = await page.evaluate(() => {
              const links = document.querySelectorAll('a[href*="tiktok.com/@"]')
              for (const link of Array.from(links)) {
                const href = (link as HTMLAnchorElement).href
                if (href.includes('tiktok.com/@') && !href.includes('duckduckgo')) {
                  const match = href.match(/tiktok\.com\/@([^\/\?]+)/)
                  if (match) return `https://tiktok.com/@${match[1]}`
                }
              }
              return null
            })
            
            if (foundTiktok) {
              tiktok = foundTiktok
              console.log(`  Direct: ${tiktok}`)
              break
            }
          } catch {}
        }
      }
      
      // Update database if found
      if (tiktok) {
        await prisma.club.update({
          where: { id: club.id },
          data: { tiktok }
        })
        found++
        console.log(`  ✓ Saved!`)
      }
      
      // Rate limit
      await page.waitForTimeout(800 + Math.random() * 500)
      
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
  
  // Final count
  const totalTiktok = await prisma.club.count({ where: { tiktok: { not: null } } })
  console.log(`Total clubs with TikTok: ${totalTiktok}`)
}

main().catch(console.error)
