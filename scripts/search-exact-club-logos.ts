/**
 * Search for exact club logos on volleyball.ch
 * Using more specific name matching
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

const REMAINING_CLUBS = [
  'Lindaren Volley',
  'Turnverein Horgen',
  'VBC Avully',
  'VBC Dietwil',
  'VBC Muri-Gümligen',
  'VBC Sixieme 7',
  'Volley Bern'
]

async function searchExactClub(clubName: string): Promise<string | null> {
  try {
    // Search for the EXACT club name in quotes
    const searchQuery = encodeURIComponent(`"${clubName}" site:volleymanager.volleyball.ch`)
    const url = `https://www.google.com/search?q=${searchQuery}&tbm=isch`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    })

    // Look for volleymanager URLs that contain this club's name
    const pattern = /https:\/\/volleymanager\.volleyball\.ch\/_Resources\/Persistent\/[a-f0-9]+\/\d+_[^"'\s\\]+\.png/gi
    const matches = response.data.match(pattern)
    
    if (matches) {
      // Clean club name for matching
      const clubNameClean = clubName
        .toLowerCase()
        .replace(/[üö]/g, match => match === 'ü' ? 'u' : 'o')
        .replace(/[-\s]/g, '')
      
      for (const match of matches) {
        const decodedMatch = decodeURIComponent(match.replace(/\\u003d/g, '='))
        const matchClean = decodedMatch
          .toLowerCase()
          .replace(/%20/g, '')
          .replace(/%c3%bc/g, 'u')  // ü
          .replace(/%c3%b6/g, 'o')  // ö
          .replace(/[-_\s]/g, '')
        
        // Check if the filename contains significant parts of club name
        const nameParts = clubName.toLowerCase().split(/[\s-]+/)
        const significantParts = nameParts.filter(p => p.length > 3 && !['volley', 'club', 'vbc'].includes(p))
        
        let matchCount = 0
        for (const part of significantParts) {
          if (matchClean.includes(part.replace(/[üö]/g, m => m === 'ü' ? 'u' : 'o'))) {
            matchCount++
          }
        }
        
        // Require at least one significant word match
        if (matchCount > 0) {
          console.log(`      Match found: ${decodedMatch}`)
          return match
        }
      }
    }

    return null
  } catch (error: any) {
    console.log(`      Error: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🔍 Searching for Exact Club Logos\n')
  console.log('==================================\n')

  const results: { name: string; logo: string }[] = []

  for (const clubName of REMAINING_CLUBS) {
    console.log(`📌 ${clubName}`)
    
    const logo = await searchExactClub(clubName)
    
    if (logo) {
      console.log(`   ✅ Found exact match`)
      results.push({ name: clubName, logo })
    } else {
      console.log(`   ❌ No exact match found`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  if (results.length > 0) {
    console.log('\n\n🔧 Applying found logos...\n')
    
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
