/**
 * Swiss Volley Club Scraper - Direct extraction
 * 
 * Extracts clubs directly from Swiss Volley page by finding
 * all "Vereinswebseite" links and their parent club info together
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
  console.log('Swiss Volley Club Scraper - Direct Extraction')
  console.log('='.repeat(60))
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page = await browser.newPage()
  
  const clubs: ClubData[] = []
  const baseUrl = 'https://www.volleyball.ch/de/verband/services/verein-suchen'
  
  try {
    console.log('\n=== Collecting all clubs with websites ===\n')
    
    let pageNum = 1
    
    while (pageNum <= 50) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page_n1358=${pageNum}`
      console.log(`Page ${pageNum}: ${url}`)
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(3000)
      
      // Extract ALL clubs from this page
      // For each "Vereinswebseite" link, walk up to find the full club info block
      const pageClubs = await page.evaluate(() => {
        const results: any[] = []
        
        // Find all website links
        const websiteLinks = document.querySelectorAll('a')
        
        websiteLinks.forEach(anchor => {
          const text = anchor.textContent?.trim()
          const href = anchor.href
          
          if (text === 'Vereinswebseite' && href && !href.includes('volleyball.ch')) {
            // Walk up to find the club container
            let container = anchor.parentElement
            let fullText = ''
            
            for (let i = 0; i < 15 && container; i++) {
              fullText = container.textContent || ''
              // Look for the full club info pattern: Name + Postal + Town + Kontakt + Angebot
              if (fullText.includes('Angebot') && fullText.includes('Kontakt') && /\d{4}/.test(fullText)) {
                break
              }
              container = container.parentElement
            }
            
            // Parse the text
            // Pattern: ClubName\nPostal Town\nKontakt: email\nAngebot\n...
            const lines = fullText.split(/[\n\r]+/).map(l => l.trim()).filter(l => l)
            
            let name = ''
            let postalCode = ''
            let town = ''
            let email = ''
            let hasMen = false
            let hasWomen = false
            let hasJunioren = false
            let hasJuniorinnen = false
            
            // Find the name (first line that's not empty and doesn't start with known labels)
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i]
              
              // Skip known labels
              if (line.startsWith('Angebot') || line.startsWith('Kontakt') || 
                  line.startsWith('Volleyball') || line.startsWith('Kids') ||
                  line.startsWith('Beach') || line.startsWith('Weitere') ||
                  line === 'Vereinswebseite') continue
              
              // Check if this line has postal code pattern
              const postalMatch = line.match(/^(\d{4})\s+(.+)$/)
              if (postalMatch) {
                postalCode = postalMatch[1]
                town = postalMatch[2]
                // Name should be the previous non-empty line
                if (i > 0 && !name) {
                  for (let j = i - 1; j >= 0; j--) {
                    const prevLine = lines[j]
                    if (prevLine && !prevLine.startsWith('Angebot') && 
                        !prevLine.startsWith('Kontakt') && prevLine.length > 2 &&
                        prevLine.length < 60) {
                      name = prevLine
                      break
                    }
                  }
                }
              }
              
              // Check for email
              const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
              if (emailMatch) {
                email = emailMatch[1]
              }
            }
            
            // Check offerings
            hasMen = fullText.includes('Volleyball Männer')
            hasWomen = fullText.includes('Volleyball Frauen')
            hasJunioren = fullText.includes('Volleyball Junioren')
            hasJuniorinnen = fullText.includes('Volleyball Juniorinnen')
            
            if (name && name.length > 1) {
              results.push({
                name,
                postalCode,
                town,
                email,
                website: href,
                hasMen,
                hasWomen,
                hasJunioren,
                hasJuniorinnen
              })
            }
          }
        })
        
        // Also find clubs WITHOUT website links
        // Look for club patterns in the text that don't have Vereinswebseite
        const fullPageText = document.body.innerText
        const clubBlocks = fullPageText.split(/\n(?=[A-Za-zÀ-ÿ#][^\n]{2,50}\n\d{4}\s+[A-Za-zÀ-ÿ])/)
        
        for (const block of clubBlocks) {
          // Check if this block already has a website (skip if so)
          if (block.includes('Vereinswebseite')) continue
          
          const match = block.match(/^([A-Za-zÀ-ÿ#][^\n]{2,50})\n(\d{4})\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\n|Kontakt)/)
          if (match) {
            const name = match[1].trim()
            const postalCode = match[2]
            const town = match[3].trim()
            
            // Skip if already found
            if (results.some(r => r.name === name)) continue
            
            const emailMatch = block.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
            
            results.push({
              name,
              postalCode,
              town,
              email: emailMatch ? emailMatch[1] : '',
              website: '',
              hasMen: block.includes('Volleyball Männer'),
              hasWomen: block.includes('Volleyball Frauen'),
              hasJunioren: block.includes('Volleyball Junioren'),
              hasJuniorinnen: block.includes('Volleyball Juniorinnen')
            })
          }
        }
        
        return results
      })
      
      console.log(`  Found ${pageClubs.length} clubs`)
      
      // Add to our list (deduplicate)
      for (const club of pageClubs) {
        if (clubs.some(c => c.name === club.name)) continue
        
        clubs.push({
          name: club.name,
          postalCode: club.postalCode,
          town: club.town,
          canton: getCantonFromPostalCode(club.postalCode),
          website: club.website,
          logo: '',
          email: club.email,
          hasMen: club.hasMen,
          hasWomen: club.hasWomen,
          hasJunioren: club.hasJunioren,
          hasJuniorinnen: club.hasJuniorinnen
        })
        
        if (club.website) {
          console.log(`    + ${club.name} | ${club.website}`)
        }
      }
      
      // Check for next page
      const hasNext = await page.evaluate((currentPage) => {
        const allLinks = document.querySelectorAll('a')
        for (const link of Array.from(allLinks)) {
          const href = link.getAttribute('href') || ''
          const text = link.textContent?.trim() || ''
          
          const paramMatch = href.match(/page_n1358=(\d+)/)
          if (paramMatch && parseInt(paramMatch[1]) > currentPage) return true
          if (text === String(currentPage + 1)) return true
        }
        return false
      }, pageNum)
      
      if (!hasNext) {
        console.log('\nNo more pages.')
        break
      }
      
      pageNum++
    }
    
    // Save step 1 results
    const step1Path = path.join(__dirname, '../data/clubs-step1-leagues.json')
    fs.writeFileSync(step1Path, JSON.stringify(clubs, null, 2))
    
    console.log(`\nStep 1 complete: ${clubs.length} clubs`)
    console.log(`With websites: ${clubs.filter(c => c.website).length}`)
    
    // STEP 2: Collect logos from club websites
    console.log('\n=== Collecting logos ===\n')
    
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
