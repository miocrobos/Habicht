/**
 * Try alternative names/searches for remaining clubs
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Alternative search names for these clubs
const CLUBS_ALTERNATIVES = [
  { name: 'Lindaren Volley', alternatives: ['Lindaren', 'Volley Lindaren', 'Lindaren Luzern'] },
  { name: 'Turnverein Horgen', alternatives: ['TV Horgen', 'Horgen Volleyball', 'Turnverein Horgen Volleyball'] },
  { name: 'VBC Avully', alternatives: ['Avully VBC', 'Avully Volleyball', 'Volleyball Club Avully'] },
  { name: 'VBC Dietwil', alternatives: ['Dietwil VBC', 'Dietwil Volleyball'] },
  { name: 'VBC Muri-Gümligen', alternatives: ['VBC Muri Gümligen', 'Muri-Gümligen Volleyball', 'VBC MG', 'Muri Gumligen'] },
  { name: 'VBC Sixieme 7', alternatives: ['Sixieme 7', '6ème 7', 'Sixieme Set'] },
  { name: 'Volley Bern', alternatives: ['Volley Bern Munari', 'VBC Bern', 'Bern Volleyball'] },
]

async function searchGoogleImages(query: string): Promise<string | null> {
  try {
    const searchQuery = encodeURIComponent(`${query} volleyball logo switzerland`)
    const url = `https://www.google.com/search?q=${searchQuery}&tbm=isch`
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    })

    // Look for volleymanager URLs
    const pattern = /https:\/\/volleymanager\.volleyball\.ch\/_Resources\/Persistent\/[a-f0-9]+\/\d+_[^"'\s\\]+\.(?:png|jpg)/gi
    const matches = response.data.match(pattern)
    
    if (matches) {
      // Decode and check each match
      for (const match of matches) {
        const decoded = decodeURIComponent(match.replace(/\\u003d/g, '='))
        
        // Extract club name from URL (format: /ID_ClubName.png)
        const nameMatch = decoded.match(/\/\d+_(.+)\.(?:png|jpg)/i)
        if (nameMatch) {
          const urlClubName = nameMatch[1].replace(/%20/g, ' ')
          
          // Check all variants of the query
          const queryParts = query.toLowerCase().split(/[\s-]+/).filter(p => p.length > 2)
          const urlNameLower = urlClubName.toLowerCase()
          
          let matchScore = 0
          for (const part of queryParts) {
            if (urlNameLower.includes(part)) {
              matchScore++
            }
          }
          
          if (matchScore >= 2 || (queryParts.length === 1 && matchScore === 1)) {
            return { logo: match, matchedName: urlClubName } as any
          }
        }
      }
    }
    return null
  } catch {
    return null
  }
}

async function main() {
  console.log('🔍 Trying Alternative Names for Remaining Clubs\n')
  console.log('================================================\n')

  for (const club of CLUBS_ALTERNATIVES) {
    console.log(`\n📌 ${club.name}`)
    
    let found = false
    
    for (const alt of [club.name, ...club.alternatives]) {
      console.log(`   Trying: "${alt}"`)
      
      const result = await searchGoogleImages(alt)
      
      if (result) {
        const { logo, matchedName } = result as any
        console.log(`   ✅ Found: ${matchedName}`)
        console.log(`      ${logo}`)
        
        // Update the database
        const dbClub = await prisma.club.findFirst({
          where: { name: club.name },
          select: { id: true }
        })
        
        if (dbClub) {
          await prisma.club.update({
            where: { id: dbClub.id },
            data: { logo }
          })
          console.log(`   ✅ Updated in database`)
        }
        
        found = true
        break
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    if (!found) {
      console.log(`   ❌ No match found with any alternative`)
    }
  }

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n\n📊 Final Count:')
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
