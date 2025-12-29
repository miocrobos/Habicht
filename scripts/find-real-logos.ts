/**
 * Find Real Logos for Clubs
 * 
 * Scrapes club websites to find actual logo images (not favicons)
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

// Clubs that need logos (had their favicon/stock removed)
const CLUBS_NEEDING_LOGOS = [
  'VBC Muri-Gümligen',
  'Sm\'Aesch Pfeffingen',
  'VBC Lengnau',
  'Raiffeisen Volley Toggenburg',
  'VBC Viamala Thusis',
  'VBC Stäfa',
  'VBC Avully',
  'TV Hüttwilen',
  'Lindaren Volley',
  'BIWI VFM',
  'SV Volley Lengnau',
  'TS Volero Zürich',
  'VBC Seftigen',
  'Volley Näfels',
  'Volley Amriswil',
  'Volley Lugano',
  'VBC Dietwil',
  'BMV 92'
]

async function findLogoFromWebsite(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for logo images (in order of preference)
    const logoSelectors = [
      'img[class*="logo"]',
      'img[alt*="logo" i]',
      'img[alt*="Logo" i]',
      'img[src*="logo" i]',
      '.logo img',
      '#logo img',
      'header img',
      '.header img',
      'a.brand img',
      '.navbar-brand img',
      'img[class*="brand"]',
    ]
    
    for (const selector of logoSelectors) {
      const img = $(selector).first()
      if (img.length) {
        let src = img.attr('src') || img.attr('data-src')
        if (src) {
          // Skip favicons
          if (src.includes('favicon') || src.includes('icon')) continue
          // Skip very small images
          const width = img.attr('width')
          if (width && parseInt(width) < 40) continue
          
          // Make absolute URL
          if (src.startsWith('//')) {
            src = 'https:' + src
          } else if (src.startsWith('/')) {
            const urlObj = new URL(url)
            src = urlObj.origin + src
          } else if (!src.startsWith('http')) {
            const urlObj = new URL(url)
            src = urlObj.origin + '/' + src
          }
          
          return src
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

async function main() {
  console.log('🔍 Finding Real Logos for Clubs\n')
  console.log('================================\n')

  let found = 0
  let notFound = 0

  for (const clubName of CLUBS_NEEDING_LOGOS) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
      select: { id: true, name: true, website: true, logo: true }
    })

    if (!club) {
      console.log(`❌ ${clubName}: NOT FOUND in database`)
      continue
    }

    if (!club.website) {
      console.log(`⚠️ ${clubName}: No website URL`)
      notFound++
      continue
    }

    console.log(`🔍 ${clubName} - ${club.website}`)
    
    const logo = await findLogoFromWebsite(club.website)
    
    if (logo) {
      // Validate the logo URL isn't a favicon
      if (logo.includes('favicon') || logo.includes('.ico')) {
        console.log(`   ⚠️ Only found favicon, skipping`)
        notFound++
        continue
      }
      
      console.log(`   ✅ Found logo: ${logo.substring(0, 70)}...`)
      
      await prisma.club.update({
        where: { id: club.id },
        data: { logo }
      })
      found++
    } else {
      console.log(`   ❌ No logo found`)
      notFound++
    }
  }

  console.log('\n📊 Results:')
  console.log(`   Found and updated: ${found}`)
  console.log(`   Not found: ${notFound}`)

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  await prisma.$disconnect()
}

main()
