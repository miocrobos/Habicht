/**
 * Batch Team Search on Volleybox.net
 * 
 * This script searches for Swiss volleyball teams on Volleybox and outputs their URLs
 * 
 * Usage: npx ts-node scripts/search-teams-volleybox.ts
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
// Function to search Google for team website
async function searchGoogleForTeam(teamName: string): Promise<string | null> {
  try {
    const searchQuery = `${teamName} volleyball Switzerland site:.ch`
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for .ch domain results
    const firstResult = $('a[href*=".ch"]').first().attr('href')
    if (firstResult && !firstResult.includes('google.com')) {
      // Extract actual URL from Google redirect
      const match = firstResult.match(/url\?q=(https?:\/\/[^&]+)/)
      if (match) {
        return match[1]
      }
      // Direct link
      if (firstResult.startsWith('http')) {
        return firstResult
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}
// Teams to search (from volleyball.ch)
const TEAMS_TO_SEARCH = [
  // 1st Liga Women - Gruppe A
  'Volley Espoirs Biel-Bienne',
  'Rhone Volley',
  'VBC Servette Star-Onex',
  'Genève Volley',
  'NNV FriSpike',
  'VBC NUC',
  'VBC Nendaz',
  
  // 1st Liga Women - Gruppe B
  'VB Therwil',
  'BTV Aarau',
  'TV Grenchen',
  'Volley Köniz',
  'VBC Lalden',
  'Volley Möhlin',
  'VFM Volleyball Franches-Montagnes',
  'Volley Münsingen',
  'VBC Langenthal',
  'VBC Münchenbuchsee',
  
  // 1st Liga Women - Gruppe C
  'NNV Eaglets Volley Aarau',
  'VBC Kanti Baden',
  'VBC Spada Academica',
  'VB Neuenkirch',
  'SAG Gordola',
  'Volley Lugano',
  'Volley Bellinzona',
  'FC Luzern',
  'SFG Stabio',
  
  // 1st Liga Women - Gruppe D
  'STV St.Gallen Volleyball',
  'Volley Näfels',
  'VBC Voléro Zürich',
  'Volley Aadorf',
  'VBC Züri Unterland',
  'Raiffeisen Volley Toggenburg',
  'Pallavolo Kreuzlingen',
  'Volley Rüschlikon',
  'VC Smash Winterthur',
  'NNV Volleyball Academy',
  'Appenzeller Bären',
  'VC Kanti Schaffhausen',
  
  // NLA Women (add if needed)
  'Viteos NUC',
  'Volley Düdingen',
  'Sm\'Aesch Pfeffingen',
  'BIWI VFM',
  'Infomaniak Genève Volley',
  'NLZ Volleyball Academy',
  'VBC Cheseaux',
]

interface SearchResult {
  query: string
  found: boolean
  teamName?: string
  teamUrl?: string
  location?: string
  website?: string
  validatedViaWebsite?: boolean
  error?: string
}

// Delay function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Search for a team on Volleybox
async function searchTeam(teamName: string): Promise<SearchResult> {
  try {
    const searchUrl = `https://volleybox.net/search?q=${encodeURIComponent(teamName)}`
    console.log(`Searching: ${teamName}`)
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    
    // Check if results found
    const nothingFound = $('h2:contains("Nothing found")').length > 0
    if (nothingFound) {
      console.log(`  ❌ Not found on Volleybox: ${teamName}`)
      
      // Try Google search for official website
      console.log(`  🔍 Searching Google for official website...`)
      await delay(1000)
      const website = await searchGoogleForTeam(teamName)
      
      if (website) {
        console.log(`  ✓ Found official website: ${website}`)
        return {
          query: teamName,
          found: true,
          teamName: teamName,
          website: website,
          validatedViaWebsite: true
        }
      }
      
      console.log(`  ❌ No website found`)
      return {
        query: teamName,
        found: false
      }
    }
    
    // Extract first team result
    const firstTeamLink = $('.team-result a, .teams-list a').first()
    if (firstTeamLink.length > 0) {
      const href = firstTeamLink.attr('href')
      const teamText = firstTeamLink.text().trim()
      const fullUrl = href?.startsWith('http') ? href : `https://volleybox.net${href}`
      const playersUrl = fullUrl.replace(/\/team$/, '') + '/players'
      
      console.log(`  ✓ Found: ${teamText}`)
      console.log(`    URL: ${playersUrl}`)
      
      return {
        query: teamName,
        found: true,
        teamName: teamText,
        teamUrl: playersUrl,
        location: teamText.split(',')[1]?.trim()
      }
    }
    
    // Alternative: check Teams section
    const teamsSection = $('h2:contains("Teams")').next('ul, div')
    const firstTeam = teamsSection.find('a').first()
    
    if (firstTeam.length > 0) {
      const href = firstTeam.attr('href')
      const teamText = firstTeam.text().trim()
      const fullUrl = href?.startsWith('http') ? href : `https://volleybox.net${href}`
      const playersUrl = fullUrl.replace(/\/team$/, '') + '/players'
      
      console.log(`  ✓ Found: ${teamText}`)
      console.log(`    URL: ${playersUrl}`)
      
      return {
        query: teamName,
        found: true,
        teamName: teamText,
        teamUrl: playersUrl,
        location: teamText.split(',')[1]?.trim()
      }
    }
    
    console.log(`  ⚠️  No clear result for: ${teamName}`)
    return {
      query: teamName,
      found: false
    }
    
  } catch (error) {
    console.error(`  ❌ Error searching ${teamName}:`, error)
    return {
      query: teamName,
      found: false,
      error: String(error)
    }
  }
}

// Main function
async function main() {
  console.log('🔍 Starting batch team search on Volleybox.net')
  console.log(`📊 Searching for ${TEAMS_TO_SEARCH.length} teams\n`)
  
  const results: SearchResult[] = []
  
  for (const teamName of TEAMS_TO_SEARCH) {
    const result = await searchTeam(teamName)
    results.push(result)
    await delay(2000) // Be respectful to the server
  }
  
  // Save results
  const outputPath = './scripts/volleybox-search-results.json'
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  
  // Generate summary
  const found = results.filter(r => r.found)
  const foundOnVolleybox = found.filter(r => r.teamUrl)
  const foundViaWebsite = found.filter(r => r.validatedViaWebsite)
  const notFound = results.filter(r => !r.found)
  
  console.log('\n' + '='.repeat(60))
  console.log('📈 SEARCH SUMMARY')
  console.log('='.repeat(60))
  console.log(`✓ Total validated: ${found.length}/${TEAMS_TO_SEARCH.length} teams`)
  console.log(`  └─ On Volleybox: ${foundOnVolleybox.length}`)
  console.log(`  └─ Via official website: ${foundViaWebsite.length}`)
  console.log(`❌ Not found: ${notFound.length} teams`)
  console.log(`💾 Results saved to: ${outputPath}\n`)
  
  // Print TypeScript array format for Volleybox teams
  if (foundOnVolleybox.length > 0) {
    console.log('📋 VOLLEYBOX TEAMS - Copy to scrape-volleybox.ts:')
    console.log('\nconst ADDITIONAL_TEAMS = [')
    foundOnVolleybox.forEach(result => {
      console.log(`  '${result.teamUrl}', // ${result.teamName}`)
    })
    console.log(']\n')
  }
  
  // Print teams with websites (manual entry needed)
  if (foundViaWebsite.length > 0) {
    console.log('🌐 TEAMS WITH OFFICIAL WEBSITES (manual scraping needed):')
    foundViaWebsite.forEach(result => {
      console.log(`  - ${result.query}`)
      console.log(`    Website: ${result.website}`)
    })
    console.log()
  }
  
  if (notFound.length > 0) {
    console.log('⚠️  TEAMS NOT VALIDATED:')
    notFound.forEach(result => {
      console.log(`  - ${result.query}`)
    })
    console.log('\n💡 These teams may need manual verification or may be inactive')
  }
}

// Run
main().catch(console.error)
