/**
 * Search Swiss Volleyball Manager for remaining club logos
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

const REMAINING_CLUBS = [
  'Lindaren Volley',
  'STV Buttisholz',
  'Turnverein Horgen',
  'VBC Avully',
  'VBC Chênois Genève',
  'VBC Dietwil',
  'VBC Muri-Gümligen',
  'VBC Seftigen',
  'VBC Sixieme 7',
  'Volley Bern',
  'Volley GraPa',
  'Volleyball-Club Volketswil'
]

async function searchVolleyManager(clubName: string): Promise<string | null> {
  try {
    // Search on Swiss Volleyball website
    const searchQuery = encodeURIComponent(clubName)
    const url = `https://www.volleyball.ch/verband/clubs/clubsuche/?tx_swissvolleyvm_clubs%5Bsearch%5D=${searchQuery}`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(response.data)
    
    // Look for club logo in search results
    const logoImg = $('img[src*="volleymanager"]').first()
    if (logoImg.length) {
      let src = logoImg.attr('src')
      if (src && !src.includes('placeholder')) {
        // Make absolute URL
        if (src.startsWith('/')) {
          src = 'https://www.volleyball.ch' + src
        }
        return src
      }
    }

    // Also try finding it in the Resources path
    const allImgs = $('img').toArray()
    for (const img of allImgs) {
      const src = $(img).attr('src')
      if (src && src.includes('_Resources/Persistent') && src.includes('.png')) {
        if (src.startsWith('/')) {
          return 'https://volleymanager.volleyball.ch' + src
        }
        return src
      }
    }

    return null
  } catch (error: any) {
    console.log(`   Error: ${error.message}`)
    return null
  }
}

async function searchClubWebsite(website: string, clubName: string): Promise<string | null> {
  try {
    const response = await axios.get(website, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(response.data)
    
    // Look for logo images more aggressively
    const selectors = [
      'img[class*="logo"]',
      'img[alt*="logo" i]',
      'img[src*="logo" i]',
      '.logo img',
      '#logo img',
      'header img:first',
      '.site-logo img',
      '.navbar-brand img',
      'a[class*="brand"] img',
    ]

    for (const selector of selectors) {
      const img = $(selector).first()
      if (img.length) {
        let src = img.attr('src') || img.attr('data-src')
        if (src && !src.includes('favicon') && !src.includes('.ico')) {
          // Make absolute URL
          if (src.startsWith('//')) {
            src = 'https:' + src
          } else if (src.startsWith('/')) {
            const urlObj = new URL(website)
            src = urlObj.origin + src
          } else if (!src.startsWith('http')) {
            const urlObj = new URL(website)
            src = urlObj.origin + '/' + src
          }
          return src
        }
      }
    }

    return null
  } catch (error: any) {
    return null
  }
}

async function main() {
  console.log('🔍 Searching for Remaining Club Logos\n')
  console.log('======================================\n')

  for (const clubName of REMAINING_CLUBS) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
      select: { id: true, name: true, website: true, logo: true }
    })

    if (!club) {
      console.log(`❌ ${clubName}: NOT FOUND`)
      continue
    }

    console.log(`🔍 ${clubName}`)

    // Try Swiss Volleyball Manager first
    let logo = await searchVolleyManager(clubName)
    
    if (logo) {
      console.log(`   ✅ Found on volleyball.ch: ${logo.substring(0, 60)}...`)
    } else if (club.website) {
      // Try club website
      logo = await searchClubWebsite(club.website, clubName)
      if (logo) {
        console.log(`   ✅ Found on club website: ${logo.substring(0, 60)}...`)
      }
    }

    if (!logo) {
      console.log(`   ❌ No logo found`)
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  await prisma.$disconnect()
}

main()
