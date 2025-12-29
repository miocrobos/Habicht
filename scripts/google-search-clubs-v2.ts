/**
 * Google Search for Club Websites - Careful Version
 * Uses longer delays and handles blocks better
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Results file to save progress
const RESULTS_FILE = 'data/club-websites.json'

interface ClubResult {
  id: string
  name: string
  town: string | null
  website: string | null
  logo: string | null
  searchedAt: string
}

async function main() {
  console.log('='.repeat(60))
  console.log('Club Website Collector via Google Search (Careful Mode)')
  console.log('='.repeat(60))
  
  // Load previous results if any
  let results: Record<string, ClubResult> = {}
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'))
    console.log(`Loaded ${Object.keys(results).length} previous results`)
  }
  
  // Get all clubs from database
  const clubs = await prisma.club.findMany({
    where: {
      website: null  // Only clubs without websites
    },
    orderBy: { name: 'asc' }
  })
  
  console.log(`\nFound ${clubs.length} clubs without websites`)
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  })
  
  const context = await browser.newContext({
    locale: 'de-CH',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  })
  
  const page = await context.newPage()
  
  let websitesFound = 0
  let searched = 0
  
  try {
    // Handle Google consent once
    console.log('\n=== Setting up Google search ===')
    await page.goto('https://www.google.ch', { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(3000)
    
    try {
      const consentBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Accept all"), button:has-text("Ich stimme zu")')
      if (await consentBtn.isVisible({ timeout: 5000 })) {
        await consentBtn.click()
        await page.waitForTimeout(2000)
        console.log('Consent accepted')
      }
    } catch {}
    
    console.log('\n=== Starting search (with pauses to avoid blocking) ===\n')
    console.log('Press Ctrl+C to stop - progress is saved automatically\n')
    
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      
      // Skip if already searched
      if (results[club.id]) {
        console.log(`[${i + 1}/${clubs.length}] ${club.name} - Already searched`)
        continue
      }
      
      console.log(`[${i + 1}/${clubs.length}] ${club.name}`)
      searched++
      
      try {
        // Build search query
        const searchTerms = [
          club.name,
          'volleyball',
          club.town || '',
          'schweiz'
        ].filter(Boolean).join(' ')
        
        // Type in search box instead of URL navigation (more human-like)
        await page.goto('https://www.google.ch', { waitUntil: 'domcontentloaded', timeout: 30000 })
        await page.waitForTimeout(1500 + Math.random() * 1000)
        
        // Find and use search box
        const searchBox = page.locator('textarea[name="q"], input[name="q"]').first()
        await searchBox.click()
        await page.waitForTimeout(500)
        
        // Type slowly like a human
        await searchBox.fill('')
        for (const char of searchTerms) {
          await searchBox.type(char, { delay: 50 + Math.random() * 50 })
        }
        
        await page.waitForTimeout(800)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(3000 + Math.random() * 2000)
        
        // Check for CAPTCHA
        const pageContent = await page.content()
        if (pageContent.includes('unusual traffic') || pageContent.includes('captcha')) {
          console.log('  ⚠️  CAPTCHA detected - waiting 30s for manual solve...')
          await page.waitForTimeout(30000)
        }
        
        // Extract first good result
        const website = await page.evaluate((clubName) => {
          const results = document.querySelectorAll('a[href]')
          const clubWords = clubName.toLowerCase().split(/[\s\-]+/).filter((w: string) => w.length > 3)
          
          const skipDomains = [
            'google.', 'facebook.com', 'instagram.com', 'youtube.com',
            'twitter.com', 'linkedin.com', 'wikipedia.', 'volleybox.',
            'volleyball.ch', 'support.google', 'accounts.google', 'maps.google',
            'translate.google', 'schema.org', 'sitelinks'
          ]
          
          for (const a of Array.from(results)) {
            const href = (a as HTMLAnchorElement).href
            if (!href || !href.startsWith('http')) continue
            
            // Skip unwanted domains
            if (skipDomains.some(d => href.includes(d))) continue
            
            const hrefLower = href.toLowerCase()
            
            // Check if URL contains club name parts
            for (const word of clubWords) {
              if (hrefLower.includes(word)) {
                // Clean URL
                const url = new URL(href)
                return url.origin
              }
            }
            
            // Accept .ch domains as likely Swiss club sites
            if (hrefLower.match(/https?:\/\/[^\/]+\.ch($|\/)/)) {
              const url = new URL(href)
              return url.origin
            }
          }
          
          return null
        }, club.name)
        
        if (website) {
          // Update database immediately
          await prisma.club.update({
            where: { id: club.id },
            data: { website }
          })
          websitesFound++
          console.log(`  ✓ ${website}`)
        } else {
          console.log(`  ✗ No website found`)
        }
        
        // Save result
        results[club.id] = {
          id: club.id,
          name: club.name,
          town: club.town,
          website: website,
          logo: null,
          searchedAt: new Date().toISOString()
        }
        
        // Save progress to file
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
        
        // Rate limiting - random delay between 4-8 seconds
        const delay = 4000 + Math.random() * 4000
        console.log(`  (waiting ${Math.round(delay/1000)}s...)`)
        await page.waitForTimeout(delay)
        
        // Every 10 searches, take a longer break
        if (searched % 10 === 0) {
          console.log(`\n--- Pause: ${searched} searches done, taking 20s break ---\n`)
          await page.waitForTimeout(20000)
        }
        
      } catch (e: any) {
        console.log(`  Error: ${e.message?.substring(0, 50)}`)
        results[club.id] = {
          id: club.id,
          name: club.name,
          town: club.town,
          website: null,
          logo: null,
          searchedAt: new Date().toISOString()
        }
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
      }
    }
    
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE!')
  console.log('='.repeat(60))
  console.log(`Searched: ${searched}`)
  console.log(`Websites found: ${websitesFound}`)
  console.log(`Results saved to: ${RESULTS_FILE}`)
}

main().catch(console.error)
