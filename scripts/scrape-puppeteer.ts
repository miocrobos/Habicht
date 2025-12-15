/**
 * Puppeteer-based Volleybox scraper
 * Uses browser automation to bypass 403 blocks
 */

import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import * as fs from 'fs'
import * as path from 'path'

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin())

interface PlayerData {
  name: string
  firstName: string
  lastName: string
  jerseyNumber?: number
  position: string
  height?: number
  dateOfBirth?: string
  nationality: string
  profileUrl: string
}

interface TeamData {
  name: string
  league: string
  town: string
  canton: string
  players: PlayerData[]
}

// Teams to scrape from existing database
const TEAMS_TO_SCRAPE = [
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

function parseName(fullName: string) {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] }
  }
  const lastName = parts[parts.length - 1]
  const firstName = parts.slice(0, -1).join(' ')
  return { firstName, lastName }
}

function mapPosition(position: string): string {
  const normalized = position.toLowerCase().trim()
  if (normalized.includes('setter') || normalized.includes('zuspieler')) return 'SETTER'
  if (normalized.includes('opposite') || normalized.includes('diagonal')) return 'OPPOSITE'
  if (normalized.includes('outside') || normalized.includes('aussen')) return 'OUTSIDE_HITTER'
  if (normalized.includes('middle') || normalized.includes('mittel')) return 'MIDDLE_BLOCKER'
  if (normalized.includes('libero')) return 'LIBERO'
  return 'OUTSIDE_HITTER'
}

async function scrapeTeamWithPuppeteer(url: string): Promise<TeamData | null> {
  const browser = await puppeteer.launch({
    headless: 'new' as any,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    timeout: 60000
  })

  try {
    const page = await browser.newPage()
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    console.log(`🌐 Loading: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    
    // Wait for player table to load
    await page.waitForSelector('.team-roster, .players-list, table', { timeout: 10000 })
    
    // Extract data using page.evaluate
    const data = await page.evaluate(() => {
      const teamName = document.querySelector('h1')?.textContent?.trim() || ''
      const players: any[] = []
      
      // Try multiple selectors for player rows
      const playerRows = document.querySelectorAll('table tr, .player-row, .roster-row')
      
      playerRows.forEach((row) => {
        const nameLink = row.querySelector('a[href*="/p"]')
        if (!nameLink) return
        
        const fullName = nameLink.textContent?.trim()
        if (!fullName) return
        
        const href = nameLink.getAttribute('href')
        const profileUrl = href ? `https://volleybox.net${href}` : ''
        
        // Extract jersey number
        const jerseyText = row.textContent?.match(/#(\d+)/)?.[1]
        const jerseyNumber = jerseyText ? parseInt(jerseyText) : undefined
        
        // Extract position
        const positionEl = row.querySelector('.position') || 
                          Array.from(row.querySelectorAll('td')).find(td => 
                            td.textContent?.match(/setter|opposite|outside|middle|libero/i)
                          )
        const position = positionEl?.textContent?.trim() || ''
        
        // Extract height
        const heightText = row.textContent?.match(/(\d{3})\s*cm/)?.[1]
        const height = heightText ? parseInt(heightText) : undefined
        
        // Extract nationality from flag or text
        const nationality = row.querySelector('img[alt]')?.getAttribute('alt') || 'Switzerland'
        
        // Extract birth year
        const birthYear = row.textContent?.match(/\b(19|20)\d{2}\b/)?.[0]
        
        players.push({
          fullName,
          profileUrl,
          jerseyNumber,
          position,
          height,
          nationality,
          birthYear
        })
      })
      
      return { teamName, players }
    })
    
    // Process players
    const processedPlayers: PlayerData[] = data.players.map((p: any) => {
      const { firstName, lastName } = parseName(p.fullName)
      return {
        name: p.fullName,
        firstName,
        lastName,
        jerseyNumber: p.jerseyNumber,
        position: mapPosition(p.position),
        height: p.height,
        dateOfBirth: p.birthYear ? `${p.birthYear}-01-01` : undefined,
        nationality: p.nationality,
        profileUrl: p.profileUrl
      }
    })
    
    console.log(`✅ Scraped ${data.teamName}: ${processedPlayers.length} players`)
    
    return {
      name: data.teamName,
      league: 'NLA',
      town: '',
      canton: 'ZH',
      players: processedPlayers
    }
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error)
    return null
  } finally {
    await browser.close()
  }
}

async function scrapeAllTeams() {
  console.log('🚀 Starting Puppeteer-based Volleybox scraper')
  console.log(`📊 Scraping ${TEAMS_TO_SCRAPE.length} teams\n`)
  
  const allTeams: TeamData[] = []
  
  for (const url of TEAMS_TO_SCRAPE) {
    const team = await scrapeTeamWithPuppeteer(url)
    if (team) {
      allTeams.push(team)
    }
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
  
  // Save results
  const outputDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const outputPath = path.join(outputDir, 'volleybox-players.json')
  fs.writeFileSync(outputPath, JSON.stringify(allTeams, null, 2))
  
  console.log(`\n✅ Scraping complete!`)
  console.log(`📦 Teams: ${allTeams.length}`)
  console.log(`👥 Players: ${allTeams.reduce((sum, t) => sum + t.players.length, 0)}`)
  console.log(`💾 Saved to: ${outputPath}`)
}

scrapeAllTeams().catch(console.error)
