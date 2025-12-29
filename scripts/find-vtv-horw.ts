/**
 * Find correct VTV Horw data
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Searching for VTV Horw...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Search DuckDuckGo
  await page.goto('https://duckduckgo.com/?q=VTV+Horw+volleyball', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  
  // Get first .ch result
  const website = await page.evaluate(() => {
    const results = document.querySelectorAll('a[data-testid="result-title-a"], .result__a, h2 a')
    for (const a of Array.from(results)) {
      const href = (a as HTMLAnchorElement).href
      if (href.includes('.ch') && !href.includes('duckduckgo.') && !href.includes('facebook.') && !href.includes('instagram.')) {
        try {
          const url = new URL(href)
          return url.origin
        } catch { return href.split('?')[0] }
      }
    }
    return null
  })
  
  console.log(`Found website: ${website}`)
  
  let logo: string | null = null
  let instagram: string | null = null
  let facebook: string | null = null
  let tiktok: string | null = null
  
  if (website) {
    try {
      await page.goto(website, { waitUntil: 'domcontentloaded', timeout: 15000 })
      await page.waitForTimeout(3000)
      
      const data = await page.evaluate(() => {
        let logo: string | null = null
        let instagram: string | null = null
        let facebook: string | null = null
        let tiktok: string | null = null
        
        // Logo
        const headerImgs = document.querySelectorAll('header img, .header img, nav img, .logo img, img[alt*="logo"], img[class*="logo"]')
        for (const img of Array.from(headerImgs)) {
          if ((img as HTMLImageElement).src) {
            logo = (img as HTMLImageElement).src
            break
          }
        }
        
        if (!logo) {
          const appleIcon = document.querySelector('link[rel*="apple-touch-icon"]') as HTMLLinkElement
          if (appleIcon?.href) logo = appleIcon.href
        }
        
        // Social
        const links = document.querySelectorAll('a[href]')
        for (const a of Array.from(links)) {
          const href = (a as HTMLAnchorElement).href
          if (href.includes('instagram.com/') && !instagram) {
            const match = href.match(/instagram\.com\/([^\/\?\&]+)/)
            if (match && !['p', 'reel'].includes(match[1])) instagram = match[1]
          }
          if (href.includes('facebook.com/') && !facebook) {
            const match = href.match(/facebook\.com\/([^\/\?\&]+)/)
            if (match && !['sharer', 'share'].includes(match[1])) facebook = match[1]
          }
          if (href.includes('tiktok.com/') && !tiktok) {
            const match = href.match(/tiktok\.com\/@?([^\/\?\&]+)/)
            if (match) tiktok = match[1].replace('@', '')
          }
        }
        
        return { logo, instagram, facebook, tiktok }
      })
      
      logo = data.logo
      instagram = data.instagram
      facebook = data.facebook
      tiktok = data.tiktok
      
      console.log(`Logo: ${logo || 'Not found'}`)
      console.log(`Instagram: ${instagram || 'Not found'}`)
      console.log(`Facebook: ${facebook || 'Not found'}`)
      console.log(`TikTok: ${tiktok || 'Not found'}`)
      
    } catch (e: any) {
      console.log(`Error: ${e.message?.substring(0, 50)}`)
    }
  }
  
  // Also search Instagram directly
  if (!instagram) {
    console.log('\nSearching Instagram...')
    await page.goto('https://www.instagram.com/vtvhorw/', { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
    await page.waitForTimeout(2000)
    
    const exists = await page.evaluate(() => {
      return !document.body.innerText.includes("Sorry, this page isn't available")
    })
    
    if (exists) {
      instagram = 'vtvhorw'
      console.log('Found Instagram: vtvhorw')
      
      // Get profile pic as logo
      if (!logo) {
        const profilePic = await page.evaluate(() => {
          const img = document.querySelector('header img') as HTMLImageElement
          return img?.src || null
        })
        if (profilePic) {
          logo = profilePic
          console.log('Got logo from Instagram')
        }
      }
    }
  }
  
  await browser.close()
  
  // Update club
  await prisma.club.updateMany({
    where: { name: 'VTV Horw' },
    data: {
      website: website || 'https://www.volleyball-horw.ch',
      logo,
      instagram,
      facebook,
      tiktok
    }
  })
  
  const club = await prisma.club.findFirst({ where: { name: 'VTV Horw' } })
  console.log('\nFinal data:')
  console.log(`  Website: ${club?.website}`)
  console.log(`  Logo: ${club?.logo ? '✓' : '✗'}`)
  console.log(`  Instagram: ${club?.instagram || '✗'}`)
  console.log(`  Facebook: ${club?.facebook || '✗'}`)
  console.log(`  TikTok: ${club?.tiktok || '✗'}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)
