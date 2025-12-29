import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function scrapeTeamDetails() {
  console.log('='.repeat(60))
  console.log('Scraping VB Binningen Team Details from Club Website')
  console.log('='.repeat(60))
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  try {
    // Visit teams page and wait for full load
    await page.goto('https://volleyball-binningen.ch/teams', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    
    // Get all links and text content
    const links = await page.$$eval('a', anchors => 
      anchors.map(a => ({ 
        text: a.textContent?.trim() || '', 
        href: a.href 
      })).filter(l => 
        l.text.toLowerCase().includes('damen') || 
        l.text.toLowerCase().includes('dame') ||
        l.text.toLowerCase().includes('frauen') ||
        l.text.includes('3L') ||
        l.text.includes('4L') ||
        l.text.includes('5L') ||
        l.text.includes('Liga')
      )
    )
    
    console.log('\nTeam links found:')
    links.forEach(l => console.log(`  - ${l.text}: ${l.href}`))
    
    // Get all text content
    const allText = await page.evaluate(() => document.body.innerText)
    console.log('\n--- Page Text (first 2000 chars) ---')
    console.log(allText.substring(0, 2000))
    
    // Check for sub-pages
    const teamPages = await page.$$eval('a', anchors => 
      anchors.map(a => a.href)
        .filter(href => href.includes('/teams/') || href.includes('damen'))
    )
    
    console.log('\n\nSub-pages to check:')
    for (const url of teamPages.slice(0, 5)) {
      console.log(`  - ${url}`)
    }
    
    // Visit each team page if found
    for (const url of teamPages.slice(0, 3)) {
      try {
        console.log(`\nChecking: ${url}`)
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForTimeout(1000)
        
        const pageText = await page.evaluate(() => document.body.innerText)
        if (pageText.includes('Liga') || pageText.includes('Meisterschaft')) {
          console.log('  Found league info:')
          // Find lines with Liga
          const lines = pageText.split('\n').filter(l => 
            l.includes('Liga') || l.includes('Meisterschaft') || l.includes('3L') || l.includes('4L') || l.includes('5L')
          )
          lines.slice(0, 5).forEach(l => console.log(`    ${l.trim()}`))
        }
      } catch (e) {
        console.log(`  Error: Could not load`)
      }
    }
    
  } catch (e: any) {
    console.log(`Error: ${e.message}`)
  }
  
  await browser.close()
  await prisma.$disconnect()
}

scrapeTeamDetails()
