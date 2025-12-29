/**
 * Complete Swiss Volley Club Scraper
 * 
 * From https://www.volleyball.ch/de/verband/services/verein-suchen:
 * - Club name
 * - Canton (from postal code)
 * - Municipality/Town
 * - League participation (Men, Women, Junioren, Juniorinnen)
 * - Website URL (Vereinswebseite links)
 * 
 * Then visit each club website to collect their logo
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ClubData {
  name: string
  postalCode: string
  town: string
  canton: string
  website: string
  logo: string
  email: string
  hasMen: boolean
  hasWomen: boolean
  hasJunioren: boolean
  hasJuniorinnen: boolean
  hasKidsVolley: boolean
  hasBeach: boolean
}

// Map postal codes to cantons
function getCantonFromPostalCode(postalCode: string): string {
  const code = parseInt(postalCode)
  if (isNaN(code)) return ''
  
  if (code >= 1000 && code <= 1099) return 'VD'
  if (code >= 1100 && code <= 1199) return 'VD'
  if (code >= 1200 && code <= 1299) return 'GE'
  if (code >= 1300 && code <= 1399) return 'VD'
  if (code >= 1400 && code <= 1499) return 'VD'
  if (code >= 1500 && code <= 1599) return 'VD'
  if (code >= 1600 && code <= 1699) return 'FR'
  if (code >= 1700 && code <= 1799) return 'FR'
  if (code >= 1800 && code <= 1899) return 'VD'
  if (code >= 1900 && code <= 1999) return 'VS'
  if (code >= 2000 && code <= 2099) return 'NE'
  if (code >= 2100 && code <= 2299) return 'NE'
  if (code >= 2300 && code <= 2499) return 'NE'
  if (code >= 2500 && code <= 2699) return 'BE'
  if (code >= 2700 && code <= 2799) return 'BE'
  if (code >= 2800 && code <= 2999) return 'JU'
  if (code >= 3000 && code <= 3199) return 'BE'
  if (code >= 3200 && code <= 3299) return 'BE'
  if (code >= 3300 && code <= 3499) return 'BE'
  if (code >= 3500 && code <= 3599) return 'BE'
  if (code >= 3600 && code <= 3799) return 'BE'
  if (code >= 3800 && code <= 3899) return 'BE'
  if (code >= 3900 && code <= 3999) return 'VS'
  if (code >= 4000 && code <= 4099) return 'BS'
  if (code >= 4100 && code <= 4199) return 'BL'
  if (code >= 4200 && code <= 4299) return 'BL'
  if (code >= 4300 && code <= 4399) return 'AG'
  if (code >= 4400 && code <= 4499) return 'BL'
  if (code >= 4500 && code <= 4599) return 'SO'
  if (code >= 4600 && code <= 4699) return 'SO'
  if (code >= 4700 && code <= 4799) return 'SO'
  if (code >= 4800 && code <= 4899) return 'AG'
  if (code >= 4900 && code <= 4999) return 'BE'
  if (code >= 5000 && code <= 5099) return 'AG'
  if (code >= 5100 && code <= 5199) return 'AG'
  if (code >= 5200 && code <= 5399) return 'AG'
  if (code >= 5400 && code <= 5999) return 'AG'
  if (code >= 6000 && code <= 6099) return 'LU'
  if (code >= 6100 && code <= 6199) return 'LU'
  if (code >= 6200 && code <= 6299) return 'LU'
  if (code >= 6300 && code <= 6399) return 'ZG'
  if (code >= 6400 && code <= 6499) return 'SZ'
  if (code >= 6500 && code <= 6999) return 'TI'
  if (code >= 7000 && code <= 7799) return 'GR'
  if (code >= 8000 && code <= 8099) return 'ZH'
  if (code >= 8100 && code <= 8199) return 'ZH'
  if (code >= 8200 && code <= 8299) return 'SH'
  if (code >= 8300 && code <= 8399) return 'ZH'
  if (code >= 8400 && code <= 8499) return 'ZH'
  if (code >= 8500 && code <= 8599) return 'TG'
  if (code >= 8600 && code <= 8899) return 'ZH'
  if (code >= 8900 && code <= 8999) return 'ZH'
  if (code >= 9000 && code <= 9099) return 'SG'
  if (code >= 9100 && code <= 9199) return 'AR'
  if (code >= 9200 && code <= 9299) return 'TG'
  if (code >= 9300 && code <= 9499) return 'SG'
  if (code >= 9500 && code <= 9699) return 'SG'
  if (code >= 9700 && code <= 9799) return 'SG'
  if (code >= 9800 && code <= 9899) return 'TG'
  
  return ''
}

async function main() {
  console.log('='.repeat(60))
  console.log('Swiss Volley Club Complete Scraper')
  console.log('='.repeat(60))
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page = await browser.newPage()
  
  const clubs: ClubData[] = []
  const baseUrl = 'https://www.volleyball.ch/de/verband/services/verein-suchen'
  let pageNum = 1
  
  try {
    // STEP 1: Collect all club data from Swiss Volley
    console.log('\n=== STEP 1: Collecting clubs from Swiss Volley ===\n')
    
    while (true) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page_n1358=${pageNum}`
      console.log(`\nPage ${pageNum}: ${url}`)
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Extract club cards from the page
      const pageClubs = await page.evaluate(() => {
        const results: any[] = []
        
        // Find all club entries - they have a specific structure
        // Look for divs containing postal codes and "Angebot"
        const allElements = document.querySelectorAll('*')
        const processedNames = new Set<string>()
        
        for (const el of Array.from(allElements)) {
          const text = el.textContent || ''
          
          // Check if this element contains a club entry pattern
          // Club name followed by postal code (4 digits) and town
          const clubMatch = text.match(/^([A-Za-zÀ-ÿ#][A-Za-zÀ-ÿ0-9\s\-\'\.]+?)\s*(\d{4})\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\s*Kontakt:|$)/m)
          
          if (clubMatch && !processedNames.has(clubMatch[1].trim())) {
            const name = clubMatch[1].trim()
            const postalCode = clubMatch[2]
            const town = clubMatch[3].trim()
            
            // Only process if this looks like a valid club name
            if (name.length > 2 && name.length < 50) {
              processedNames.add(name)
              
              // Check offerings
              const hasMen = text.includes('Volleyball Männer')
              const hasWomen = text.includes('Volleyball Frauen')
              const hasJunioren = text.includes('Volleyball Junioren')
              const hasJuniorinnen = text.includes('Volleyball Juniorinnen')
              const hasKidsVolley = text.includes('Kids Volley')
              const hasBeach = text.includes('Beachvolleyball')
              
              // Get email
              const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
              const email = emailMatch ? emailMatch[1] : ''
              
              // Try to find website link in this element or nearby
              let website = ''
              const links = el.querySelectorAll('a[href]')
              for (const link of Array.from(links)) {
                const href = (link as HTMLAnchorElement).href
                if (href && !href.includes('volleyball.ch') && !href.includes('mailto:') && 
                    (link.textContent?.includes('Vereinswebseite') || href.match(/^https?:\/\/(?!www\.(facebook|instagram|youtube|twitter)\.com)/))) {
                  website = href
                  break
                }
              }
              
              results.push({
                name,
                postalCode,
                town,
                email,
                website,
                hasMen,
                hasWomen,
                hasJunioren,
                hasJuniorinnen,
                hasKidsVolley,
                hasBeach
              })
            }
          }
        }
        
        return results
      })
      
      // Also get website links more reliably
      const websiteLinks = await page.evaluate(() => {
        const links: { [key: string]: string } = {}
        const anchors = document.querySelectorAll('a')
        
        for (const a of Array.from(anchors)) {
          const href = a.href
          const text = a.textContent?.trim() || ''
          
          // Find "Vereinswebseite" links
          if (text === 'Vereinswebseite' && href && !href.includes('volleyball.ch')) {
            // Get the club context - look at parent element text
            let parent = a.parentElement
            for (let i = 0; i < 10 && parent; i++) {
              const parentText = parent.textContent || ''
              const nameMatch = parentText.match(/^([A-Za-zÀ-ÿ#][A-Za-zÀ-ÿ0-9\s\-\'\.]+?)\s*\d{4}/)
              if (nameMatch) {
                links[nameMatch[1].trim()] = href
                break
              }
              parent = parent.parentElement
            }
          }
        }
        
        return links
      })
      
      // Add clubs from this page
      for (const club of pageClubs) {
        // Skip duplicates
        if (clubs.some(c => c.name === club.name)) continue
        
        // Get website from the link map if not already set
        if (!club.website && websiteLinks[club.name]) {
          club.website = websiteLinks[club.name]
        }
        
        // Get canton from postal code
        const canton = getCantonFromPostalCode(club.postalCode)
        
        clubs.push({
          ...club,
          canton,
          logo: ''
        })
        
        console.log(`  ${club.name} | ${club.town} | ${canton} | Web: ${club.website ? 'Yes' : 'No'}`)
      }
      
      console.log(`  Found ${pageClubs.length} clubs on this page, ${clubs.length} total`)
      
      // Check for next page - look for pagination links
      const hasNextPage = await page.evaluate((currentPage) => {
        // Try multiple selectors for pagination
        const nextLink = document.querySelector(`a[href*="page_n1358=${currentPage + 1}"]`)
        if (nextLink) return true
        
        // Also check for "next" style pagination
        const paginationLinks = document.querySelectorAll('a[href*="page_n1358"]')
        for (const link of Array.from(paginationLinks)) {
          const href = (link as HTMLAnchorElement).href
          const pageMatch = href.match(/page_n1358=(\d+)/)
          if (pageMatch && parseInt(pageMatch[1]) > currentPage) {
            return true
          }
        }
        
        // Check if there's any indication of more pages
        const pageText = document.body.innerText
        if (pageText.includes(`Page ${currentPage + 1}`) || pageText.includes(`Seite ${currentPage + 1}`)) {
          return true
        }
        
        return false
      }, pageNum)
      
      console.log(`  Has next page: ${hasNextPage}`)
      
      if (!hasNextPage) {
        console.log('\nNo more pages.')
        break
      }
      
      pageNum++
      if (pageNum > 50) break // Safety limit
    }
    
    // Save Step 1 results
    const step1Path = path.join(__dirname, '../data/clubs-step1-leagues.json')
    fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
    console.log(`\nStep 1 complete: ${clubs.length} clubs saved to ${step1Path}`)
    console.log(`Clubs with websites: ${clubs.filter(c => c.website).length}`)
    
    // STEP 2: Visit each club website to collect logos
    console.log('\n=== STEP 2: Collecting logos from club websites ===\n')
    
    let logosCollected = 0
    const clubsWithWebsite = clubs.filter(c => c.website)
    
    for (let i = 0; i < clubsWithWebsite.length; i++) {
      const club = clubsWithWebsite[i]
      console.log(`[${i + 1}/${clubsWithWebsite.length}] ${club.name}: ${club.website}`)
      
      try {
        await page.goto(club.website, { 
          waitUntil: 'domcontentloaded', 
          timeout: 15000 
        })
        await page.waitForTimeout(2000)
        
        // Find logo image
        const logo = await page.evaluate((clubNamePart) => {
          const images = document.querySelectorAll('img')
          
          for (const img of Array.from(images)) {
            const src = img.src || ''
            if (!src) continue
            
            const alt = (img.alt || '').toLowerCase()
            const classes = (img.className || '').toLowerCase()
            const id = (img.id || '').toLowerCase()
            const srcLower = src.toLowerCase()
            
            // Skip tiny images
            if (img.naturalWidth < 30 && img.naturalWidth > 0) continue
            if (img.naturalHeight < 30 && img.naturalHeight > 0) continue
            
            // Check if this looks like a logo
            if (alt.includes('logo') || classes.includes('logo') || 
                id.includes('logo') || srcLower.includes('logo') ||
                alt.includes(clubNamePart.toLowerCase())) {
              return src
            }
          }
          
          // Try header/nav images as fallback
          const headerImg = document.querySelector('header img, .header img, nav img, .logo img, .navbar-brand img')
          if (headerImg) {
            const src = (headerImg as HTMLImageElement).src
            if (src) return src
          }
          
          // Try first reasonably-sized image in header
          const headerArea = document.querySelector('header, .header, nav, .navbar')
          if (headerArea) {
            const img = headerArea.querySelector('img')
            if (img && img.src) return img.src
          }
          
          return ''
        }, club.name.split(' ')[0])
        
        if (logo) {
          club.logo = logo
          logosCollected++
          console.log(`  ✓ Logo found`)
        } else {
          console.log(`  ✗ No logo`)
        }
        
        // Save progress every 10 clubs
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
          console.log(`  [Progress saved]`)
        }
        
      } catch (error: any) {
        console.log(`  ✗ Error: ${error.message?.substring(0, 50)}`)
      }
    }
    
    // Save final results
    const finalPath = path.join(__dirname, '../data/clubs-complete.json')
    fs.writeFileSync(finalPath, JSON.stringify(clubs, null, 2))
    
    console.log('\n' + '='.repeat(60))
    console.log('COMPLETE!')
    console.log('='.repeat(60))
    console.log(`Total clubs: ${clubs.length}`)
    console.log(`With canton: ${clubs.filter(c => c.canton).length}`)
    console.log(`With website: ${clubs.filter(c => c.website).length}`)
    console.log(`With logo: ${clubs.filter(c => c.logo).length}`)
    console.log(`With men's teams: ${clubs.filter(c => c.hasMen).length}`)
    console.log(`With women's teams: ${clubs.filter(c => c.hasWomen).length}`)
    console.log(`With juniors: ${clubs.filter(c => c.hasJunioren || c.hasJuniorinnen).length}`)
    console.log(`\nSaved to: ${finalPath}`)
    
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
