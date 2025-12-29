/**
 * Search volleyball.ch API/pages for club logos
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

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

async function searchVolleyManagerLogo(clubName: string): Promise<string | null> {
  try {
    // The volleyball.ch site uses a pattern for club logos
    // Format: volleymanager.volleyball.ch/_Resources/Persistent/{hash}/{clubId}_{clubName}.png
    
    // Try to find the logo via Google with specific site search
    const searchQuery = encodeURIComponent(`site:volleymanager.volleyball.ch "${clubName}" logo png`)
    const url = `https://www.google.com/search?q=${searchQuery}`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    })

    // Extract volleymanager URLs from the response
    const matches = response.data.match(/https:\/\/volleymanager\.volleyball\.ch\/_Resources\/Persistent\/[a-f0-9]+\/[^"'\s<>]+\.png/gi)
    
    if (matches && matches.length > 0) {
      // Find one that matches the club name
      for (const match of matches) {
        const decodedMatch = decodeURIComponent(match)
        const clubNameLower = clubName.toLowerCase().replace(/[-\s]/g, '')
        const matchLower = decodedMatch.toLowerCase()
        
        if (matchLower.includes(clubNameLower) || 
            matchLower.includes(clubName.split(' ')[0].toLowerCase()) ||
            matchLower.includes(clubName.split(' ').pop()!.toLowerCase())) {
          return match
        }
      }
      // Return first match if none specifically match
      return matches[0]
    }

    return null
  } catch (error: any) {
    console.log(`   Error: ${error.message}`)
    return null
  }
}

async function main() {
  console.log('🔍 Searching Volleyball Manager for Remaining Logos\n')
  console.log('====================================================\n')

  const results: { name: string; logo: string | null }[] = []

  for (const clubName of REMAINING_CLUBS) {
    console.log(`🔍 ${clubName}`)
    
    const logo = await searchVolleyManagerLogo(clubName)
    
    if (logo) {
      console.log(`   ✅ Found: ${logo.substring(0, 70)}...`)
      results.push({ name: clubName, logo })
    } else {
      console.log(`   ❌ No logo found`)
      results.push({ name: clubName, logo: null })
    }

    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  console.log('\n\n📋 Results for manual update:\n')
  for (const r of results) {
    if (r.logo) {
      console.log(`  { name: '${r.name}', logo: '${r.logo}' },`)
    }
  }

  await prisma.$disconnect()
}

main()
