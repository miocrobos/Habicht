/**
 * Club Website & Logo Collector using DuckDuckGo
 * DuckDuckGo is more scraping-friendly than Google
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()
const RESULTS_FILE = 'data/club-websites.json'

interface ClubResult {
  id: string
  name: string
  website: string | null
  logo: string | null
}

async function main() {
  console.log('='.repeat(60))
  console.log('Club Website & Logo Collector via DuckDuckGo')
  console.log('='.repeat(60))
  
  // Load previous results
  let results: Record<string, ClubResult> = {}
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'))
    console.log(`Loaded ${Object.keys(results).length} previous results`)
  }
  
  // Get clubs without websites
  const clubs = await prisma.club.findMany({
    where: { website: null },
    orderBy: { name: 'asc' }
  })
  
  console.log(`\n${clubs.length} clubs need websites\n`)
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  let websitesFound = 0
  let logosFound = 0
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      
      // Skip already searched
      if (results[club.id]?.website) {
        console.log(`[${i + 1}/${clubs.length}] ${club.name} - Already found`)
        continue
      }
      
      console.log(`[${i + 1}/${clubs.length}] ${club.name}`)
      
      // Search DuckDuckGo
      const query = encodeURIComponent(`${club.name} volleyball ${club.town || ''} website`)
      
      try {
        await page.goto(`https://duckduckgo.com/?q=${query}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        })
        await page.waitForTimeout(2000)
        
        // Extract first good result
        const website = await page.evaluate((clubName) => {
          const clubWords = clubName.toLowerCase().split(/[\s\-]+/).filter((w: string) => w.length > 2)
          
          // Find result links
          const results = document.querySelectorAll('a[data-testid="result-title-a"], .result__a, h2 a')
          
          const skipDomains = [
            'duckduckgo.', 'facebook.com', 'instagram.com', 'youtube.com',
            'twitter.com', 'linkedin.com', 'wikipedia.', 'volleybox.',
            'volleyball.ch', 'bing.com', 'ad.doubleclick'
          ]
          
          for (const a of Array.from(results)) {
            const href = (a as HTMLAnchorElement).href
            if (!href || !href.startsWith('http')) continue
            
            if (skipDomains.some(d => href.includes(d))) continue
            
            const hrefLower = href.toLowerCase()
            
            // Check if URL contains club name
            for (const word of clubWords) {
              if (hrefLower.includes(word)) {
                try {
                  const url = new URL(href)
                  return url.origin
                } catch { return href.split('?')[0] }
              }
            }
            
            // Accept .ch domains
            if (hrefLower.match(/https?:\/\/[^\/]+\.ch($|\/)/)) {
              try {
                const url = new URL(href)
                return url.origin
              } catch { return href.split('?')[0] }
            }
          }
          
          return null
        }, club.name)
        
        if (website) {
          await prisma.club.update({
            where: { id: club.id },
            data: { website }
          })
          websitesFound++
          console.log(`  Website: ${website}`)
          
          // Now get logo from website
          try {
            await page.goto(website, { waitUntil: 'domcontentloaded', timeout: 15000 })
            await page.waitForTimeout(2000)
            
            const logo = await page.evaluate((name) => {
              const namePart = name.toLowerCase().split(/[\s\-]+/)[0]
              
              // Look for logo images
              const selectors = [
                'header img', '.header img', 'nav img', '.navbar img',
                '.navbar-brand img', '.site-logo img', '.logo img', '#logo img',
                'a[href="/"] img', 'a[href="./"] img', '.brand img'
              ]
              
              for (const sel of selectors) {
                const img = document.querySelector(sel) as HTMLImageElement
                if (img?.src && img.src.startsWith('http')) {
                  return img.src
                }
              }
              
              // Check all images for logo in class/alt/src
              for (const img of Array.from(document.querySelectorAll('img'))) {
                if (!img.src) continue
                const alt = (img.alt || '').toLowerCase()
                const cls = (img.className || '').toLowerCase()
                const src = img.src.toLowerCase()
                
                if (alt.includes('logo') || cls.includes('logo') || 
                    src.includes('logo') || alt.includes(namePart)) {
                  return img.src
                }
              }
              
              return null
            }, club.name)
            
            if (logo) {
              await prisma.club.update({
                where: { id: club.id },
                data: { logo }
              })
              logosFound++
              console.log(`  Logo: ✓`)
            } else {
              console.log(`  Logo: ✗`)
            }
            
          } catch (e: any) {
            console.log(`  Logo error: ${e.message?.substring(0, 30)}`)
          }
          
          results[club.id] = { id: club.id, name: club.name, website, logo: null }
        } else {
          console.log(`  No website found`)
          results[club.id] = { id: club.id, name: club.name, website: null, logo: null }
        }
        
        // Save progress
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
        
        // Rate limit
        await page.waitForTimeout(2000 + Math.random() * 2000)
        
      } catch (e: any) {
        console.log(`  Error: ${e.message?.substring(0, 40)}`)
      }
      
      // Progress update
      if ((i + 1) % 20 === 0) {
        console.log(`\n--- Progress: ${i + 1}/${clubs.length} | Websites: ${websitesFound} | Logos: ${logosFound} ---\n`)
      }
    }
    
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE!')
  console.log('='.repeat(60))
  console.log(`Websites found: ${websitesFound}`)
  console.log(`Logos found: ${logosFound}`)
}

main().catch(console.error)
