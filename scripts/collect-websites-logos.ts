/**
 * Collect club websites via Google search and then logos from those websites
 * Uses the raw club data we already scraped from Swiss Volley
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ClubData {
  name: string
  postalCode: string
  town: string
  website: string
  logo: string
  email: string
  // League participation (parsed from "angebot")
  hasMen: boolean      // Has men's teams
  hasWomen: boolean    // Has women's teams
  hasJunioren: boolean // Has male juniors
  hasJuniorinnen: boolean // Has female juniors
}

const dataDir = path.join(__dirname, '../data')

// Parse name from raw data
function parseClubName(rawName: string, postalCode: string): string {
  const postalIndex = rawName.indexOf(postalCode)
  if (postalIndex > 0) {
    return rawName.substring(0, postalIndex).trim()
  }
  const match = rawName.match(/^(.+?)(\d{4})/)
  if (match) return match[1].trim()
  return rawName.trim()
}

// Parse league participation from angebot
function parseLeagues(angebot: string) {
  return {
    hasMen: angebot.includes('Volleyball Männer'),
    hasWomen: angebot.includes('Volleyball Frauen'),
    hasJunioren: angebot.includes('Volleyball Junioren'),
    hasJuniorinnen: angebot.includes('Volleyball Juniorinnen')
  }
}

// Extract email from raw data
function parseEmail(rawName: string): string {
  const match = rawName.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1] : ''
}

async function main() {
  console.log('='.repeat(60))
  console.log('Club Website & Logo Collector')
  console.log('='.repeat(60))
  
  // Load raw data
  const rawPath = path.join(dataDir, 'swiss-volleyball-clubs-raw.json')
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  
  console.log(`\nLoaded ${rawData.length} clubs from raw data`)
  
  // Parse into clean format
  const clubs: ClubData[] = rawData.map((raw: any) => ({
    name: parseClubName(raw.name, raw.postalCode),
    postalCode: raw.postalCode,
    town: raw.town,
    website: raw.website || '',
    logo: '',
    email: parseEmail(raw.name),
    ...parseLeagues(raw.angebot || raw.name)
  }))
  
  // Filter out invalid entries
  const validClubs = clubs.filter(c => c.name && c.name.length > 1)
  console.log(`Valid clubs: ${validClubs.length}`)
  
  // Check if we have progress file
  const progressPath = path.join(dataDir, 'clubs-with-websites.json')
  let clubsToProcess = validClubs
  
  if (fs.existsSync(progressPath)) {
    const existing = JSON.parse(fs.readFileSync(progressPath, 'utf-8'))
    console.log(`Found progress file with ${existing.length} clubs`)
    
    // Merge - keep existing website/logo data
    const existingMap = new Map(existing.map((c: ClubData) => [c.name, c]))
    for (const club of clubsToProcess) {
      const ex = existingMap.get(club.name)
      if (ex) {
        club.website = ex.website || club.website
        club.logo = ex.logo || club.logo
      }
    }
  }
  
  // Count how many need websites
  const needWebsite = clubsToProcess.filter(c => !c.website).length
  const needLogo = clubsToProcess.filter(c => c.website && !c.logo).length
  console.log(`Need website: ${needWebsite}`)
  console.log(`Need logo: ${needLogo}`)
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Set Swiss German locale
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'de-CH,de;q=0.9'
  })
  
  try {
    // STEP 1: Find websites via Google
    console.log('\n=== Finding websites via Google ===\n')
    
    let websitesFound = 0
    for (let i = 0; i < clubsToProcess.length; i++) {
      const club = clubsToProcess[i]
      
      if (club.website) {
        continue // Already has website
      }
      
      console.log(`[${i + 1}/${clubsToProcess.length}] Searching: "${club.name}"`)
      
      try {
        const searchQuery = encodeURIComponent(`${club.name} volleyball ${club.town}`)
        await page.goto(`https://www.google.com/search?q=${searchQuery}&hl=de`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        })
        
        await page.waitForTimeout(1500)
        
        // Handle cookie consent
        try {
          const consent = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Accept all")')
          if (await consent.isVisible({ timeout: 1000 })) {
            await consent.click()
            await page.waitForTimeout(500)
          }
        } catch {}
        
        // Get first non-social-media result
        const website = await page.evaluate(() => {
          const anchors = document.querySelectorAll('a[href^="http"]')
          for (const a of Array.from(anchors)) {
            const href = (a as HTMLAnchorElement).href
            if (href &&
                !href.includes('google.') &&
                !href.includes('facebook.com') &&
                !href.includes('instagram.com') &&
                !href.includes('youtube.com') &&
                !href.includes('twitter.com') &&
                !href.includes('linkedin.com') &&
                !href.includes('volleyball.ch') &&
                !href.includes('wikipedia.') &&
                !href.includes('volleybox.') &&
                !href.includes('support.google') &&
                !href.includes('accounts.google')) {
              return href
            }
          }
          return ''
        })
        
        if (website) {
          club.website = website
          websitesFound++
          console.log(`  → ${website}`)
        } else {
          console.log(`  → No website found`)
        }
        
        // Save progress
        if ((i + 1) % 5 === 0) {
          fs.writeFileSync(progressPath, JSON.stringify(clubsToProcess, null, 2))
        }
        
        // Rate limiting
        await page.waitForTimeout(1500 + Math.random() * 1500)
        
      } catch (error: any) {
        console.log(`  Error: ${error.message}`)
      }
    }
    
    console.log(`\nWebsites found: ${websitesFound}`)
    fs.writeFileSync(progressPath, JSON.stringify(clubsToProcess, null, 2))
    
    // STEP 2: Collect logos from websites
    console.log('\n=== Collecting logos ===\n')
    
    let logosFound = 0
    for (let i = 0; i < clubsToProcess.length; i++) {
      const club = clubsToProcess[i]
      
      if (!club.website || club.logo) {
        continue
      }
      
      console.log(`[${i + 1}/${clubsToProcess.length}] ${club.name}: ${club.website}`)
      
      try {
        await page.goto(club.website, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        })
        await page.waitForTimeout(1500)
        
        const logo = await page.evaluate((clubNamePart) => {
          const images = document.querySelectorAll('img')
          
          for (const img of Array.from(images)) {
            const src = img.src || ''
            const alt = (img.alt || '').toLowerCase()
            const classes = (img.className || '').toLowerCase()
            const id = (img.id || '').toLowerCase()
            
            // Skip tiny images or icons
            if (img.width < 30 || img.height < 30) continue
            
            // Check if it looks like a logo
            if (src && (
                alt.includes('logo') ||
                classes.includes('logo') ||
                id.includes('logo') ||
                src.toLowerCase().includes('logo') ||
                alt.includes(clubNamePart.toLowerCase())
            )) {
              return src
            }
          }
          
          // Try header images
          const headerImg = document.querySelector('header img, .header img, nav img, .navbar img, .logo img')
          if (headerImg && (headerImg as HTMLImageElement).src) {
            return (headerImg as HTMLImageElement).src
          }
          
          return ''
        }, club.name.split(' ')[0])
        
        if (logo) {
          club.logo = logo
          logosFound++
          console.log(`  → Logo found`)
        } else {
          console.log(`  → No logo`)
        }
        
        // Save progress
        if ((i + 1) % 5 === 0) {
          fs.writeFileSync(progressPath, JSON.stringify(clubsToProcess, null, 2))
        }
        
      } catch (error: any) {
        console.log(`  Error: ${error.message}`)
      }
    }
    
    console.log(`\nLogos found: ${logosFound}`)
    
  } finally {
    await browser.close()
  }
  
  // Save final data
  const finalPath = path.join(dataDir, 'clubs-complete.json')
  fs.writeFileSync(finalPath, JSON.stringify(clubsToProcess, null, 2))
  
  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE!')
  console.log('='.repeat(60))
  console.log(`Total clubs: ${clubsToProcess.length}`)
  console.log(`With websites: ${clubsToProcess.filter(c => c.website).length}`)
  console.log(`With logos: ${clubsToProcess.filter(c => c.logo).length}`)
  console.log(`\nSaved to: ${finalPath}`)
}

main().catch(console.error)
