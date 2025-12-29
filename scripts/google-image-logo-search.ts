/**
 * Find Club Logos via Google Images
 * 
 * Searches Google Images for each club's logo and tries to extract a logo URL
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

async function searchGoogleImages(clubName: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${clubName} volleyball logo switzerland`)
    const url = `https://www.google.com/search?q=${searchQuery}&tbm=isch`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    })

    const $ = cheerio.load(response.data)
    
    // Google Images embeds image URLs in various ways
    // Try to find image URLs in the page
    const imgUrls: string[] = []
    
    // Method 1: Look for data-src or src in img tags
    $('img').each((i, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src')
      if (src && src.startsWith('http') && !src.includes('google.com') && !src.includes('gstatic.com')) {
        imgUrls.push(src)
      }
    })
    
    // Method 2: Parse script tags for image URLs (Google often embeds them in JS)
    const scriptContent = $('script').text()
    const urlMatches = scriptContent.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp|svg)/gi)
    if (urlMatches) {
      for (const match of urlMatches) {
        if (!match.includes('google.com') && !match.includes('gstatic.com') && !match.includes('googleapis.com')) {
          imgUrls.push(match)
        }
      }
    }

    // Method 3: Look for og:image or other meta tags
    $('meta[property="og:image"], meta[name="twitter:image"]').each((i, el) => {
      const content = $(el).attr('content')
      if (content && content.startsWith('http')) {
        imgUrls.push(content)
      }
    })

    // Filter and return first valid logo-like URL
    for (const imgUrl of imgUrls) {
      // Skip obvious non-logos
      if (imgUrl.includes('favicon')) continue
      if (imgUrl.includes('avatar')) continue
      if (imgUrl.includes('profile')) continue
      if (imgUrl.length > 500) continue // Skip very long encoded URLs
      
      // Prefer URLs that contain the club name or 'logo'
      const lowerUrl = imgUrl.toLowerCase()
      const lowerClub = clubName.toLowerCase()
      
      if (lowerUrl.includes('logo') || lowerUrl.includes(lowerClub.split(' ')[0])) {
        return imgUrl
      }
    }

    // Return first image if no logo-specific one found
    return imgUrls.length > 0 ? imgUrls[0] : null
    
  } catch (error: any) {
    console.log(`   Error: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🔍 Searching Google Images for Club Logos\n')
  console.log('==========================================\n')

  const clubs = await prisma.club.findMany({
    where: { logo: null },
    select: { id: true, name: true, website: true },
    orderBy: { name: 'asc' }
  })

  console.log(`Found ${clubs.length} clubs without logos\n`)

  let found = 0
  let notFound = 0
  const results: { name: string; logo: string }[] = []

  for (const club of clubs) {
    console.log(`🔍 ${club.name}`)
    
    const logoUrl = await searchGoogleImages(club.name)
    
    if (logoUrl) {
      console.log(`   ✅ Found: ${logoUrl.substring(0, 70)}...`)
      results.push({ name: club.name, logo: logoUrl })
      found++
    } else {
      console.log(`   ❌ No logo found`)
      notFound++
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n📊 Results:')
  console.log(`   Found: ${found}`)
  console.log(`   Not found: ${notFound}`)

  if (results.length > 0) {
    console.log('\n📋 Logos found (manual review needed):')
    for (const r of results) {
      console.log(`\n   ${r.name}:`)
      console.log(`   ${r.logo}`)
    }
  }

  await prisma.$disconnect()
}

main()
