/**
 * Swiss Volley Club Scraper - Improved version
 * 
 * Collects from https://www.volleyball.ch/de/verband/services/verein-suchen:
 * - Club name
 * - Postal code & town
 * - Canton (mapped from postal code)
 * - Website URL (from "Vereinswebseite" links)
 * - League participation (Men, Women, Junioren, Juniorinnen)
 * 
 * Then visits each website to collect logo
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

async function main() {
  console.log('='.repeat(60))
  console.log('Swiss Volley Club Scraper v2')
  console.log('='.repeat(60))
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page = await browser.newPage()
  
  const clubs: ClubData[] = []
  const baseUrl = 'https://www.volleyball.ch/de/verband/services/verein-suchen'
  
  try {
    console.log('\n=== STEP 1: Collecting clubs from Swiss Volley ===\n')
    
    let pageNum = 1
    let totalPages = 1
    
    // Navigate to first page
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(5000)
    
    // Get total pages first
    totalPages = await page.evaluate(() => {
      const paginationLinks = document.querySelectorAll('a[href*="page_n1358="]')
      let maxPage = 1
      paginationLinks.forEach(link => {
        const match = link.getAttribute('href')?.match(/page_n1358=(\d+)/)
        if (match) {
          const pageNum = parseInt(match[1])
          if (pageNum > maxPage) maxPage = pageNum
        }
      })
      return maxPage
    })
    
    console.log(`Found ${totalPages} pages to scrape`)
    
    while (pageNum <= totalPages) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page_n1358=${pageNum}`
      console.log(`\n--- Page ${pageNum}/${totalPages} ---`)
      
      if (pageNum > 1) {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
        await page.waitForTimeout(3000)
      }
      
      // Get all clubs on this page by looking for the pattern:
      // Club cards have: name, postal code, town, Kontakt email, Angebot, and optionally Vereinswebseite link
      const pageClubs = await page.evaluate(() => {
        const results: any[] = []
        const processedNames = new Set<string>()
        
        // The page content shows clubs in a list format
        // Look for text blocks with the club pattern
        const content = document.body.innerText
        
        // Split content into potential club blocks
        // Pattern: Club Name\nPostal Town\nKontakt: email\nAngebot\n...
        const blocks = content.split(/(?=\n[A-Za-zÀ-ÿ#][^\n]+\n\d{4}\s+[A-Za-zÀ-ÿ])/)
        
        for (const block of blocks) {
          // Match club entry pattern
          const match = block.match(/\n?([A-Za-zÀ-ÿ#][^\n]+)\n(\d{4})\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\n|Kontakt)/)
          if (match) {
            const name = match[1].trim()
            const postalCode = match[2]
            const town = match[3].trim()
            
            // Skip if already processed or invalid
            if (processedNames.has(name) || name.length < 2 || name.length > 60) continue
            if (name.includes('Page') || name.includes('Angebot')) continue
            
            processedNames.add(name)
            
            // Extract email
            const emailMatch = block.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
            const email = emailMatch ? emailMatch[1] : ''
            
            // Check offerings
            const hasMen = block.includes('Volleyball Männer')
            const hasWomen = block.includes('Volleyball Frauen')
            const hasJunioren = block.includes('Volleyball Junioren')
            const hasJuniorinnen = block.includes('Volleyball Juniorinnen')
            
            results.push({
              name,
              postalCode,
              town,
              email,
              hasMen,
              hasWomen,
              hasJunioren,
              hasJuniorinnen
            })
          }
        }
        
        return results
      })
      
      // Get website links from this page
      const websiteLinks = await page.evaluate(() => {
        const links: { [key: string]: string } = {}
        const anchors = document.querySelectorAll('a')
        
        anchors.forEach(anchor => {
          const href = anchor.href
          const text = anchor.textContent?.trim()
          
          if (text === 'Vereinswebseite' && href && !href.includes('volleyball.ch')) {
            // Find club name by looking at nearby DOM content
            let parent = anchor.parentElement
            for (let i = 0; i < 15 && parent; i++) {
              const parentText = parent.textContent || ''
              // Look for postal code pattern to find club name before it
              const nameMatch = parentText.match(/^([A-Za-zÀ-ÿ#][A-Za-zÀ-ÿ0-9\s\-\'\.]+?)\d{4}/)
              if (nameMatch) {
                const clubName = nameMatch[1].trim()
                if (clubName.length > 2 && clubName.length < 60) {
                  links[clubName] = href
                  break
                }
              }
              parent = parent.parentElement
            }
          }
        })
        
        return links
      })
      
      console.log(`  Found ${pageClubs.length} clubs, ${Object.keys(websiteLinks).length} website links`)
      
      // Add clubs to our list
      for (const club of pageClubs) {
        if (clubs.some(c => c.name === club.name)) continue
        
        clubs.push({
          name: club.name,
          postalCode: club.postalCode,
          town: club.town,
          canton: getCantonFromPostalCode(club.postalCode),
          website: websiteLinks[club.name] || '',
          logo: '',
          email: club.email,
          hasMen: club.hasMen,
          hasWomen: club.hasWomen,
          hasJunioren: club.hasJunioren,
          hasJuniorinnen: club.hasJuniorinnen
        })
      }
      
      pageNum++
    }
    
    // Save step 1 results
    const step1Path = path.join(__dirname, '../data/clubs-step1-leagues.json')
    fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
    console.log(`\nStep 1 complete: ${clubs.length} clubs`)
    console.log(`With websites: ${clubs.filter(c => c.website).length}`)
    
    // STEP 2: Visit each website to get logos
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
          const firstPart = clubName.split(' ')[0].toLowerCase()
          
          for (const img of Array.from(images)) {
            const src = img.src
            if (!src) continue
            
            const alt = (img.alt || '').toLowerCase()
            const classes = (img.className || '').toLowerCase()
            const srcLower = src.toLowerCase()
            
            // Skip small images
            if ((img.naturalWidth > 0 && img.naturalWidth < 30) || 
                (img.naturalHeight > 0 && img.naturalHeight < 30)) continue
            
            if (alt.includes('logo') || classes.includes('logo') || 
                srcLower.includes('logo') || alt.includes(firstPart)) {
              return src
            }
          }
          
          // Try header/nav area
          const header = document.querySelector('header, .header, nav, .navbar, .site-logo')
          if (header) {
            const img = header.querySelector('img')
            if (img?.src) return img.src
          }
          
          return ''
        }, club.name)
        
        if (logo) {
          club.logo = logo
          logosFound++
          console.log(`  ✓ Logo`)
        } else {
          console.log(`  ✗ No logo`)
        }
        
        // Save progress
        if ((i + 1) % 10 === 0) {
          fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
        }
        
      } catch (e: any) {
        console.log(`  ✗ Error: ${e.message?.substring(0, 40)}`)
      }
    }
    
    // Save final results
    const finalPath = path.join(__dirname, '../data/clubs-complete.json')
    fs.writeFileSync(finalPath, JSON.stringify(clubs, null, 2))
    
    console.log('\n' + '='.repeat(60))
    console.log('COMPLETE!')
    console.log('='.repeat(60))
    console.log(`Total clubs: ${clubs.length}`)
    console.log(`With website: ${clubs.filter(c => c.website).length}`)
    console.log(`With logo: ${clubs.filter(c => c.logo).length}`)
    console.log(`Men's teams: ${clubs.filter(c => c.hasMen).length}`)
    console.log(`Women's teams: ${clubs.filter(c => c.hasWomen).length}`)
    console.log(`\nSaved to: ${finalPath}`)
    
  } finally {
    await browser.close()
  }
}

main().catch(console.error)
