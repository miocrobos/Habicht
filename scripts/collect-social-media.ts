/**
 * Collect Social Media Links and Fix Missing Logos
 * 
 * 1. Search DuckDuckGo for club social media (Instagram, TikTok, Facebook)
 * 2. Visit club websites to find social links
 * 3. For clubs without logos, check:
 *    - Favicon/site icon
 *    - Header logo more thoroughly
 *    - Social media profile pictures
 */

import { chromium, Page } from 'playwright'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()
const RESULTS_FILE = 'data/club-social-media.json'

interface SocialResult {
  id: string
  name: string
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  logo: string | null
}

async function extractSocialFromPage(page: Page): Promise<{ instagram: string | null, facebook: string | null, tiktok: string | null }> {
  return await page.evaluate(() => {
    let instagram: string | null = null
    let facebook: string | null = null
    let tiktok: string | null = null
    
    // Find all links on page
    const links = document.querySelectorAll('a[href]')
    
    for (const link of Array.from(links)) {
      const href = (link as HTMLAnchorElement).href.toLowerCase()
      
      // Instagram
      if (href.includes('instagram.com/') && !instagram) {
        const match = href.match(/instagram\.com\/([^\/\?]+)/)
        if (match && match[1] && !['p', 'reel', 'stories', 'explore'].includes(match[1])) {
          instagram = `https://instagram.com/${match[1]}`
        }
      }
      
      // Facebook
      if (href.includes('facebook.com/') && !facebook) {
        const match = href.match(/facebook\.com\/([^\/\?]+)/)
        if (match && match[1] && !['sharer', 'share', 'dialog', 'plugins'].includes(match[1])) {
          facebook = `https://facebook.com/${match[1]}`
        }
      }
      
      // TikTok
      if (href.includes('tiktok.com/') && !tiktok) {
        const match = href.match(/tiktok\.com\/@?([^\/\?]+)/)
        if (match && match[1]) {
          tiktok = `https://tiktok.com/@${match[1].replace('@', '')}`
        }
      }
    }
    
    return { instagram, facebook, tiktok }
  })
}

async function extractLogoThoroughly(page: Page, clubName: string): Promise<string | null> {
  return await page.evaluate((name) => {
    const namePart = name.toLowerCase().split(/[\s\-]+/)[0]
    
    // 1. Check for favicon/apple-touch-icon (highest quality icon)
    const iconSelectors = [
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'link[rel="icon"][sizes="192x192"]',
      'link[rel="icon"][sizes="180x180"]',
      'link[rel="icon"][sizes="128x128"]',
      'link[rel="icon"][type="image/png"]',
      'link[rel="shortcut icon"]',
      'link[rel="icon"]'
    ]
    
    for (const sel of iconSelectors) {
      const icon = document.querySelector(sel) as HTMLLinkElement
      if (icon?.href && icon.href.startsWith('http')) {
        // Check if it's not a generic favicon
        const href = icon.href.toLowerCase()
        if (!href.includes('favicon.ico') || href.includes(namePart)) {
          return icon.href
        }
      }
    }
    
    // 2. Check meta og:image (often the logo)
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement
    if (ogImage?.content && ogImage.content.startsWith('http')) {
      const content = ogImage.content.toLowerCase()
      if (content.includes('logo') || content.includes(namePart)) {
        return ogImage.content
      }
    }
    
    // 3. Check header/nav area images more thoroughly
    const headerAreas = document.querySelectorAll('header, .header, nav, .navbar, .nav, .site-header, .page-header, #header, #masthead, .masthead')
    
    for (const area of Array.from(headerAreas)) {
      const images = area.querySelectorAll('img')
      for (const img of Array.from(images)) {
        if (img.src && img.src.startsWith('http')) {
          // Skip very small images
          if (img.naturalWidth > 0 && img.naturalWidth < 20) continue
          if (img.naturalHeight > 0 && img.naturalHeight < 20) continue
          return img.src
        }
      }
      
      // Also check for SVG
      const svgs = area.querySelectorAll('svg')
      for (const svg of Array.from(svgs)) {
        // Can't easily extract SVG as URL, skip
      }
    }
    
    // 4. Look for images with logo-related attributes anywhere
    const allImages = document.querySelectorAll('img')
    for (const img of Array.from(allImages)) {
      if (!img.src || !img.src.startsWith('http')) continue
      
      const alt = (img.alt || '').toLowerCase()
      const cls = (img.className || '').toLowerCase()
      const id = (img.id || '').toLowerCase()
      const src = img.src.toLowerCase()
      
      // Skip tiny images
      if (img.naturalWidth > 0 && img.naturalWidth < 30) continue
      if (img.naturalHeight > 0 && img.naturalHeight < 30) continue
      
      // Check for logo indicators
      if (alt.includes('logo') || cls.includes('logo') || id.includes('logo') || 
          src.includes('logo') || alt.includes(namePart) || src.includes(namePart) ||
          cls.includes('brand') || alt.includes('wappen') || src.includes('wappen')) {
        return img.src
      }
    }
    
    // 5. Check first link (often home link with logo)
    const firstLink = document.querySelector('a[href="/"], a[href="./"], a[href="index.html"], .navbar-brand, .site-title a')
    if (firstLink) {
      const img = firstLink.querySelector('img')
      if (img?.src && img.src.startsWith('http')) {
        return img.src
      }
    }
    
    // 6. Finally try apple-touch-icon even if favicon.ico
    for (const sel of iconSelectors) {
      const icon = document.querySelector(sel) as HTMLLinkElement
      if (icon?.href && icon.href.startsWith('http')) {
        return icon.href
      }
    }
    
    return null
  }, clubName)
}

async function getInstagramProfilePic(page: Page, instagramUrl: string): Promise<string | null> {
  try {
    await page.goto(instagramUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(3000)
    
    // Instagram profile pic
    const pic = await page.evaluate(() => {
      // Look for profile image
      const imgs = document.querySelectorAll('img[alt]')
      for (const img of Array.from(imgs) as HTMLImageElement[]) {
        const alt = (img.alt || '').toLowerCase()
        if (alt.includes('profile') || alt.includes("'s profile")) {
          return img.src
        }
      }
      
      // Look for header area image
      const headerImg = document.querySelector('header img') as HTMLImageElement
      if (headerImg?.src) return headerImg.src
      
      return null
    })
    
    return pic
  } catch {
    return null
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('Social Media & Logo Collector')
  console.log('='.repeat(60))
  
  // Load previous results
  let results: Record<string, SocialResult> = {}
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'))
    console.log(`Loaded ${Object.keys(results).length} previous results`)
  }
  
  // Get all clubs
  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' }
  })
  
  const clubsWithoutLogo = clubs.filter(c => !c.logo)
  const clubsWithoutSocial = clubs.filter(c => !c.instagram && !c.facebook && !c.tiktok)
  
  console.log(`\nTotal clubs: ${clubs.length}`)
  console.log(`Without logo: ${clubsWithoutLogo.length}`)
  console.log(`Without social media: ${clubsWithoutSocial.length}`)
  
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const page = await browser.newPage()
  
  let socialsFound = 0
  let logosFixed = 0
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      const needsLogo = !club.logo
      const needsSocial = !club.instagram && !club.facebook && !club.tiktok
      
      // Skip if already complete
      if (!needsLogo && !needsSocial) {
        continue
      }
      
      console.log(`\n[${i + 1}/${clubs.length}] ${club.name}`)
      
      let instagram: string | null = club.instagram
      let facebook: string | null = club.facebook
      let tiktok: string | null = club.tiktok
      let logo: string | null = club.logo
      
      // Step 1: Visit club website for social links and logo
      if (club.website) {
        try {
          await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(2000)
          
          // Extract social media from website
          if (needsSocial) {
            const social = await extractSocialFromPage(page)
            if (social.instagram) instagram = social.instagram
            if (social.facebook) facebook = social.facebook
            if (social.tiktok) tiktok = social.tiktok
            
            if (social.instagram || social.facebook || social.tiktok) {
              console.log(`  From website: IG=${social.instagram ? '✓' : '✗'} FB=${social.facebook ? '✓' : '✗'} TT=${social.tiktok ? '✓' : '✗'}`)
            }
          }
          
          // Try to find logo more thoroughly
          if (needsLogo) {
            logo = await extractLogoThoroughly(page, club.name)
            if (logo) {
              console.log(`  Logo found: ${logo.substring(0, 50)}...`)
              logosFixed++
            }
          }
          
        } catch (e: any) {
          console.log(`  Website error: ${e.message?.substring(0, 30)}`)
        }
      }
      
      // Step 2: Search DuckDuckGo for social media if still missing
      if (!instagram || !facebook) {
        try {
          const searchQuery = encodeURIComponent(`${club.name} volleyball instagram facebook`)
          await page.goto(`https://duckduckgo.com/?q=${searchQuery}`, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
          })
          await page.waitForTimeout(2000)
          
          // Extract social links from search results
          const searchSocial = await page.evaluate(() => {
            let ig: string | null = null
            let fb: string | null = null
            let tt: string | null = null
            
            const links = document.querySelectorAll('a[href]')
            for (const link of Array.from(links)) {
              const href = (link as HTMLAnchorElement).href
              
              if (href.includes('instagram.com/') && !ig) {
                const match = href.match(/instagram\.com\/([^\/\?]+)/)
                if (match && match[1] && !['p', 'reel', 'stories', 'explore'].includes(match[1])) {
                  ig = `https://instagram.com/${match[1]}`
                }
              }
              
              if (href.includes('facebook.com/') && !fb) {
                const match = href.match(/facebook\.com\/([^\/\?]+)/)
                if (match && match[1] && !['sharer', 'share', 'dialog', 'plugins', 'search'].includes(match[1])) {
                  fb = `https://facebook.com/${match[1]}`
                }
              }
              
              if (href.includes('tiktok.com/') && !tt) {
                const match = href.match(/tiktok\.com\/@?([^\/\?]+)/)
                if (match && match[1]) {
                  tt = `https://tiktok.com/@${match[1].replace('@', '')}`
                }
              }
            }
            
            return { instagram: ig, facebook: fb, tiktok: tt }
          })
          
          if (!instagram && searchSocial.instagram) instagram = searchSocial.instagram
          if (!facebook && searchSocial.facebook) facebook = searchSocial.facebook
          if (!tiktok && searchSocial.tiktok) tiktok = searchSocial.tiktok
          
          if (searchSocial.instagram || searchSocial.facebook || searchSocial.tiktok) {
            console.log(`  From DDG: IG=${searchSocial.instagram ? '✓' : '✗'} FB=${searchSocial.facebook ? '✓' : '✗'} TT=${searchSocial.tiktok ? '✓' : '✗'}`)
          }
          
        } catch (e: any) {
          console.log(`  Search error: ${e.message?.substring(0, 30)}`)
        }
      }
      
      // Step 3: If still no logo, try Instagram profile pic
      if (!logo && instagram) {
        try {
          const profilePic = await getInstagramProfilePic(page, instagram)
          if (profilePic) {
            logo = profilePic
            console.log(`  Logo from Instagram: ✓`)
            logosFixed++
          }
        } catch {}
      }
      
      // Update database
      const updates: any = {}
      if (instagram && !club.instagram) updates.instagram = instagram
      if (facebook && !club.facebook) updates.facebook = facebook
      if (tiktok && !club.tiktok) updates.tiktok = tiktok
      if (logo && !club.logo) updates.logo = logo
      
      if (Object.keys(updates).length > 0) {
        await prisma.club.update({
          where: { id: club.id },
          data: updates
        })
        
        if (updates.instagram || updates.facebook || updates.tiktok) {
          socialsFound++
        }
        
        console.log(`  Updated: ${Object.keys(updates).join(', ')}`)
      }
      
      // Save progress
      results[club.id] = {
        id: club.id,
        name: club.name,
        instagram,
        facebook,
        tiktok,
        logo
      }
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2))
      
      // Rate limit
      await page.waitForTimeout(1500 + Math.random() * 1000)
      
      // Progress
      if ((i + 1) % 20 === 0) {
        console.log(`\n--- Progress: ${i + 1}/${clubs.length} | Social: ${socialsFound} | Logos fixed: ${logosFixed} ---`)
      }
    }
    
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE!')
  console.log('='.repeat(60))
  console.log(`Clubs with new social media: ${socialsFound}`)
  console.log(`Logos fixed: ${logosFixed}`)
}

main().catch(console.error)
