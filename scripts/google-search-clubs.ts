/**
 * Google Search for Club Websites and Logo Collection
 * 
 * 1. Gets all clubs from the database
 * 2. Searches Google for each club's website
 * 3. Visits the website to collect the logo
 * 4. Updates the database with website and logo URLs
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('='.repeat(60))
  console.log('Club Website & Logo Collector via Google Search')
  console.log('='.repeat(60))
  
  // Get all clubs from database
  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log(`\nFound ${clubs.length} clubs in database`)
  console.log(`Without website: ${clubs.filter(c => !c.website).length}`)
  console.log(`Without logo: ${clubs.filter(c => !c.logo).length}`)
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  // Set Swiss locale
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8'
  })
  
  let websitesFound = 0
  let logosFound = 0
  
  try {
    // Handle Google consent once
    console.log('\n=== Handling Google consent ===')
    await page.goto('https://www.google.ch', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    try {
      const consentBtn = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Accept all"), button:has-text("Ich stimme zu")')
      if (await consentBtn.isVisible({ timeout: 3000 })) {
        await consentBtn.click()
        await page.waitForTimeout(1000)
        console.log('Consent accepted')
      }
    } catch {}
    
    console.log('\n=== Searching for club websites ===\n')
    
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      
      // Skip if already has both website and logo
      if (club.website && club.logo) {
        console.log(`[${i + 1}/${clubs.length}] ${club.name} - Already complete`)
        continue
      }
      
      console.log(`[${i + 1}/${clubs.length}] ${club.name}`)
      
      // STEP 1: Find website via Google if needed
      if (!club.website) {
        try {
          const searchQuery = encodeURIComponent(`${club.name} volleyball ${club.town || ''} website`)
          await page.goto(`https://www.google.ch/search?q=${searchQuery}&hl=de`, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
          })
          await page.waitForTimeout(1500)
          
          // Extract first non-social-media result
          const website = await page.evaluate((clubName) => {
            const results = document.querySelectorAll('a[href]')
            const clubNameLower = clubName.toLowerCase()
            const clubWords = clubNameLower.split(/[\s\-]+/).filter(w => w.length > 2)
            
            for (const a of Array.from(results)) {
              const href = (a as HTMLAnchorElement).href
              if (!href) continue
              
              // Skip unwanted domains
              if (href.includes('google.') ||
                  href.includes('facebook.com') ||
                  href.includes('instagram.com') ||
                  href.includes('youtube.com') ||
                  href.includes('twitter.com') ||
                  href.includes('linkedin.com') ||
                  href.includes('wikipedia.') ||
                  href.includes('volleybox.') ||
                  href.includes('volleyball.ch') ||
                  href.includes('support.google') ||
                  href.includes('accounts.google') ||
                  href.includes('maps.google') ||
                  href.includes('translate.google')) continue
              
              // Check if URL looks like a club website
              const hrefLower = href.toLowerCase()
              
              // Prioritize URLs that contain club name parts
              for (const word of clubWords) {
                if (hrefLower.includes(word)) {
                  return href.split('?')[0] // Remove query params
                }
              }
              
              // Also accept .ch domains as likely Swiss club sites
              if (hrefLower.includes('.ch/') || hrefLower.endsWith('.ch')) {
                return href.split('?')[0]
              }
            }
            
            return ''
          }, club.name)
          
          if (website) {
            // Update database
            await prisma.club.update({
              where: { id: club.id },
              data: { website }
            })
            club.website = website
            websitesFound++
            console.log(`  Website: ${website}`)
          } else {
            console.log(`  No website found`)
          }
          
          // Rate limiting for Google
          await page.waitForTimeout(1000 + Math.random() * 1000)
          
        } catch (e: any) {
          console.log(`  Search error: ${e.message?.substring(0, 40)}`)
        }
      }
      
      // STEP 2: Get logo from website if we have one
      if (club.website && !club.logo) {
        try {
          await page.goto(club.website, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
          })
          await page.waitForTimeout(2000)
          
          const logo = await page.evaluate((clubName) => {
            const images = document.querySelectorAll('img')
            const namePart = clubName.split(/[\s\-]+/)[0].toLowerCase()
            
            // First pass: look for explicit logo images
            for (const img of Array.from(images)) {
              if (!img.src) continue
              
              const alt = (img.alt || '').toLowerCase()
              const cls = (img.className || '').toLowerCase()
              const id = (img.id || '').toLowerCase()
              const src = img.src.toLowerCase()
              
              // Skip tiny images
              if ((img.naturalWidth > 0 && img.naturalWidth < 40) ||
                  (img.naturalHeight > 0 && img.naturalHeight < 40)) continue
              
              if (alt.includes('logo') || cls.includes('logo') || 
                  id.includes('logo') || src.includes('logo') ||
                  alt.includes(namePart)) {
                return img.src
              }
            }
            
            // Second pass: try header/nav images
            const headerSelectors = [
              'header img',
              '.header img',
              'nav img',
              '.navbar img',
              '.navbar-brand img',
              '.site-logo img',
              '.logo img',
              '#logo img',
              'a[href="/"] img',
              'a[href="./"] img'
            ]
            
            for (const selector of headerSelectors) {
              const img = document.querySelector(selector) as HTMLImageElement
              if (img?.src) {
                // Skip tiny images
                if ((img.naturalWidth > 0 && img.naturalWidth < 40) ||
                    (img.naturalHeight > 0 && img.naturalHeight < 40)) continue
                return img.src
              }
            }
            
            return ''
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
          console.log(`  Logo error: ${e.message?.substring(0, 40)}`)
        }
      }
      
      // Save progress every 20 clubs
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
