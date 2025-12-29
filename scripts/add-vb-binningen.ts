/**
 * Deep scrape VB Binningen to get:
 * - Logo
 * - Social media links
 * - League participation from Swiss Volley game center
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addVBBinningen() {
  console.log('='.repeat(60))
  console.log('Deep Scraping VB Binningen')
  console.log('='.repeat(60))
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  // Step 1: Scrape club website for logo and social media
  console.log('\n1. Scraping club website...')
  
  let logo: string | null = null
  let instagram: string | null = null
  let facebook: string | null = null
  let tiktok: string | null = null
  let colors: string[] = ['#1E3A8A', '#FFFFFF'] // Default blue and white
  
  try {
    await page.goto('https://volleyball-binningen.ch', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    
    const data = await page.evaluate(() => {
      let logo: string | null = null
      let instagram: string | null = null
      let facebook: string | null = null
      let tiktok: string | null = null
      
      // Find all images and log them
      const allImages = document.querySelectorAll('img')
      const imageUrls: string[] = []
      allImages.forEach(img => {
        if (img.src) imageUrls.push(img.src)
      })
      
      // Logo - try finding header/logo images first
      const logoSelectors = [
        'header img',
        '.header img',
        'nav img',
        '.logo img',
        '[class*="logo"] img',
        'img[src*="logo"]',
        'img[alt*="logo"]',
        'img[alt*="Logo"]',
        '.site-logo img',
        '#logo img',
        '.navbar-brand img',
        '.brand img'
      ]
      
      for (const sel of logoSelectors) {
        const img = document.querySelector(sel) as HTMLImageElement
        if (img?.src && !img.src.includes('clubdesk-favicon')) {
          logo = img.src
          break
        }
      }
      
      // If still no logo, try first significant image
      if (!logo) {
        for (const img of Array.from(allImages)) {
          const src = (img as HTMLImageElement).src
          if (src && !src.includes('favicon') && !src.includes('pixel') && !src.includes('tracking')) {
            // Check if it's in the header area
            const rect = img.getBoundingClientRect()
            if (rect.top < 200 && rect.width > 50) {
              logo = src
              break
            }
          }
        }
      }
      
      // Social media links
      const links = document.querySelectorAll('a[href]')
      for (const a of Array.from(links)) {
        const href = (a as HTMLAnchorElement).href
        if (href.includes('instagram.com/') && !instagram) {
          const match = href.match(/instagram\.com\/([^\/\?\&]+)/)
          if (match && !['p', 'reel', 'stories', 'explore'].includes(match[1])) {
            instagram = match[1]
          }
        }
        if (href.includes('facebook.com/') && !facebook) {
          const match = href.match(/facebook\.com\/([^\/\?\&]+)/)
          if (match && !['sharer', 'share', 'dialog'].includes(match[1])) {
            facebook = match[1]
          }
        }
        if (href.includes('tiktok.com/') && !tiktok) {
          const match = href.match(/tiktok\.com\/@?([^\/\?\&]+)/)
          if (match) tiktok = match[1].replace('@', '')
        }
      }
      
      return { logo, instagram, facebook, tiktok, imageUrls }
    })
    
    logo = data.logo
    instagram = data.instagram
    facebook = data.facebook
    tiktok = data.tiktok
    
    console.log(`  Logo: ${logo || 'Not found'}`)
    console.log(`  Instagram: ${instagram || 'Not found'}`)
    console.log(`  Facebook: ${facebook || 'Not found'}`)
    console.log(`  TikTok: ${tiktok || 'Not found'}`)
    console.log(`  All images found: ${data.imageUrls.length}`)
    if (data.imageUrls.length > 0) {
      console.log('  First 5 images:')
      data.imageUrls.slice(0, 5).forEach((url: string) => console.log(`    - ${url}`))
    }
    
  } catch (e: any) {
    console.log(`  Error scraping website: ${e.message?.substring(0, 80)}`)
  }
  
  // Step 2: Check Swiss Volley Verein-Suchen for league participation
  console.log('\n2. Checking Swiss Volley for leagues...')
  
  let has3LigaWomen = false
  let has4LigaWomen = false
  let has5LigaWomen = false
  let hasU23Women = true  // We know from website they have U23
  let hasU20Women = true  // We know from website they have U20
  let hasU18Women = true  // We know from website they have U18
  
  try {
    // Go to Swiss Volley verein-suchen
    await page.goto('https://www.volleyball.ch/verband/verein-suchen/', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)
    
    // Search for Binningen
    const searchBox = await page.$('input[name="searchtext"], input[type="search"], #searchtext, .search-input, input[placeholder*="suchen"]')
    if (searchBox) {
      await searchBox.fill('Binningen')
      await page.waitForTimeout(1000)
      
      // Submit search
      const submitBtn = await page.$('button[type="submit"], input[type="submit"], .search-button')
      if (submitBtn) await submitBtn.click()
      await page.waitForTimeout(2000)
    }
    
    const pageContent = await page.content()
    
    // Look for league mentions near Binningen
    if (pageContent.toLowerCase().includes('binningen')) {
      console.log('  Found Binningen in Swiss Volley results')
      
      // Check for specific leagues
      const text = pageContent.toLowerCase()
      if (text.includes('3. liga') || text.includes('3.liga') || text.includes('3l ')) {
        has3LigaWomen = true
        console.log('  → 3. Liga Women detected')
      }
      if (text.includes('4. liga') || text.includes('4.liga') || text.includes('4l ')) {
        has4LigaWomen = true
        console.log('  → 4. Liga Women detected')
      }
      if (text.includes('5. liga') || text.includes('5.liga') || text.includes('5l ')) {
        has5LigaWomen = true
        console.log('  → 5. Liga Women detected')
      }
    }
  } catch (e: any) {
    console.log(`  Error checking Swiss Volley: ${e.message?.substring(0, 80)}`)
  }
  
  // Step 3: Check Swiss Volley API data we already have
  console.log('\n3. Checking local Swiss Volley data...')
  
  // From swiss-volley-clubs-complete.json we know:
  // "Volleyball Frauen (NLA – 5L)" - this means they have women's teams from NLA to 5L range
  // But this is just the range Swiss Volley offers, not actual participation
  // Based on club size (youth focus), likely 4L or 5L for senior team if any
  
  console.log('  From Swiss Volley data: Women senior teams (NLA-5L range indicated)')
  console.log('  Note: Exact league requires game center verification')
  
  await browser.close()
  
  // Step 4: Update database
  console.log('\n4. Updating database...')
  
  const existingClub = await prisma.club.findFirst({
    where: {
      OR: [
        { name: 'VB Binningen' },
        { name: 'Volleyball Binningen' },
        { name: { contains: 'Binningen' } }
      ]
    }
  })
  
  // If no good logo found, set to null (better than a generic favicon)
  if (logo && logo.includes('clubdesk-favicon')) {
    logo = null
  }
  
  const clubData = {
    name: 'VB Binningen',
    shortName: 'Binningen',
    website: 'https://volleyball-binningen.ch',
    canton: 'BL' as const,
    town: 'Binningen',
    founded: 2016,
    description: 'Volleyball Binningen is a women\'s and girls\' volleyball club in Binningen, Basel-Landschaft. Originally part of Damenriege Binningen since 2003, they became an independent club in 2016. They focus on promoting women\'s volleyball and youth development with over 120 active members.',
    colors,
    ...(logo && { logo }),
    ...(instagram && { instagram }),
    ...(facebook && { facebook }),
    ...(tiktok && { tiktok }),
    // League flags - conservative based on what we can verify
    has3LigaWomen,
    has4LigaWomen,
    has5LigaWomen,
    hasU23Women,
    hasU20Women,
    hasU18Women,
  }
  
  if (existingClub) {
    console.log(`  Club exists: ${existingClub.name} (ID: ${existingClub.id})`)
    console.log('  Updating with scraped information...')
    
    const updated = await prisma.club.update({
      where: { id: existingClub.id },
      data: clubData
    })
    
    console.log('\n✅ Club updated successfully!')
    console.log(JSON.stringify(updated, null, 2))
  } else {
    console.log('  Creating new club...')
    
    const newClub = await prisma.club.create({
      data: clubData
    })
    
    console.log('\n✅ Club created successfully!')
    console.log(JSON.stringify(newClub, null, 2))
  }
}

addVBBinningen()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
