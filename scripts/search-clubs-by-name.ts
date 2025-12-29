/**
 * Search for remaining 8 clubs by name (not URL)
 * Their websites may have changed
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

const REMAINING_CLUBS = [
  'Lindaren Volley',
  'Turnverein Horgen',
  'VBC Avully',
  'VBC Chênois Genève',
  'VBC Dietwil',
  'VBC Muri-Gümligen',
  'VBC Sixieme 7',
  'Volley Bern'
]

async function searchGoogleForClub(clubName: string): Promise<{ website: string | null; logo: string | null; allUrls: string[] }> {
  try {
    const searchQuery = encodeURIComponent(`${clubName} volleyball switzerland`)
    const url = `https://www.google.com/search?q=${searchQuery}`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    })

    const $ = cheerio.load(response.data)
    const allUrls: string[] = []
    
    // Extract URLs from search results
    $('a').each((i, el) => {
      const href = $(el).attr('href')
      if (href && href.startsWith('/url?q=')) {
        const match = href.match(/\/url\?q=([^&]+)/)
        if (match) {
          const extractedUrl = decodeURIComponent(match[1])
          if (!extractedUrl.includes('google.com') && 
              !extractedUrl.includes('youtube.com') &&
              !extractedUrl.includes('facebook.com') &&
              !extractedUrl.includes('instagram.com')) {
            allUrls.push(extractedUrl)
          }
        }
      }
    })

    // Also look for volleyball.ch or volleymanager URLs with images
    const imgMatches = response.data.match(/https:\/\/[^"'\s]+(?:volleymanager|volleyball\.ch)[^"'\s]+\.(?:png|jpg|jpeg|webp)/gi)
    let logo: string | null = null
    
    if (imgMatches) {
      for (const match of imgMatches) {
        // Clean up the URL
        const cleanUrl = match.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')
        if (cleanUrl.includes('_Resources/Persistent') || cleanUrl.includes('_images-volleymanager')) {
          logo = cleanUrl
          break
        }
      }
    }

    return { 
      website: allUrls.length > 0 ? allUrls[0] : null, 
      logo,
      allUrls: allUrls.slice(0, 5)
    }
  } catch (error: any) {
    return { website: null, logo: null, allUrls: [`Error: ${error.message}`] }
  }
}

async function searchGoogleImages(clubName: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${clubName} volleyball logo`)
    const url = `https://www.google.com/search?q=${searchQuery}&tbm=isch`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    })

    // Look for volleymanager or volleyball.ch image URLs
    const patterns = [
      /https:\/\/volleymanager\.volleyball\.ch\/_Resources\/Persistent\/[a-f0-9]+\/[^"'\s\\]+\.png/gi,
      /https:\/\/www\.volleyball\.ch\/_images-volleymanager\/[^"'\s\\]+/gi,
    ]

    for (const pattern of patterns) {
      const matches = response.data.match(pattern)
      if (matches && matches.length > 0) {
        // Find one that might match club name
        for (const match of matches) {
          const cleanMatch = match.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')
          const decodedMatch = decodeURIComponent(cleanMatch)
          
          // Check if any word from club name appears in URL
          const clubWords = clubName.toLowerCase().split(/[\s-]+/)
          const matchLower = decodedMatch.toLowerCase()
          
          for (const word of clubWords) {
            if (word.length > 3 && matchLower.includes(word)) {
              return cleanMatch
            }
          }
        }
        // Return first match if no specific match
        return matches[0].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&')
      }
    }

    return null
  } catch (error) {
    return null
  }
}

async function tryWebsite(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for logo images
    const selectors = ['img[class*="logo"]', 'img[alt*="logo" i]', 'img[src*="logo" i]', '.logo img', 'header img']
    
    for (const selector of selectors) {
      const img = $(selector).first()
      if (img.length) {
        let src = img.attr('src') || img.attr('data-src')
        if (src && !src.includes('favicon') && !src.includes('.ico')) {
          if (src.startsWith('//')) src = 'https:' + src
          else if (src.startsWith('/')) {
            const urlObj = new URL(url)
            src = urlObj.origin + src
          }
          return src
        }
      }
    }
    return null
  } catch {
    return null
  }
}

async function main() {
  console.log('🔍 Searching for Remaining 8 Clubs by Name\n')
  console.log('===========================================\n')

  const results: { name: string; logo: string }[] = []

  for (const clubName of REMAINING_CLUBS) {
    console.log(`\n📌 ${clubName}`)
    
    // 1. Search Google for the club
    console.log('   Searching Google...')
    const googleResult = await searchGoogleForClub(clubName)
    
    if (googleResult.logo) {
      console.log(`   ✅ Found logo on volleyball.ch: ${googleResult.logo.substring(0, 60)}...`)
      results.push({ name: clubName, logo: googleResult.logo })
      continue
    }
    
    console.log(`   Found URLs: ${googleResult.allUrls.slice(0, 3).join(', ')}`)
    
    // 2. Search Google Images specifically
    console.log('   Searching Google Images...')
    const imageResult = await searchGoogleImages(clubName)
    
    if (imageResult) {
      console.log(`   ✅ Found logo via images: ${imageResult.substring(0, 60)}...`)
      results.push({ name: clubName, logo: imageResult })
      continue
    }
    
    // 3. Try the found website
    if (googleResult.website) {
      console.log(`   Checking website: ${googleResult.website}`)
      const websiteLogo = await tryWebsite(googleResult.website)
      if (websiteLogo) {
        console.log(`   ✅ Found logo on website: ${websiteLogo.substring(0, 60)}...`)
        results.push({ name: clubName, logo: websiteLogo })
        continue
      }
    }
    
    console.log('   ❌ No logo found')
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('\n\n📋 Results:\n')
  for (const r of results) {
    console.log(`✅ ${r.name}:`)
    console.log(`   ${r.logo}\n`)
  }

  if (results.length > 0) {
    console.log('\n🔧 Applying found logos...\n')
    
    for (const r of results) {
      const club = await prisma.club.findFirst({
        where: { name: r.name },
        select: { id: true }
      })
      
      if (club) {
        await prisma.club.update({
          where: { id: club.id },
          data: { logo: r.logo }
        })
        console.log(`   ✅ Updated ${r.name}`)
      }
    }
  }

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  if (withoutLogo > 0) {
    const remaining = await prisma.club.findMany({
      where: { logo: null },
      select: { name: true },
      orderBy: { name: 'asc' }
    })
    console.log('\n📋 Still without logos:')
    remaining.forEach(c => console.log(`   - ${c.name}`))
  }

  await prisma.$disconnect()
}

main()
