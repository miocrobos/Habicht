/**
 * volleyball.ch API integration
 * Fetches player and team data from official Swiss Volley website
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

interface VolleyballChTeam {
  id: string
  name: string
  league: string
  group?: string
  players?: VolleyballChPlayer[]
}

interface VolleyballChPlayer {
  name: string
  number?: number
  position?: string
}

interface Match {
  homeTeam: string
  awayTeam: string
  date: string
  score?: string
}

// volleyball.ch uses different league IDs
const LEAGUE_IDS = {
  NLA_WOMEN: '6608',
  NLA_MEN: '6609',
  NLB_WOMEN: '6610',
  NLB_MEN: '6611',
  FIRST_LIGA_WOMEN: '6610', // 1L uses same structure
  FIRST_LIGA_MEN: '6612',
}

async function fetchLeagueTeams(leagueId: string, gender: 'f' | 'm'): Promise<VolleyballChTeam[]> {
  try {
    const url = `https://www.volleyball.ch/de/game-center?gender=${gender}&i_region=SV&i_league=${leagueId}`
    console.log(`📡 Fetching teams from: ${url}`)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const teams: VolleyballChTeam[] = []
    
    // Extract team names from the page
    $('a[href*="/game-center/club/"]').each((_, el) => {
      const teamName = $(el).text().trim()
      const href = $(el).attr('href') || ''
      const teamId = href.match(/club\/(\d+)/)?.[1] || ''
      
      if (teamName && teamId && !teams.find(t => t.id === teamId)) {
        teams.push({
          id: teamId,
          name: teamName,
          league: leagueId
        })
      }
    })
    
    console.log(`✅ Found ${teams.length} teams`)
    return teams
    
  } catch (error) {
    console.error(`❌ Error fetching league ${leagueId}:`, error)
    return []
  }
}

async function fetchTeamPlayers(teamId: string, teamName: string): Promise<VolleyballChPlayer[]> {
  try {
    const url = `https://www.volleyball.ch/de/game-center/club/${teamId}/team/`
    console.log(`  📋 Fetching roster for: ${teamName}`)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const players: VolleyballChPlayer[] = []
    
    // Look for player roster table
    $('table tr, .player-row').each((_, el) => {
      const $row = $(el)
      const name = $row.find('td, .name').first().text().trim()
      const numberText = $row.text().match(/#(\d+)/)?.[1]
      const position = $row.find('.position').text().trim()
      
      if (name && name.length > 2) {
        players.push({
          name,
          number: numberText ? parseInt(numberText) : undefined,
          position: position || undefined
        })
      }
    })
    
    console.log(`    ✓ ${players.length} players found`)
    return players
    
  } catch (error) {
    console.log(`    ⚠️  Could not fetch roster for ${teamName}`)
    return []
  }
}

async function fetchScheduleForDiscovery(): Promise<string[]> {
  try {
    console.log(`\n🔍 Discovering teams from match schedules...`)
    const url = 'https://www.volleyball.ch/de/game-center'
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    const teams = new Set<string>()
    
    // Extract team names from match schedule
    $('.game, .match').each((_, el) => {
      const $match = $(el)
      const homeTeam = $match.find('.home-team, .team-home').text().trim()
      const awayTeam = $match.find('.away-team, .team-away').text().trim()
      
      if (homeTeam) teams.add(homeTeam)
      if (awayTeam) teams.add(awayTeam)
    })
    
    const teamList = Array.from(teams)
    console.log(`✅ Discovered ${teamList.length} unique teams from schedules`)
    return teamList
    
  } catch (error) {
    console.error(`❌ Error fetching schedule:`, error)
    return []
  }
}

async function scrapeVolleyballCh() {
  console.log('🇨🇭 Starting volleyball.ch integration\n')
  
  const allTeams: VolleyballChTeam[] = []
  
  // Fetch NLA Women
  console.log('\n=== NLA Women ===')
  const nlaWomen = await fetchLeagueTeams(LEAGUE_IDS.NLA_WOMEN, 'f')
  allTeams.push(...nlaWomen)
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Fetch NLA Men
  console.log('\n=== NLA Men ===')
  const nlaMen = await fetchLeagueTeams(LEAGUE_IDS.NLA_MEN, 'm')
  allTeams.push(...nlaMen)
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Fetch 1st Liga Women
  console.log('\n=== 1st Liga Women ===')
  const firstLigaWomen = await fetchLeagueTeams(LEAGUE_IDS.FIRST_LIGA_WOMEN, 'f')
  allTeams.push(...firstLigaWomen)
  
  // Discover teams from schedules
  const discoveredTeams = await fetchScheduleForDiscovery()
  
  // Fetch player rosters for each team (sample first 5 to avoid rate limiting)
  console.log('\n\n📋 Fetching player rosters (sampling first 5 teams)...')
  for (let i = 0; i < Math.min(5, allTeams.length); i++) {
    const team = allTeams[i]
    const players = await fetchTeamPlayers(team.id, team.name)
    team.players = players
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  // Save results
  const outputDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const teamsPath = path.join(outputDir, 'volleyball-ch-teams.json')
  const discoveredPath = path.join(outputDir, 'volleyball-ch-discovered.json')
  
  fs.writeFileSync(teamsPath, JSON.stringify(allTeams, null, 2))
  fs.writeFileSync(discoveredPath, JSON.stringify(discoveredTeams, null, 2))
  
  console.log(`\n\n✅ volleyball.ch scraping complete!`)
  console.log(`📦 Teams: ${allTeams.length}`)
  console.log(`🔍 Discovered: ${discoveredTeams.length}`)
  console.log(`💾 Saved to:`)
  console.log(`   - ${teamsPath}`)
  console.log(`   - ${discoveredPath}`)
}

scrapeVolleyballCh().catch(console.error)
