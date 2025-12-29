/**
 * Step 1: Collect club names and league participation from Swiss Volley
 * Step 2: Google each club to find their official website
 * Step 3: Visit each website to collect their logo
 */

import { chromium, Browser, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ClubData {
  name: string
  postalCode: string
  town: string
  email: string
  website: string
  logo: string
  // League participation
  hasMenNLA: boolean
  hasMenNLB: boolean
  hasMen1L: boolean
  hasMen2L: boolean
  hasMen3L: boolean
  hasMen4L: boolean
  hasMen5L: boolean
  hasWomenNLA: boolean
  hasWomenNLB: boolean
  hasWomen1L: boolean
  hasWomen2L: boolean
  hasWomen3L: boolean
  hasWomen4L: boolean
  hasWomen5L: boolean
  hasMenU23: boolean
  hasMenU20: boolean
  hasMenU18: boolean
  hasWomenU23: boolean
  hasWomenU20: boolean
  hasWomenU18: boolean
}

const dataDir = path.join(__dirname, '../data')
const rawDataPath = path.join(dataDir, 'clubs-step1-leagues.json')
const withWebsitesPath = path.join(dataDir, 'clubs-step2-websites.json')
const finalDataPath = path.join(dataDir, 'clubs-step3-complete.json')

// Parse the angebot text to determine league participation
function parseLeagues(angebot: string): Partial<ClubData> {
  const result: Partial<ClubData> = {
    hasMenNLA: false, hasMenNLB: false, hasMen1L: false, hasMen2L: false,
    hasMen3L: false, hasMen4L: false, hasMen5L: false,
    hasWomenNLA: false, hasWomenNLB: false, hasWomen1L: false, hasWomen2L: false,
    hasWomen3L: false, hasWomen4L: false, hasWomen5L: false,
    hasMenU23: false, hasMenU20: false, hasMenU18: false,
    hasWomenU23: false, hasWomenU20: false, hasWomenU18: false,
  }
  
  // Check for men's leagues - "Männer (NLA – 5L)" means NLA to 5L range
  if (angebot.includes('Volleyball Männer') || angebot.includes('Männer (NLA')) {
    // Parse the range
    const menMatch = angebot.match(/Männer\s*\(([^)]+)\)/)
    if (menMatch) {
      const range = menMatch[1]
      if (range.includes('NLA')) result.hasMenNLA = true
      if (range.includes('NLB') || (range.includes('NLA') && range.includes('–'))) result.hasMenNLB = true
      if (range.includes('1L') || range.includes('1. Liga') || (range.includes('NL') && range.includes('5L'))) result.hasMen1L = true
      if (range.includes('2L') || range.includes('2. Liga') || (range.includes('1L') && range.includes('5L')) || (range.includes('NL') && range.includes('5L'))) result.hasMen2L = true
      if (range.includes('3L') || range.includes('3. Liga') || (range.includes('–') && range.includes('5L'))) result.hasMen3L = true
      if (range.includes('4L') || range.includes('4. Liga') || (range.includes('–') && range.includes('5L'))) result.hasMen4L = true
      if (range.includes('5L') || range.includes('5. Liga')) result.hasMen5L = true
    }
  }
  
  // Check for women's leagues
  if (angebot.includes('Volleyball Frauen') || angebot.includes('Frauen (NLA')) {
    const womenMatch = angebot.match(/Frauen\s*\(([^)]+)\)/)
    if (womenMatch) {
      const range = womenMatch[1]
      if (range.includes('NLA')) result.hasWomenNLA = true
      if (range.includes('NLB') || (range.includes('NLA') && range.includes('–'))) result.hasWomenNLB = true
      if (range.includes('1L') || range.includes('1. Liga') || (range.includes('NL') && range.includes('5L'))) result.hasWomen1L = true
      if (range.includes('2L') || range.includes('2. Liga') || (range.includes('1L') && range.includes('5L')) || (range.includes('NL') && range.includes('5L'))) result.hasWomen2L = true
      if (range.includes('3L') || range.includes('3. Liga') || (range.includes('–') && range.includes('5L'))) result.hasWomen3L = true
      if (range.includes('4L') || range.includes('4. Liga') || (range.includes('–') && range.includes('5L'))) result.hasWomen4L = true
      if (range.includes('5L') || range.includes('5. Liga')) result.hasWomen5L = true
    }
  }
  
  // Check for juniors (male)
  if (angebot.includes('Volleyball Junioren') || angebot.includes('Junioren (U23')) {
    result.hasMenU23 = true
    result.hasMenU20 = true
    result.hasMenU18 = true
  }
  
  // Check for juniors (female)
  if (angebot.includes('Volleyball Juniorinnen') || angebot.includes('Juniorinnen (U23')) {
    result.hasWomenU23 = true
    result.hasWomenU20 = true
    result.hasWomenU18 = true
  }
  
  return result
}

// Step 1: Scrape Swiss Volley for club names and league participation
async function step1_scrapeSwissVolley() {
  console.log('\n=== STEP 1: Scraping Swiss Volley for clubs and leagues ===\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  const clubs: ClubData[] = []
  let pageNum = 1
  const baseUrl = 'https://www.volleyball.ch/de/verband/services/verein-suchen'
  
  try {
    while (true) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page_n1358=${pageNum}`
      console.log(`Page ${pageNum}: ${url}`)
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Extract clubs from this page
      const pageClubs = await page.evaluate(() => {
        const results: any[] = []
        
        // Get all text blocks that look like club entries
        const allText = document.body.innerText
        
        // Find club blocks - they typically have postal code + town + Kontakt + Angebot
        const clubBlocks = allText.split(/(?=\n[A-Za-zÀ-ÿ#][A-Za-zÀ-ÿ0-9\s\-\'\.]+\n\d{4}\s+[A-Za-zÀ-ÿ])/)
        
        for (const block of clubBlocks) {
          // Match: Club Name, Postal Town, Kontakt email, Angebot details
          const nameMatch = block.match(/^([A-Za-zÀ-ÿ#][A-Za-zÀ-ÿ0-9\s\-\'\.]+)\n(\d{4})\s+([A-Za-zÀ-ÿ\-\s]+)\n/)
          if (nameMatch) {
            const name = nameMatch[1].trim()
            const postalCode = nameMatch[2]
            const town = nameMatch[3].trim()
            
            // Get email
            const emailMatch = block.match(/Kontakt:\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
            const email = emailMatch ? emailMatch[1] : ''
            
            // Get angebot section
            const angebotMatch = block.match(/Angebot([\s\S]*?)(?:Vereinswebseite|$)/)
            const angebot = angebotMatch ? angebotMatch[1] : block
            
            results.push({ name, postalCode, town, email, angebot })
          }
        }
        
        return results
      })
      
      // Also try to get website links directly from the page
      const websiteLinks = await page.evaluate(() => {
        const links: { [key: string]: string } = {}
        const anchors = document.querySelectorAll('a[href]')
        anchors.forEach(a => {
          const href = (a as HTMLAnchorElement).href
          const text = a.textContent?.trim() || ''
          if (text === 'Vereinswebseite' && href && !href.includes('volleyball.ch') && !href.includes('mailto:')) {
            // Get the club name from nearby text
            const parent = a.closest('div, article, section')
            if (parent) {
              const parentText = parent.textContent || ''
              const nameMatch = parentText.match(/^([A-Za-zÀ-ÿ#][A-Za-zÀ-ÿ0-9\s\-\'\.]+)\n?\d{4}/)
              if (nameMatch) {
                links[nameMatch[1].trim()] = href
              }
            }
          }
        })
        return links
      })
      
      for (const club of pageClubs) {
        // Skip if already added
        if (clubs.some(c => c.name === club.name)) continue
        
        const leagues = parseLeagues(club.angebot)
        const website = websiteLinks[club.name] || ''
        
        clubs.push({
          name: club.name,
          postalCode: club.postalCode,
          town: club.town,
          email: club.email,
          website: website,
          logo: '',
          ...leagues as any
        })
        
        console.log(`  Found: ${club.name} (${club.town})`)
      }
      
      // Check for next page
      const hasNextPage = await page.evaluate((currentPage) => {
        const nextLink = document.querySelector(`a[href*="page_n1358=${currentPage + 1}"]`)
        return !!nextLink
      }, pageNum)
      
      if (!hasNextPage) {
        console.log('No more pages.')
        break
      }
      
      pageNum++
      if (pageNum > 50) break // Safety limit
    }
  } finally {
    await browser.close()
  }
  
  // Save results
  fs.writeFileSync(rawDataPath, JSON.stringify(clubs, null, 2))
  console.log(`\nStep 1 complete: Saved ${clubs.length} clubs to ${rawDataPath}`)
  
  return clubs
}

// Step 2: Google each club to find their official website
async function step2_findWebsites(clubs: ClubData[]) {
  console.log('\n=== STEP 2: Finding club websites via Google ===\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Set a realistic user agent
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8'
  })
  
  let updated = 0
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      
      // Skip if already has a website
      if (club.website) {
        console.log(`[${i + 1}/${clubs.length}] ${club.name} - Already has website: ${club.website}`)
        continue
      }
      
      console.log(`[${i + 1}/${clubs.length}] Searching for: ${club.name} volleyball`)
      
      try {
        // Search Google
        const searchQuery = encodeURIComponent(`${club.name} volleyball schweiz`)
        await page.goto(`https://www.google.com/search?q=${searchQuery}&hl=de`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        })
        
        await page.waitForTimeout(1500)
        
        // Accept cookies if prompted
        const acceptButton = await page.$('button:has-text("Alle akzeptieren"), button:has-text("Accept all")')
        if (acceptButton) {
          await acceptButton.click()
          await page.waitForTimeout(1000)
        }
        
        // Get the first few result URLs
        const searchResults = await page.evaluate(() => {
          const links: string[] = []
          const anchors = document.querySelectorAll('a[href^="http"]')
          anchors.forEach(a => {
            const href = (a as HTMLAnchorElement).href
            // Filter out Google, social media, and known non-club sites
            if (!href.includes('google.') && 
                !href.includes('facebook.com') && 
                !href.includes('instagram.com') &&
                !href.includes('youtube.com') &&
                !href.includes('twitter.com') &&
                !href.includes('linkedin.com') &&
                !href.includes('volleyball.ch') &&
                !href.includes('wikipedia.') &&
                !href.includes('volleybox.') &&
                links.length < 5) {
              links.push(href)
            }
          })
          return links
        })
        
        // Use the first result as the website
        if (searchResults.length > 0) {
          club.website = searchResults[0]
          console.log(`  Found: ${club.website}`)
          updated++
        } else {
          console.log(`  No website found`)
        }
        
        // Save progress every 10 clubs
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(withWebsitesPath, JSON.stringify(clubs, null, 2))
          console.log(`  [Progress saved]`)
        }
        
        // Be nice to Google - add delay
        await page.waitForTimeout(2000 + Math.random() * 2000)
        
      } catch (error) {
        console.log(`  Error: ${error}`)
      }
    }
  } finally {
    await browser.close()
  }
  
  // Save final results
  fs.writeFileSync(withWebsitesPath, JSON.stringify(clubs, null, 2))
  console.log(`\nStep 2 complete: Updated ${updated} clubs with websites`)
  
  return clubs
}

// Step 3: Visit each website to collect their logo
async function step3_collectLogos(clubs: ClubData[]) {
  console.log('\n=== STEP 3: Collecting club logos ===\n')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  let collected = 0
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      
      // Skip if no website or already has logo
      if (!club.website) {
        console.log(`[${i + 1}/${clubs.length}] ${club.name} - No website, skipping`)
        continue
      }
      
      if (club.logo) {
        console.log(`[${i + 1}/${clubs.length}] ${club.name} - Already has logo`)
        continue
      }
      
      console.log(`[${i + 1}/${clubs.length}] Visiting: ${club.website}`)
      
      try {
        await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(2000)
        
        // Try to find a logo image
        const logoUrl = await page.evaluate((clubName) => {
          // Look for images that might be logos
          const images = document.querySelectorAll('img')
          let bestLogo = ''
          
          for (const img of Array.from(images)) {
            const src = img.src || ''
            const alt = (img.alt || '').toLowerCase()
            const className = (img.className || '').toLowerCase()
            const id = (img.id || '').toLowerCase()
            
            // Check if this looks like a logo
            if (src && (
              alt.includes('logo') ||
              className.includes('logo') ||
              id.includes('logo') ||
              src.includes('logo') ||
              alt.includes(clubName.toLowerCase().split(' ')[0])
            )) {
              // Prefer SVG or PNG
              if (src.includes('.svg') || src.includes('.png')) {
                return src
              }
              if (!bestLogo) {
                bestLogo = src
              }
            }
          }
          
          // If no logo found, try header/nav images
          if (!bestLogo) {
            const headerImg = document.querySelector('header img, nav img, .header img, .logo img')
            if (headerImg) {
              bestLogo = (headerImg as HTMLImageElement).src
            }
          }
          
          return bestLogo
        }, club.name)
        
        if (logoUrl) {
          club.logo = logoUrl
          console.log(`  Logo: ${logoUrl.substring(0, 60)}...`)
          collected++
        } else {
          console.log(`  No logo found`)
        }
        
        // Save progress every 10 clubs
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(finalDataPath, JSON.stringify(clubs, null, 2))
          console.log(`  [Progress saved]`)
        }
        
      } catch (error) {
        console.log(`  Error: ${error}`)
      }
    }
  } finally {
    await browser.close()
  }
  
  // Save final results
  fs.writeFileSync(finalDataPath, JSON.stringify(clubs, null, 2))
  console.log(`\nStep 3 complete: Collected ${collected} logos`)
  
  return clubs
}

// Main execution
async function main() {
  console.log('='.repeat(60))
  console.log('Swiss Volleyball Club Data Collector')
  console.log('='.repeat(60))
  
  // Check if we have existing data to resume from
  let clubs: ClubData[] = []
  
  if (fs.existsSync(withWebsitesPath)) {
    console.log('\nFound existing data from Step 2, resuming from Step 3...')
    clubs = JSON.parse(fs.readFileSync(withWebsitesPath, 'utf-8'))
    clubs = await step3_collectLogos(clubs)
  } else if (fs.existsSync(rawDataPath)) {
    console.log('\nFound existing data from Step 1, resuming from Step 2...')
    clubs = JSON.parse(fs.readFileSync(rawDataPath, 'utf-8'))
    clubs = await step2_findWebsites(clubs)
    clubs = await step3_collectLogos(clubs)
  } else {
    // Start fresh
    clubs = await step1_scrapeSwissVolley()
    clubs = await step2_findWebsites(clubs)
    clubs = await step3_collectLogos(clubs)
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE!')
  console.log('='.repeat(60))
  console.log(`Total clubs: ${clubs.length}`)
  console.log(`With websites: ${clubs.filter(c => c.website).length}`)
  console.log(`With logos: ${clubs.filter(c => c.logo).length}`)
  console.log(`\nFinal data saved to: ${finalDataPath}`)
}

main().catch(console.error)
