/**
 * Deep Logo Search - scrape remaining club websites for logos
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

const REMAINING_CLUBS = [
  { name: 'Lindaren Volley', website: 'https://www.lindaren-volley.ch' },
  { name: 'STV Buttisholz', website: 'https://volley-buttisholz.ch' },
  { name: 'Turnverein Horgen', website: 'https://www.tv-horgen.ch' },
  { name: 'VBC Avully', website: 'https://avullyvbc.ch' },
  { name: 'VBC Chênois Genève', website: 'https://www.vbchenois.ch' },
  { name: 'VBC Dietwil', website: 'https://www.vbcdietwil.ch' },
  { name: 'VBC Muri-Gümligen', website: 'https://www.vbc-mg.ch' },
  { name: 'VBC Seftigen', website: 'https://www.vbcseftigen.ch' },
  { name: 'VBC Sixieme 7', website: 'https://6e7.ch' },
  { name: 'Volley Bern', website: 'https://volleybern.ch' }
]

async function findLogoDeep(website: string): Promise<{ url: string | null; allImages: string[] }> {
  try {
    const response = await axios.get(website, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    })

    const $ = cheerio.load(response.data)
    const allImages: string[] = []
    let logoUrl: string | null = null
    
    // Collect ALL images on the page
    $('img').each((i, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
      if (src) {
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
        
        // Skip tiny/data images
        if (!src.startsWith('data:') && src.length < 300) {
          allImages.push(src)
          
          // Check if this looks like a logo
          const srcLower = src.toLowerCase()
          const alt = ($(el).attr('alt') || '').toLowerCase()
          const className = ($(el).attr('class') || '').toLowerCase()
          
          if ((srcLower.includes('logo') || alt.includes('logo') || className.includes('logo')) &&
              !srcLower.includes('favicon') && !srcLower.includes('.ico')) {
            if (!logoUrl) logoUrl = src
          }
        }
      }
    })

    // Also check for SVG logos
    $('svg').each((i, el) => {
      const className = ($(el).attr('class') || '').toLowerCase()
      if (className.includes('logo')) {
        // Can't easily extract SVG as URL, but note it exists
      }
    })

    // Check CSS background images in header/logo areas
    $('header, .header, .logo, #logo, .navbar-brand, .site-logo').each((i, el) => {
      const style = $(el).attr('style') || ''
      const bgMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/i)
      if (bgMatch) {
        let bgUrl = bgMatch[1]
        if (!bgUrl.startsWith('http')) {
          const urlObj = new URL(website)
          bgUrl = urlObj.origin + '/' + bgUrl.replace(/^\//, '')
        }
        allImages.push('(bg) ' + bgUrl)
        if (!logoUrl && bgUrl.toLowerCase().includes('logo')) {
          logoUrl = bgUrl
        }
      }
    })

    return { url: logoUrl, allImages }
  } catch (error: any) {
    return { url: null, allImages: [`Error: ${error.message}`] }
  }
}

async function main() {
  console.log('🔍 Deep Logo Search for Remaining Clubs\n')
  console.log('========================================\n')

  for (const club of REMAINING_CLUBS) {
    console.log(`\n📌 ${club.name}`)
    console.log(`   Website: ${club.website}`)
    
    const result = await findLogoDeep(club.website)
    
    if (result.url) {
      console.log(`   ✅ Logo found: ${result.url}`)
    } else {
      console.log(`   ❌ No logo found`)
      console.log(`   📷 All images on page:`)
      result.allImages.slice(0, 10).forEach(img => {
        console.log(`      - ${img.substring(0, 80)}${img.length > 80 ? '...' : ''}`)
      })
      if (result.allImages.length > 10) {
        console.log(`      ... and ${result.allImages.length - 10} more`)
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  await prisma.$disconnect()
}

main()
