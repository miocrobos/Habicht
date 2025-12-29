/**
 * Scrape detailed club information from Swiss Volley
 * This script visits each club's detail page to get:
 * - Club logo
 * - Official website
 * - Specific league participation (not just ranges)
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

interface ClubDetail {
  name: string
  postalCode: string
  town: string
  website: string
  logo: string
  email: string
  leagues: {
    menNLA: boolean
    menNLB: boolean
    men1L: boolean
    men2L: boolean
    men3L: boolean
    men4L: boolean
    men5L: boolean
    womenNLA: boolean
    womenNLB: boolean
    women1L: boolean
    women2L: boolean
    women3L: boolean
    women4L: boolean
    women5L: boolean
    menU23: boolean
    menU20: boolean
    menU18: boolean
    womenU23: boolean
    womenU20: boolean
    womenU18: boolean
  }
}

async function scrapeClubDetails() {
  console.log('Starting club detail scraper...')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 
  })
  
  const page = await browser.newPage()
  const baseUrl = 'https://www.volleyball.ch/de/verband/services/verein-suchen'
  
  const clubs: ClubDetail[] = []
  let pageNum = 1
  
  try {
    // First, collect all club detail page links
    const clubLinks: string[] = []
    
    while (true) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page_n1358=${pageNum}`
      console.log(`\nCollecting links from page ${pageNum}...`)
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForTimeout(2000)
      
      // Find all club detail links
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href*="/de/verband/services/verein-suchen/verein/"]')
        return Array.from(anchors).map(a => (a as HTMLAnchorElement).href)
      })
      
      if (links.length === 0) {
        console.log('No more club links found, stopping.')
        break
      }
      
      // Filter unique links
      for (const link of links) {
        if (!clubLinks.includes(link)) {
          clubLinks.push(link)
        }
      }
      
      console.log(`Found ${links.length} links on this page, ${clubLinks.length} total unique`)
      
      // Check for next page
      const hasNextPage = await page.evaluate((currentPage) => {
        const nextLink = document.querySelector(`a[href*="page_n1358=${currentPage + 1}"]`)
        return !!nextLink
      }, pageNum)
      
      if (!hasNextPage) {
        console.log('No next page link found, collection complete.')
        break
      }
      
      pageNum++
    }
    
    console.log(`\n=== Collected ${clubLinks.length} club links ===\n`)
    
    // Now visit each club's detail page
    let processed = 0
    for (const link of clubLinks) {
      processed++
      console.log(`\n[${processed}/${clubLinks.length}] Visiting: ${link}`)
      
      try {
        await page.goto(link, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(1000)
        
        const clubData = await page.evaluate(() => {
          // Get club name from h1
          const h1 = document.querySelector('h1')
          const name = h1?.textContent?.trim() || ''
          
          // Get logo
          const logoImg = document.querySelector('.club-logo img, .verein-logo img, img[alt*="Logo"], .content img[src*="logo"]') as HTMLImageElement
          const logo = logoImg?.src || ''
          
          // Get website
          const websiteLink = document.querySelector('a[href^="http"]:not([href*="volleyball.ch"]):not([href*="mailto"])') as HTMLAnchorElement
          const website = websiteLink?.href || ''
          
          // Get email
          const emailLink = document.querySelector('a[href^="mailto:"]') as HTMLAnchorElement
          const email = emailLink?.href?.replace('mailto:', '') || ''
          
          // Get address info
          const addressText = document.body.innerText
          const postalMatch = addressText.match(/(\d{4})\s+([A-Za-zäöüÄÖÜéèêàâôûîç\-\s]+)(?=\s|$)/m)
          const postalCode = postalMatch?.[1] || ''
          const town = postalMatch?.[2]?.trim() || ''
          
          // Get league info from teams section
          const pageText = document.body.innerText.toLowerCase()
          
          return {
            name,
            logo,
            website,
            email,
            postalCode,
            town,
            pageText: pageText.substring(0, 5000) // For league parsing
          }
        })
        
        // Parse leagues from page text
        const text = clubData.pageText
        const leagues = {
          menNLA: text.includes('nla') && (text.includes('herren') || text.includes('männer')),
          menNLB: text.includes('nlb') && (text.includes('herren') || text.includes('männer')),
          men1L: text.includes('1. liga') && (text.includes('herren') || text.includes('männer')),
          men2L: text.includes('2. liga') && (text.includes('herren') || text.includes('männer')),
          men3L: text.includes('3. liga') && (text.includes('herren') || text.includes('männer')),
          men4L: text.includes('4. liga') && (text.includes('herren') || text.includes('männer')),
          men5L: text.includes('5. liga') && (text.includes('herren') || text.includes('männer')),
          womenNLA: text.includes('nla') && (text.includes('damen') || text.includes('frauen')),
          womenNLB: text.includes('nlb') && (text.includes('damen') || text.includes('frauen')),
          women1L: text.includes('1. liga') && (text.includes('damen') || text.includes('frauen')),
          women2L: text.includes('2. liga') && (text.includes('damen') || text.includes('frauen')),
          women3L: text.includes('3. liga') && (text.includes('damen') || text.includes('frauen')),
          women4L: text.includes('4. liga') && (text.includes('damen') || text.includes('frauen')),
          women5L: text.includes('5. liga') && (text.includes('damen') || text.includes('frauen')),
          menU23: text.includes('u23') && (text.includes('junioren') || text.includes('männlich')),
          menU20: text.includes('u20') && (text.includes('junioren') || text.includes('männlich')),
          menU18: text.includes('u18') && (text.includes('junioren') || text.includes('männlich')),
          womenU23: text.includes('u23') && (text.includes('juniorinnen') || text.includes('weiblich')),
          womenU20: text.includes('u20') && (text.includes('juniorinnen') || text.includes('weiblich')),
          womenU18: text.includes('u18') && (text.includes('juniorinnen') || text.includes('weiblich')),
        }
        
        const club: ClubDetail = {
          name: clubData.name,
          postalCode: clubData.postalCode,
          town: clubData.town,
          website: clubData.website,
          logo: clubData.logo,
          email: clubData.email,
          leagues
        }
        
        clubs.push(club)
        console.log(`  Name: ${club.name}`)
        console.log(`  Website: ${club.website || 'N/A'}`)
        console.log(`  Logo: ${club.logo ? 'Yes' : 'No'}`)
        
      } catch (error) {
        console.error(`  Error processing: ${error}`)
      }
      
      // Save progress every 10 clubs
      if (processed % 10 === 0) {
        const outputPath = path.join(__dirname, '../data/swiss-clubs-detailed.json')
        fs.writeFileSync(outputPath, JSON.stringify(clubs, null, 2))
        console.log(`  [Progress saved: ${clubs.length} clubs]`)
      }
    }
    
  } catch (error) {
    console.error('Error during scraping:', error)
  } finally {
    // Save final results
    const outputPath = path.join(__dirname, '../data/swiss-clubs-detailed.json')
    fs.writeFileSync(outputPath, JSON.stringify(clubs, null, 2))
    console.log(`\n=== Saved ${clubs.length} clubs to ${outputPath} ===`)
    
    await browser.close()
  }
}

scrapeClubDetails().catch(console.error)
