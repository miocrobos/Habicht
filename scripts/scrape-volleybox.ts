/**
 * Volleybox.net Web Scraper for Swiss Volleyball Teams
 * 
 * This script scrapes player data from Volleybox.net for Swiss volleyball clubs
 * 
 * Usage: npx ts-node scripts/scrape-volleybox.ts
 * 
 * IMPORTANT: Check Volleybox.net's terms of service before running this script.
 * Consider adding delays between requests to be respectful of their servers.
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

// Types
interface ScrapedPlayer {
  name: string
  firstName: string
  lastName: string
  jerseyNumber: number
  position: 'SETTER' | 'OPPOSITE' | 'OUTSIDE_HITTER' | 'MIDDLE_BLOCKER' | 'LIBERO'
  height: number
  dateOfBirth: string
  nationality: string
  profileUrl: string
}

interface ScrapedTeam {
  name: string
  league: string
  season: string
  country: string
  town: string
  canton: string
  founded?: number
  website?: string
  profileUrl: string
  players: ScrapedPlayer[]
}

// Swiss team URLs for NLA Men's 2025/26
const NLA_MEN_TEAMS = [
  'https://volleybox.net/chenois-geneve-vb-t1415/players',
  'https://volleybox.net/colombier-volley-t4040/players',
  'https://volleybox.net/lausanne-uc-t1602/players',
  'https://volleybox.net/stv-st-gallen-t6931/players',
  'https://volleybox.net/volley-schonenwerd-t2365/players',
  'https://volleybox.net/volley-amriswil-t1414/players',
  'https://volleybox.net/sm-aesch-pfeffingen-t1422/players',
  'https://volleybox.net/vfm-t6888/players',
  'https://volleybox.net/volley-luzern-t7028/players',
]

// Swiss League B (NLB) Men's 2025/26
const NLB_MEN_TEAMS = [
  'https://volleybox.net/btv-aarau-volley-t4117/players',
  'https://volleybox.net/city-volley-basel-t6799/players',
  'https://volleybox.net/lausanne-uc-ii-t9485/players',
  'https://volleybox.net/lindaren-volley-amriswil-ii-t9571/players',
  'https://volleybox.net/spiez-t7067/players',
  'https://volleybox.net/tsv-jona-t2301/players',
  'https://volleybox.net/tv-volley-oberdiessbach-t6875/players',
  'https://volleybox.net/vc-kanti-schaffhausen-t7070/players',
  'https://volleybox.net/vbc-munsingen-t7074/players',
  'https://volleybox.net/vfm-ii-t9556/players',
  'https://volleybox.net/volley-castle-t7074/players',
  'https://volleybox.net/volley-smash-02-t9555/players',
  'https://volleybox.net/swiss-volley-national-team-t1483/players',
]

// 1st Liga Men's 2025/26  
const FIRST_LIGA_MEN_TEAMS = [
  'https://volleybox.net/dragons-lugano-t7211/players',
  'https://volleybox.net/bienne-volleyboys-t4101/players',
  'https://volleybox.net/biogas-volley-nafels-h2-t9572/players',
  'https://volleybox.net/cap-volley-t7020/players',
  'https://volleybox.net/tsv-jona-t26260/players',
  'https://volleybox.net/volley-nafels-t7506/players',
  'https://volleybox.net/vbc-bern-t7009/players',
  'https://volleybox.net/cv-lugano-t1603/players',
  'https://volleybox.net/vbc-fribourg-t1604/players',
  'https://volleybox.net/vbc-emmen-t9001/players',
  'https://volleybox.net/volley-luzern-t4517/players',
]

// 1st Liga Women's 2025/26 (from volleyball.ch game center)
const FIRST_LIGA_WOMEN_TEAMS = [
  // Gruppe A - Found on Volleybox
  'https://volleybox.net/vbc-cheseaux-t21629/players',
  'https://volleybox.net/vbc-cossonay-t28778/players',
  'https://volleybox.net/servette-star-onex-vbc-ii-t20727/players',
  'https://volleybox.net/tv-murten-volleyball-h1-t28767/players',
  // Gruppe B
  'https://volleybox.net/vbc-thun-t21497/players',
  // Gruppe C
  'https://volleybox.net/volley-luzern-t4517/players', // Also in Men's 1st Liga
  // Need to search more teams from Groups A, B, C, D
]

// 2nd Liga Teams (discovered from schedules and Swiss Volley)
const SECOND_LIGA_TEAMS = [
  // To be populated
]

// 3rd Liga Teams  
const THIRD_LIGA_TEAMS = [
  // To be populated
]

// 4th Liga Teams
const FOURTH_LIGA_TEAMS = [
  // To be populated
]

// Town to Canton mapping
const TOWN_TO_CANTON: Record<string, string> = {
  'Genève': 'GE',
  'Geneva': 'GE',
  'Genf': 'GE',
  'Colombier': 'NE',
  'Lausanne': 'VD',
  'St. Gallen': 'SG',
  'Sankt Gallen': 'SG',
  'St Gallen': 'SG',
  'Schönenwerd': 'SO',
  'Schonenwerd': 'SO',
  'Amriswil': 'TG',
  'Jona': 'SG',
  'Näfels': 'GL',
  'Nafels': 'GL',
  'Zürich': 'ZH',
  'Zurich': 'ZH',
  'Bern': 'BE',
  'Berne': 'BE',
  'Basel': 'BS',
  'Luzern': 'LU',
  'Lucerne': 'LU',
  'Aarau': 'AG',
  'Spiez': 'BE',
  'Oberdiessbach': 'BE',
  'Schaffhausen': 'SH',
  'Münsingen': 'BE',
  'Munsingen': 'BE',
  'Lugano': 'TI',
  'Biel': 'BE',
  'Bienne': 'BE',
  'Fribourg': 'FR',
  'Freiburg': 'FR',
  'Emmen': 'LU',
  'Aesch': 'BL',
  'Pfeffingen': 'BL',
  'Cheseaux-sur-Lausanne': 'VD',
  'Cheseaux': 'VD',
  'Cossonay': 'VD',
  'Martigny': 'VS',
  'Murten': 'FR',
  'Neuchâtel': 'NE',
  'Nendaz': 'VS',
  'Therwil': 'BL',
  'Grenchen': 'SO',
  'Köniz': 'BE',
  'Lalden': 'VS',
  'Möhlin': 'AG',
  'Thun': 'BE',
  'Saignelégier': 'JU',
  'Langenthal': 'BE',
  'Münchenbuchsee': 'BE',
  'Kanti Baden': 'AG',
  'Baden': 'AG',
  'Neuenkirch': 'LU',
  'Gordola': 'TI',
  'Bellinzona': 'TI',
  'Stabio': 'TI',
  'Kloten': 'ZH',
  'Aadorf': 'TG',
  'Wattwil': 'SG',
  'Kreuzlingen': 'TG',
  'Rüschlikon': 'ZH',
  'Winterthur': 'ZH',
  'Appenzell': 'AI',
  'Cadempino': 'TI',
  'Düdingen': 'FR',
}

// Position mapping
function mapPosition(position: string): ScrapedPlayer['position'] {
  const normalized = position.toLowerCase().trim()
  if (normalized.includes('setter') || normalized.includes('zuspieler')) return 'SETTER'
  if (normalized.includes('opposite') || normalized.includes('diagonal')) return 'OPPOSITE'
  if (normalized.includes('outside') || normalized.includes('aussen')) return 'OUTSIDE_HITTER'
  if (normalized.includes('middle') || normalized.includes('mittel')) return 'MIDDLE_BLOCKER'
  if (normalized.includes('libero')) return 'LIBERO'
  return 'OUTSIDE_HITTER' // default
}

// Parse player name into first and last name
function parseName(fullName: string): { firstName: string, lastName: string } {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] }
  }
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  return { firstName, lastName }
}

// Delay function to be respectful to the server
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Scrape a single team page
async function scrapeTeam(url: string, league: string = 'NLA'): Promise<ScrapedTeam | null> {
  try {
    console.log(`Fetching: ${url}`)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const players: ScrapedPlayer[] = []
    
    // Extract team info
    const teamName = $('h1').first().text().trim()
    let town = ''
    let founded: number | undefined
    let website: string | undefined
    
    // Parse team data section
    $('.team-data li').each((_, el) => {
      const text = $(el).text()
      if (text.includes('Town')) {
        town = text.split('Town')[1].trim()
      }
      if (text.includes('Founded')) {
        const yearMatch = text.match(/\d{4}/)
        if (yearMatch) founded = parseInt(yearMatch[0])
      }
    })
    
    // Find website link
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr('href')
      if (href && !href.includes('volleybox.net') && !href.includes('facebook')) {
        website = href
      }
    })
    
    // Find current season section (2025/26)
    const seasonSection = $('h2:contains("2025/26")').first().parent()
    
    // Parse players from the current season
    seasonSection.find('.player-card, tr').each((_, el) => {
      const $player = $(el)
      
      // Extract player data
      const nameEl = $player.find('a[href*="/p"]').first()
      const fullName = nameEl.text().trim()
      
      if (!fullName) return
      
      const profileUrl = 'https://volleybox.net' + nameEl.attr('href')
      const positionText = $player.find('.position, td:contains("Setter"), td:contains("Opposite"), td:contains("Outside"), td:contains("Middle"), td:contains("Libero")').first().text().trim()
      const heightText = $player.find('.height, td').filter((_, td) => {
        const text = $(td).text()
        return /^\d{3}$/.test(text)
      }).first().text().trim()
      const jerseyText = $player.find('.number, td').first().text().trim()
      
      // Parse nationality from flag image
      const flagImg = $player.find('img[src*="/flags/"]')
      const nationality = flagImg.attr('alt') || flagImg.attr('title') || 'Switzerland'
      
      // Extract date of birth (often shown as birth year)
      const yearText = $player.text().match(/\b(19|20)\d{2}\b/)
      const birthYear = yearText ? yearText[0] : '2000'
      
      const { firstName, lastName } = parseName(fullName)
      const height = parseInt(heightText) || 190
      const jerseyNumber = parseInt(jerseyText) || 0
      
      if (firstName && lastName) {
        players.push({
          name: fullName,
          firstName,
          lastName,
          jerseyNumber,
          position: mapPosition(positionText),
          height,
          dateOfBirth: `${birthYear}-01-01`,
          nationality,
          profileUrl
        })
      }
    })
    
    // Determine canton from town
    const canton = TOWN_TO_CANTON[town] || 'ZH'
    
    console.log(`✓ Scraped ${teamName}: ${players.length} players`)
    
    return {
      name: teamName,
      league: league, // Use dynamic league parameter
      season: '2025/26',
      country: 'Switzerland',
      town,
      canton,
      founded,
      website,
      profileUrl: url,
      players
    }
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return null
  }
}

// Main scraping function
async function scrapeAllTeams() {
  console.log('Starting Volleybox scraper...')
  console.log(`Scraping Swiss Volleyball Teams 2025/26:`)
  console.log(`- NLA: ${NLA_MEN_TEAMS.length} teams`)
  console.log(`- NLB: ${NLB_MEN_TEAMS.length} teams`)
  console.log(`- 1st Liga Men: ${FIRST_LIGA_MEN_TEAMS.length} teams`)
  console.log(`- 1st Liga Women: ${FIRST_LIGA_WOMEN_TEAMS.length} teams`)
  console.log(`Total: ${NLA_MEN_TEAMS.length + NLB_MEN_TEAMS.length + FIRST_LIGA_MEN_TEAMS.length + FIRST_LIGA_WOMEN_TEAMS.length} teams\n`)
  
  const allTeams: ScrapedTeam[] = []
  
  // Scrape NLA teams
  console.log('\n=== Scraping NLA Teams ===')
  for (const teamUrl of NLA_MEN_TEAMS) {
    const team = await scrapeTeam(teamUrl, 'NLA')
    if (team) {
      allTeams.push(team)
    }
    await delay(2000)
  }
  
  // Scrape NLB teams
  console.log('\n=== Scraping NLB Teams ===')
  for (const teamUrl of NLB_MEN_TEAMS) {
    const team = await scrapeTeam(teamUrl, 'NLB')
    if (team) {
      allTeams.push(team)
    }
    await delay(2000)
  }
  
  // Scrape 1st Liga Men teams
  console.log('\n=== Scraping 1st Liga Men Teams ===')
  for (const teamUrl of FIRST_LIGA_MEN_TEAMS) {
    const team = await scrapeTeam(teamUrl, '1. Liga')
    if (team) {
      allTeams.push(team)
    }
    await delay(2000)
  }
  
  // Scrape 1st Liga Women teams
  console.log('\n=== Scraping 1st Liga Women Teams ===')
  for (const teamUrl of FIRST_LIGA_WOMEN_TEAMS) {
    const team = await scrapeTeam(teamUrl, '1. Liga')
    if (team) {
      allTeams.push(team)
    }
    await delay(2000)
  }
  
  // Save to JSON file
  const outputDir = path.join(__dirname, '../data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const outputPath = path.join(outputDir, 'volleybox-teams.json')
  fs.writeFileSync(outputPath, JSON.stringify(allTeams, null, 2), 'utf-8')
  
  console.log(`\n✓ Scraping complete!`)
  console.log(`✓ Total teams scraped: ${allTeams.length}`)
  console.log(`✓ Total players scraped: ${allTeams.reduce((sum, team) => sum + team.players.length, 0)}`)
  console.log(`✓ Data saved to: ${outputPath}`)
  
  // Generate summary
  console.log('\nTeams Summary:')
  allTeams.forEach(team => {
    console.log(`- ${team.name} (${team.canton}): ${team.players.length} players`)
  })
}

// Run the scraper
scrapeAllTeams().catch(console.error)

export { scrapeAllTeams, scrapeTeam }
