/**
 * 1. Add VTV Horw club
 * 2. Fix Instagram links (should be just the handle, not full URL or wrong format)
 * 3. Fix TikTok links (should be just the handle, not full URL)
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('='.repeat(60))
  console.log('Adding VTV Horw & Fixing Social Media Links')
  console.log('='.repeat(60))
  
  // Step 1: Add VTV Horw
  console.log('\n1. Adding VTV Horw...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  // Search for VTV Horw
  await page.goto('https://duckduckgo.com/?q=VTV+Horw+volleyball+schweiz', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  
  // Get website
  const website = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*=".ch"]')
    for (const a of Array.from(links)) {
      const href = (a as HTMLAnchorElement).href
      if (href.includes('horw') || href.includes('vtv')) {
        try {
          const url = new URL(href)
          return url.origin
        } catch { return href.split('?')[0] }
      }
    }
    return null
  })
  
  console.log(`  Website: ${website || 'Not found, trying vtvhorw.ch'}`)
  
  const vtvWebsite = website || 'https://www.vtvhorw.ch'
  
  // Visit website to get logo and social
  let logo: string | null = null
  let instagram: string | null = null
  let facebook: string | null = null
  let tiktok: string | null = null
  
  try {
    await page.goto(vtvWebsite, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(2000)
    
    const data = await page.evaluate(() => {
      let logo: string | null = null
      let instagram: string | null = null
      let facebook: string | null = null
      let tiktok: string | null = null
      
      // Logo
      const iconSelectors = ['link[rel*="apple-touch-icon"]', 'link[rel="icon"][type="image/png"]']
      for (const sel of iconSelectors) {
        const icon = document.querySelector(sel) as HTMLLinkElement
        if (icon?.href) { logo = icon.href; break }
      }
      if (!logo) {
        const headerImg = document.querySelector('header img, .header img, nav img, .logo img') as HTMLImageElement
        if (headerImg?.src) logo = headerImg.src
      }
      
      // Social media
      const links = document.querySelectorAll('a[href]')
      for (const a of Array.from(links)) {
        const href = (a as HTMLAnchorElement).href
        if (href.includes('instagram.com/') && !instagram) {
          const match = href.match(/instagram\.com\/([^\/\?]+)/)
          if (match) instagram = match[1]
        }
        if (href.includes('facebook.com/') && !facebook) {
          const match = href.match(/facebook\.com\/([^\/\?]+)/)
          if (match && !['sharer', 'share', 'dialog'].includes(match[1])) facebook = match[1]
        }
        if (href.includes('tiktok.com/') && !tiktok) {
          const match = href.match(/tiktok\.com\/@?([^\/\?]+)/)
          if (match) tiktok = match[1].replace('@', '')
        }
      }
      
      return { logo, instagram, facebook, tiktok }
    })
    
    logo = data.logo
    instagram = data.instagram
    facebook = data.facebook
    tiktok = data.tiktok
    
    console.log(`  Logo: ${logo ? '✓' : '✗'}`)
    console.log(`  Instagram: ${instagram || 'Not found'}`)
    console.log(`  Facebook: ${facebook || 'Not found'}`)
    console.log(`  TikTok: ${tiktok || 'Not found'}`)
    
  } catch (e: any) {
    console.log(`  Error: ${e.message?.substring(0, 40)}`)
  }
  
  // Create or update VTV Horw
  const existingClub = await prisma.club.findFirst({ where: { name: { contains: 'Horw' } } })
  
  if (existingClub) {
    await prisma.club.update({
      where: { id: existingClub.id },
      data: {
        website: vtvWebsite,
        logo: logo || existingClub.logo,
        instagram: instagram || existingClub.instagram,
        facebook: facebook || existingClub.facebook,
        tiktok: tiktok || existingClub.tiktok
      }
    })
    console.log('  Updated existing club')
  } else {
    await prisma.club.create({
      data: {
        name: 'VTV Horw',
        canton: 'LU',
        town: 'Horw',
        website: vtvWebsite,
        logo,
        instagram,
        facebook,
        tiktok
      }
    })
    console.log('  Created new club')
  }
  
  await browser.close()
  
  // Step 2: Fix Instagram links
  console.log('\n2. Fixing Instagram links...')
  
  const clubsWithIg = await prisma.club.findMany({
    where: { instagram: { not: null } }
  })
  
  let igFixed = 0
  for (const club of clubsWithIg) {
    if (!club.instagram) continue
    
    let handle = club.instagram
    
    // Extract handle from full URL
    if (handle.includes('instagram.com/')) {
      const match = handle.match(/instagram\.com\/([^\/\?\&]+)/)
      if (match) handle = match[1]
    }
    
    // Remove @ if present
    handle = handle.replace('@', '')
    
    // Skip invalid
    if (['p', 'reel', 'stories', 'explore', 'accounts'].includes(handle)) {
      await prisma.club.update({
        where: { id: club.id },
        data: { instagram: null }
      })
      igFixed++
      continue
    }
    
    // Store as just the handle (not full URL)
    if (club.instagram !== handle) {
      await prisma.club.update({
        where: { id: club.id },
        data: { instagram: handle }
      })
      igFixed++
    }
  }
  
  console.log(`  Fixed ${igFixed} Instagram entries`)
  
  // Step 3: Fix TikTok links
  console.log('\n3. Fixing TikTok links...')
  
  const clubsWithTt = await prisma.club.findMany({
    where: { tiktok: { not: null } }
  })
  
  let ttFixed = 0
  for (const club of clubsWithTt) {
    if (!club.tiktok) continue
    
    let handle = club.tiktok
    
    // Extract handle from full URL
    if (handle.includes('tiktok.com/')) {
      const match = handle.match(/tiktok\.com\/@?([^\/\?\&]+)/)
      if (match) handle = match[1]
    }
    
    // Remove @ if present
    handle = handle.replace('@', '')
    
    // Store as just the handle
    if (club.tiktok !== handle) {
      await prisma.club.update({
        where: { id: club.id },
        data: { tiktok: handle }
      })
      ttFixed++
    }
  }
  
  console.log(`  Fixed ${ttFixed} TikTok entries`)
  
  // Show sample of fixed links
  console.log('\n4. Sample of fixed social media:')
  const samples = await prisma.club.findMany({
    where: { instagram: { not: null } },
    take: 5,
    select: { name: true, instagram: true, tiktok: true }
  })
  
  for (const club of samples) {
    console.log(`  ${club.name}:`)
    console.log(`    Instagram: ${club.instagram}`)
    if (club.tiktok) console.log(`    TikTok: ${club.tiktok}`)
  }
  
  await prisma.$disconnect()
  
  console.log('\n' + '='.repeat(60))
  console.log('COMPLETE!')
  console.log('='.repeat(60))
}

main().catch(console.error)
