/**
 * Fix VTV Horw with correct data
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing VTV Horw...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Go directly to vtvhorw.ch
  const website = 'https://www.vtvhorw.ch'
  
  let logo: string | null = null
  let instagram: string | null = null
  let facebook: string | null = null
  let tiktok: string | null = null
  
  try {
    await page.goto(website, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(3000)
    
    const data = await page.evaluate(() => {
      let logo: string | null = null
      let instagram: string | null = null
      let facebook: string | null = null
      let tiktok: string | null = null
      
      // Logo - check multiple sources
      const appleIcon = document.querySelector('link[rel*="apple-touch-icon"]') as HTMLLinkElement
      if (appleIcon?.href) logo = appleIcon.href
      
      if (!logo) {
        const pngIcon = document.querySelector('link[rel="icon"][type="image/png"]') as HTMLLinkElement
        if (pngIcon?.href) logo = pngIcon.href
      }
      
      if (!logo) {
        const headerImgs = document.querySelectorAll('header img, .header img, nav img, .navbar img, .logo img, #logo img, a[href="/"] img')
        for (const img of Array.from(headerImgs)) {
          if ((img as HTMLImageElement).src) {
            logo = (img as HTMLImageElement).src
            break
          }
        }
      }
      
      if (!logo) {
        // Check all images for logo in class/src
        const allImgs = document.querySelectorAll('img')
        for (const img of Array.from(allImgs)) {
          const src = (img as HTMLImageElement).src || ''
          const cls = (img as HTMLImageElement).className || ''
          if (src.toLowerCase().includes('logo') || cls.toLowerCase().includes('logo')) {
            logo = src
            break
          }
        }
      }
      
      // Social media links
      const links = document.querySelectorAll('a[href]')
      for (const a of Array.from(links)) {
        const href = (a as HTMLAnchorElement).href
        
        if (href.includes('instagram.com/') && !instagram) {
          const match = href.match(/instagram\.com\/([^\/\?\&]+)/)
          if (match && !['p', 'reel', 'stories'].includes(match[1])) {
            instagram = match[1]
          }
        }
        
        if (href.includes('facebook.com/') && !facebook) {
          const match = href.match(/facebook\.com\/([^\/\?\&]+)/)
          if (match && !['sharer', 'share', 'dialog', 'plugins'].includes(match[1])) {
            facebook = match[1]
          }
        }
        
        if (href.includes('tiktok.com/') && !tiktok) {
          const match = href.match(/tiktok\.com\/@?([^\/\?\&]+)/)
          if (match) {
            tiktok = match[1].replace('@', '')
          }
        }
      }
      
      return { logo, instagram, facebook, tiktok }
    })
    
    logo = data.logo
    instagram = data.instagram
    facebook = data.facebook
    tiktok = data.tiktok
    
    console.log(`Website: ${website}`)
    console.log(`Logo: ${logo || 'Not found'}`)
    console.log(`Instagram: ${instagram || 'Not found'}`)
    console.log(`Facebook: ${facebook || 'Not found'}`)
    console.log(`TikTok: ${tiktok || 'Not found'}`)
    
  } catch (e: any) {
    console.log(`Error loading website: ${e.message}`)
  }
  
  // If no logo found, search DDG images
  if (!logo) {
    console.log('\nSearching for logo via DuckDuckGo...')
    try {
      await page.goto('https://duckduckgo.com/?q=VTV+Horw+volleyball+logo&iax=images&ia=images', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(3000)
      
      // Try to get first image result
      const imgResult = await page.evaluate(() => {
        const img = document.querySelector('img.tile--img__img, .tile--img img') as HTMLImageElement
        return img?.src || null
      })
      
      if (imgResult) {
        logo = imgResult
        console.log(`Logo from DDG: ${logo}`)
      }
    } catch {}
  }
  
  // Search for social media
  if (!instagram) {
    console.log('\nSearching for Instagram...')
    try {
      await page.goto('https://duckduckgo.com/?q=VTV+Horw+volleyball+instagram+site:instagram.com', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      const igResult = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href*="instagram.com"]')
        for (const a of Array.from(links)) {
          const href = (a as HTMLAnchorElement).href
          if (href.includes('duckduckgo.')) continue
          const match = href.match(/instagram\.com\/([^\/\?\&]+)/)
          if (match && !['p', 'reel', 'stories', 'explore'].includes(match[1])) {
            return match[1]
          }
        }
        return null
      })
      
      if (igResult) {
        instagram = igResult
        console.log(`Instagram: ${instagram}`)
      }
    } catch {}
  }
  
  await browser.close()
  
  // Update the club
  const club = await prisma.club.findFirst({ where: { name: { contains: 'Horw' } } })
  
  if (club) {
    await prisma.club.update({
      where: { id: club.id },
      data: {
        name: 'VTV Horw',
        website,
        logo: logo || club.logo,
        instagram: instagram || club.instagram,
        facebook: facebook || club.facebook,
        tiktok: tiktok || club.tiktok
      }
    })
    console.log('\nUpdated VTV Horw!')
  } else {
    await prisma.club.create({
      data: {
        name: 'VTV Horw',
        canton: 'LU',
        town: 'Horw',
        website,
        logo,
        instagram,
        facebook,
        tiktok
      }
    })
    console.log('\nCreated VTV Horw!')
  }
  
  // Show final data
  const finalClub = await prisma.club.findFirst({ where: { name: 'VTV Horw' } })
  console.log('\nFinal VTV Horw data:')
  console.log(finalClub)
  
  await prisma.$disconnect()
}

main().catch(console.error)
