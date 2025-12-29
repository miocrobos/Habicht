/**
 * Swiss Volley Website Link Scraper
 * 
 * Uses the raw club data we already have, then scrapes Swiss Volley
 * to match clubs with their "Vereinswebseite" links
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface RawClub {
  name: string
  postalCode: string
  town: string
  website: string
  angebot: string
}

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
  if (code >= 3000 && code <= 3899) return 'BE'
  if (code >= 3900 && code <= 3999) return 'VS'
  if (code >= 4000 && code <= 4099) return 'BS'
  if (code >= 4100 && code <= 4199) return 'BL'
  if (code >= 4200 && code <= 4299) return 'BL'
  if (code >= 4300 && code <= 4399) return 'AG'
  if (code >= 4400 && code <= 4499) return 'BL'
  if (code >= 4500 && code <= 4699) return 'SO'
  if (code >= 4700 && code <= 4799) return 'SO'
  if (code >= 4800 && code <= 4899) return 'AG'
  if (code >= 4900 && code <= 4999) return 'BE'
  if (code >= 5000 && code <= 5999) return 'AG'
  if (code >= 6000 && code <= 6099) return 'LU'
  if (code >= 6100 && code <= 6199) return 'LU'
  if (code >= 6200 && code <= 6299) return 'LU'
  if (code >= 6300 && code <= 6399) return 'ZG'
  if (code >= 6400 && code <= 6499) return 'SZ'
  if (code >= 6500 && code <= 6999) return 'TI'
  if (code >= 7000 && code <= 7799) return 'GR'
  if (code >= 8000 && code <= 8199) return 'ZH'
  if (code >= 8200 && code <= 8299) return 'SH'
  if (code >= 8300 && code <= 8499) return 'ZH'
  if (code >= 8500 && code <= 8599) return 'TG'
  if (code >= 8600 && code <= 8999) return 'ZH'
  if (code >= 9000 && code <= 9099) return 'SG'
  if (code >= 9100 && code <= 9199) return 'AR'
  if (code >= 9200 && code <= 9299) return 'TG'
  if (code >= 9300 && code <= 9799) return 'SG'
  if (code >= 9800 && code <= 9899) return 'TG'
  
  return ''
}

function parseClubName(raw: string, postalCode: string): string {
  const idx = raw.indexOf(postalCode)
  if (idx > 0) return raw.substring(0, idx).trim()
  const match = raw.match(/^(.+?)(\d{4})/)
  return match ? match[1].trim() : raw.trim()
}

function parseEmail(raw: string): string {
  const match = raw.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1] : ''
}

async function main() {
  console.log('='.repeat(60))
  console.log('Swiss Volley Website & Logo Collector')
  console.log('='.repeat(60))
  
  // Load raw data
  const rawPath = path.join(__dirname, '../data/swiss-volleyball-clubs-raw.json')
  const rawData: RawClub[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  console.log(`\nLoaded ${rawData.length} clubs from raw data`)
  
  // Parse into structured format
  const clubs: ClubData[] = rawData.map(raw => ({
    name: parseClubName(raw.name, raw.postalCode),
    postalCode: raw.postalCode,
    town: raw.town,
    canton: getCantonFromPostalCode(raw.postalCode),
    website: '',
    logo: '',
    email: parseEmail(raw.name),
    hasMen: raw.angebot.includes('Volleyball Männer'),
    hasWomen: raw.angebot.includes('Volleyball Frauen'),
    hasJunioren: raw.angebot.includes('Volleyball Junioren'),
    hasJuniorinnen: raw.angebot.includes('Volleyball Juniorinnen')
  })).filter(c => c.name && c.name.length > 1)
  
  console.log(`Parsed ${clubs.length} valid clubs`)
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page = await browser.newPage()
  
  const baseUrl = 'https://www.volleyball.ch/de/verband/services/verein-suchen'
  
  try {
    console.log('\n=== STEP 1: Collecting website links from Swiss Volley ===\n')
    
    let pageNum = 1
    const allWebsiteLinks: { [key: string]: string } = {}
    
    while (true) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page_n1358=${pageNum}`
      console.log(`Page ${pageNum}: ${url}`)
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Get all "Vereinswebseite" links and their associated club context
      const pageLinks = await page.evaluate(() => {
        const links: { clubContext: string, website: string }[] = []
        const anchors = document.querySelectorAll('a')
        
        anchors.forEach(anchor => {
          const href = anchor.href
          const text = anchor.textContent?.trim()
          
          if (text === 'Vereinswebseite' && href && !href.includes('volleyball.ch')) {
            // Get surrounding text to identify the club
            let context = ''
            let el: Element | null = anchor
            
            // Walk up the DOM to find club context
            for (let i = 0; i < 10 && el; i++) {
              el = el.parentElement
              if (el) {
                const t = el.textContent || ''
                // Look for postal code pattern
                if (/\d{4}/.test(t) && t.length < 500) {
                  context = t.substring(0, 200)
                  break
                }
              }
            }
            
            links.push({ clubContext: context, website: href })
          }
        })
        
        return links
      })
      
      console.log(`  Found ${pageLinks.length} website links`)
      
      // Match links to clubs
      for (const link of pageLinks) {
        // Try to find which club this belongs to
        for (const club of clubs) {
          if (club.website) continue // Already has website
          
          // Check if club name appears in context
          const contextLower = link.clubContext.toLowerCase()
          const nameLower = club.name.toLowerCase()
          
          if (contextLower.includes(nameLower) || 
              (club.postalCode && link.clubContext.includes(club.postalCode))) {
            club.website = link.website
            allWebsiteLinks[club.name] = link.website
            console.log(`    ${club.name} → ${link.website}`)
            break
          }
        }
      }
      
      // Check for next page - look for "Page X" links where X > current
      const hasNext = await page.evaluate((currentPage) => {
        // Look for pagination links with text like "Page 2", "Page 3" etc
        // Or links containing page_n1358 parameter
        const allLinks = document.querySelectorAll('a')
        for (const link of Array.from(allLinks)) {
          const href = link.getAttribute('href') || ''
          const text = link.textContent?.trim() || ''
          
          // Check for page_n1358 parameter
          const paramMatch = href.match(/page_n1358=(\d+)/)
          if (paramMatch && parseInt(paramMatch[1]) > currentPage) {
            return true
          }
          
          // Check for "Page X" or just number text
          if (text === String(currentPage + 1) || text === `Page ${currentPage + 1}`) {
            return true
          }
        }
        return false
      }, pageNum)
      
      if (!hasNext) {
        console.log('\nNo more pages.')
        break
      }
      
      pageNum++
      if (pageNum > 50) break
    }
    
    const withWebsite = clubs.filter(c => c.website).length
    console.log(`\nMatched ${withWebsite} clubs with websites`)
    
    // Save progress
    const step1Path = path.join(__dirname, '../data/clubs-step1-leagues.json')
    fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
    
    // STEP 2: Visit websites to collect logos
    console.log('\n=== STEP 2: Collecting logos ===\n')
    
    const clubsWithWebsite = clubs.filter(c => c.website)
    let logosFound = 0
    
    for (let i = 0; i < clubsWithWebsite.length; i++) {
      const club = clubsWithWebsite[i]
      console.log(`[${i + 1}/${clubsWithWebsite.length}] ${club.name}`)
      
      try {
        await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(2000)
        
        const logo = await page.evaluate((clubName) => {
          const images = document.querySelectorAll('img')
          const namePart = clubName.split(' ')[0].toLowerCase()
          
          for (const img of Array.from(images)) {
            if (!img.src) continue
            
            const alt = (img.alt || '').toLowerCase()
            const cls = (img.className || '').toLowerCase()
            const src = img.src.toLowerCase()
            
            if ((img.naturalWidth > 0 && img.naturalWidth < 30) ||
                (img.naturalHeight > 0 && img.naturalHeight < 30)) continue
            
            if (alt.includes('logo') || cls.includes('logo') || 
                src.includes('logo') || alt.includes(namePart)) {
              return img.src
            }
          }
          
          // Fallback: header image
          const header = document.querySelector('header img, .header img, nav img, .logo img')
          if (header) return (header as HTMLImageElement).src
          
          return ''
        }, club.name)
        
        if (logo) {
          club.logo = logo
          logosFound++
          console.log(`  ✓ Logo`)
        } else {
          console.log(`  ✗ No logo`)
        }
        
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
        }
        
      } catch (e: any) {
        console.log(`  ✗ Error`)
      }
    }
    
    // Save final
    const finalPath = path.join(__dirname, '../data/clubs-complete.json')
    fs.writeFileSync(finalPath, JSON.stringify(clubs, null, 2))
    
    console.log('\n' + '='.repeat(60))
    console.log('COMPLETE!')
    console.log('='.repeat(60))
    console.log(`Total clubs: ${clubs.length}`)
    console.log(`With website: ${clubs.filter(c => c.website).length}`)
    console.log(`With logo: ${clubs.filter(c => c.logo).length}`)
    console.log(`\nSaved to: ${finalPath}`)
    
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
