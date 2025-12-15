import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

interface PlayerData {
  firstName: string
  lastName: string
  position: string
  jerseyNumber?: number
  height?: number
  dateOfBirth?: string
}

interface TeamData {
  teamName: string
  url: string
  players: PlayerData[]
}

const teams = [
  { name: 'Chenois Genève VB', url: 'https://volleybox.net/chenois-geneve-vb-t1415/players', gender: 'MALE', league: 'NLA' },
  { name: 'Colombier Volley', url: 'https://volleybox.net/colombier-volley-t4040/players', gender: 'MALE', league: 'NLA' },
  { name: 'Lausanne UC', url: 'https://volleybox.net/lausanne-uc-t1414/players', gender: 'MALE', league: 'NLA' },
  { name: 'STV St. Gallen', url: 'https://volleybox.net/stv-st-gallen-t5054/players', gender: 'MALE', league: 'NLA' },
  { name: 'Volley Schönenwerd', url: 'https://volleybox.net/volley-schonenwerd-t4042/players', gender: 'MALE', league: 'NLA' },
  { name: 'Volley Amriswil', url: 'https://volleybox.net/volley-amriswil-t2532/players', gender: 'FEMALE', league: 'NLA' },
  { name: "Sm'Aesch Pfeffingen", url: 'https://volleybox.net/sm-aesch-pfeffingen-t2533/players', gender: 'FEMALE', league: 'NLA' },
  { name: 'VFM', url: 'https://volleybox.net/vfm-t2534/players', gender: 'FEMALE', league: 'NLA' },
  { name: 'Volley Luzern', url: 'https://volleybox.net/volley-luzern-t2536/players', gender: 'FEMALE', league: 'NLA' },
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

async function scrapeTeamWithPlaywright(teamInfo: typeof teams[0]): Promise<TeamData | null> {
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000 
  })

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    })
    
    const page = await context.newPage()
    
    console.log(`🌐 Loading: ${teamInfo.url}`)
    await page.goto(teamInfo.url, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait a bit for dynamic content
    await page.waitForTimeout(2000)
    
    // Debug: Save screenshot and HTML
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    
    await page.screenshot({ path: path.join(dataDir, 'debug-page.png'), fullPage: true })
    const html = await page.content()
    fs.writeFileSync(path.join(dataDir, 'debug-page.html'), html)
    console.log('📸 Saved screenshot and HTML for debugging')
    
    // Try multiple selector patterns
    const selectors = [
      '.team-roster table tbody tr',
      '.players-list .player-item',
      'table.players tbody tr',
      '.roster-table tbody tr',
      '[class*="player"] [class*="row"]'
    ]
    
    let playerRows = []
    for (const selector of selectors) {
      playerRows = await page.locator(selector).all()
      if (playerRows.length > 0) {
        console.log(`✅ Found ${playerRows.length} players with selector: ${selector}`)
        break
      }
    }
    
    if (playerRows.length === 0) {
      console.log('❌ No players found with any selector')
      await context.close()
      await browser.close()
      return null
    }
    
    const players: PlayerData[] = []
    
    for (const row of playerRows) {
      try {
        const cells = await row.locator('td, .cell').all()
        if (cells.length < 2) continue
        
        // Extract text from cells
        const cellTexts = await Promise.all(cells.map(cell => cell.innerText()))
        
        // Try to find name, position, number, height
        const nameText = cellTexts.find(t => t && /[a-zA-Z]/.test(t) && t.length > 2)
        const numberText = cellTexts.find(t => /^\d{1,3}$/.test(t))
        const positionText = cellTexts.find(t => t && /setter|outside|middle|opposite|libero|hitter|blocker/i.test(t))
        const heightText = cellTexts.find(t => /^\d{3}$/.test(t)) // Height is 3 digits like 195
        
        if (!nameText) continue
        
        const { firstName, lastName } = parseName(nameText)
        const position = positionText ? mapPosition(positionText) : 'OUTSIDE_HITTER'
        const jerseyNumber = numberText ? parseInt(numberText) : undefined
        const height = heightText ? parseInt(heightText) : undefined
        
        players.push({
          firstName,
          lastName,
          position,
          jerseyNumber,
          height
        })
      } catch (err) {
        console.log(`⚠️ Error parsing player row: ${err}`)
      }
    }
    
    console.log(`✅ Scraped ${players.length} players from ${teamInfo.name}`)
    
    await context.close()
    await browser.close()
    
    return {
      teamName: teamInfo.name,
      url: teamInfo.url,
      players
    }
    
  } catch (error) {
    console.error(`❌ Error scraping ${teamInfo.url}:`, error)
    await browser.close()
    return null
  }
}

async function scrapeAllTeams() {
  console.log('🚀 Starting Playwright-based Volleybox scraper')
  console.log(`📊 Scraping ${teams.length} teams\n`)
  
  const results: TeamData[] = []
  
  // Scrape first team only for debugging
  const teamData = await scrapeTeamWithPlaywright(teams[0])
  if (teamData) {
    results.push(teamData)
  }
  
  // Save results
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  const outputPath = path.join(dataDir, 'volleybox-players.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  
  console.log(`\n✅ Scraping complete!`)
  console.log(`📁 Saved to: ${outputPath}`)
  console.log(`📊 Total teams: ${results.length}`)
  console.log(`👥 Total players: ${results.reduce((sum, team) => sum + team.players.length, 0)}`)
}

scrapeAllTeams().catch(console.error)
