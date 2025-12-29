/**
 * Fix Missing Logos for 10 Clubs
 * More thorough search of website headers, favicons, and images
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CLUBS_TO_FIX = [
  "Sm'Aesch Pfeffingen",
  "BIWI VFM",
  "Volley Näfels",
  "Volley Amriswil",
  "Lindaren Volley",
  "VBC Lausanne UC",
  "VBC Möhlin",
  "VBC Muri-Gümligen",
  "Viteos NUC",
  "VBC Wetzikon"
]

async function findLogoOnPage(page: any, clubName: string): Promise<string | null> {
  return await page.evaluate((name: string) => {
    const nameParts = name.toLowerCase().split(/[\s\-'`]+/).filter((w: string) => w.length > 2)
    
    // 1. Apple touch icons (high quality)
    const appleIcons = document.querySelectorAll('link[rel*="apple-touch-icon"]')
    for (const icon of Array.from(appleIcons)) {
      const href = (icon as HTMLLinkElement).href
      if (href && href.startsWith('http')) return href
    }
    
    // 2. Large favicons
    const icons = document.querySelectorAll('link[rel="icon"][sizes], link[rel="icon"][type="image/png"]')
    for (const icon of Array.from(icons)) {
      const href = (icon as HTMLLinkElement).href
      if (href && href.startsWith('http') && !href.includes('16x16')) return href
    }
    
    // 3. OG image
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
    if (ogImage?.content && ogImage.content.startsWith('http')) {
      return ogImage.content
    }
    
    // 4. Header/nav images
    const headerAreas = document.querySelectorAll('header, .header, nav, .navbar, .nav, .site-header, #header, .masthead, .brand, .logo-container')
    for (const area of Array.from(headerAreas)) {
      const imgs = area.querySelectorAll('img')
      for (const img of Array.from(imgs)) {
        if (img.src && img.src.startsWith('http')) {
          return img.src
        }
      }
    }
    
    // 5. Any image with logo in class/id/alt/src
    const allImgs = document.querySelectorAll('img')
    for (const img of Array.from(allImgs)) {
      if (!img.src || !img.src.startsWith('http')) continue
      const alt = (img.alt || '').toLowerCase()
      const cls = (img.className || '').toLowerCase()
      const id = (img.id || '').toLowerCase()
      const src = img.src.toLowerCase()
      
      if (alt.includes('logo') || cls.includes('logo') || id.includes('logo') || 
          src.includes('logo') || alt.includes('wappen') || src.includes('wappen') ||
          cls.includes('brand') || id.includes('brand')) {
        return img.src
      }
      
      // Check if image contains club name
      for (const part of nameParts) {
        if (src.includes(part) || alt.includes(part)) {
          return img.src
        }
      }
    }
    
    // 6. First image in the page that's reasonably sized
    for (const img of Array.from(allImgs)) {
      if (!img.src || !img.src.startsWith('http')) continue
      // Skip very small or banner-sized images
      if (img.naturalWidth > 0) {
        if (img.naturalWidth >= 50 && img.naturalWidth <= 500 && 
            img.naturalHeight >= 50 && img.naturalHeight <= 500) {
          return img.src
        }
      }
    }
    
    // 7. Fallback to any favicon
    const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]') as HTMLLinkElement
    if (favicon?.href && favicon.href.startsWith('http')) {
      return favicon.href
    }
    
    return null
  }, clubName)
}

async function main() {
  console.log('='.repeat(60))
  console.log('Fixing Missing Logos for 10 Clubs')
  console.log('='.repeat(60))
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 })
  const page = await browser.newPage()
  
  let fixed = 0
  
  for (const clubName of CLUBS_TO_FIX) {
    console.log(`\n[${CLUBS_TO_FIX.indexOf(clubName) + 1}/10] ${clubName}`)
    
    // Get club from database
    const club = await prisma.club.findFirst({
      where: { name: clubName }
    })
    
    if (!club) {
      console.log('  Not found in database!')
      continue
    }
    
    if (club.logo) {
      console.log('  Already has logo, skipping')
      continue
    }
    
    let logo: string | null = null
    
    // Try 1: Search DuckDuckGo for the club logo directly
    try {
      const searchQuery = encodeURIComponent(`${clubName} volleyball logo`)
      await page.goto(`https://duckduckgo.com/?q=${searchQuery}&iax=images&ia=images`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      })
      await page.waitForTimeout(3000)
      
      // Get first image result
      const imgResult = await page.evaluate(() => {
        const img = document.querySelector('.tile--img__img') as HTMLImageElement
        return img?.src || null
      })
      
      if (imgResult) {
        logo = imgResult
        console.log(`  Logo from DDG images: ${logo.substring(0, 50)}...`)
      }
    } catch (e: any) {
      console.log(`  DDG image search error: ${e.message?.substring(0, 30)}`)
    }
    
    // Try 2: Search for club website and extract logo
    if (!logo) {
      try {
        const searchQuery = encodeURIComponent(`${clubName} volleyball schweiz`)
        await page.goto(`https://duckduckgo.com/?q=${searchQuery}`, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        })
        await page.waitForTimeout(2000)
        
        // Get first result URL
        const websiteUrl = await page.evaluate((name: string) => {
          const nameParts = name.toLowerCase().split(/[\s\-'`]+/).filter((w: string) => w.length > 2)
          const results = document.querySelectorAll('a[data-testid="result-title-a"], .result__a, h2 a')
          
          for (const a of Array.from(results)) {
            const href = (a as HTMLAnchorElement).href
            if (!href || !href.startsWith('http')) continue
            if (href.includes('duckduckgo.') || href.includes('facebook.') || 
                href.includes('instagram.') || href.includes('youtube.')) continue
            
            const hrefLower = href.toLowerCase()
            for (const part of nameParts) {
              if (hrefLower.includes(part)) return href
            }
            
            if (hrefLower.includes('.ch')) return href
          }
          return null
        }, clubName)
        
        if (websiteUrl) {
          console.log(`  Trying website: ${websiteUrl}`)
          
          try {
            await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
            await page.waitForTimeout(3000)
            
            logo = await findLogoOnPage(page, clubName)
            if (logo) {
              console.log(`  Logo from website: ${logo.substring(0, 50)}...`)
            }
          } catch (e: any) {
            console.log(`  Website error: ${e.message?.substring(0, 30)}`)
          }
        }
      } catch (e: any) {
        console.log(`  Search error: ${e.message?.substring(0, 30)}`)
      }
    }
    
    // Try 3: Use known correct websites for famous clubs
    if (!logo) {
      const knownSites: Record<string, string> = {
        "Sm'Aesch Pfeffingen": "https://smaeschpfeffingen.ch",
        "Volley Amriswil": "https://www.volley-amriswil.ch",
        "Viteos NUC": "https://www.nucvolleyball.ch",
        "Lindaren Volley": "https://www.lindarenvolley.ch",
        "VBC Möhlin": "https://www.volley-moehlin.ch",
        "VBC Muri-Gümligen": "https://www.vbcmuriguemligen.ch",
        "VBC Wetzikon": "https://www.vbc-wetzikon.ch",
        "VBC Lausanne UC": "https://www.lausanneuc.ch",
        "Volley Näfels": "https://www.volleynaefels.ch",
        "BIWI VFM": "https://www.vfm.ch"
      }
      
      const knownUrl = knownSites[clubName]
      if (knownUrl) {
        console.log(`  Trying known URL: ${knownUrl}`)
        try {
          await page.goto(knownUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(3000)
          
          logo = await findLogoOnPage(page, clubName)
          if (logo) {
            console.log(`  Logo from known site: ${logo.substring(0, 50)}...`)
          }
        } catch (e: any) {
          console.log(`  Known site error: ${e.message?.substring(0, 30)}`)
        }
      }
    }
    
    // Try 4: Get logo from Instagram if they have it
    if (!logo && club.instagram) {
      try {
        console.log(`  Trying Instagram: ${club.instagram}`)
        await page.goto(club.instagram, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(3000)
        
        const igLogo = await page.evaluate(() => {
          // Profile picture
          const imgs = document.querySelectorAll('img[alt*="profile"], header img')
          for (const img of Array.from(imgs)) {
            if ((img as HTMLImageElement).src) return (img as HTMLImageElement).src
          }
          return null
        })
        
        if (igLogo) {
          logo = igLogo
          console.log(`  Logo from Instagram: ${logo.substring(0, 50)}...`)
        }
      } catch (e: any) {
        console.log(`  Instagram error: ${e.message?.substring(0, 30)}`)
      }
    }
    
    // Update database if logo found
    if (logo) {
      await prisma.club.update({
        where: { id: club.id },
        data: { logo }
      })
      fixed++
      console.log(`  ✓ LOGO SAVED!`)
    } else {
      console.log(`  ✗ No logo found`)
    }
    
    await page.waitForTimeout(1000)
  }
  
  await browser.close()
  await prisma.$disconnect()
  
  console.log('\n' + '='.repeat(60))
  console.log(`COMPLETE! Fixed ${fixed}/10 logos`)
  console.log('='.repeat(60))
}

main().catch(console.error)
