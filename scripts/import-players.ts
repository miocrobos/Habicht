/**
 * Import scraped player data into database
 */

import { PrismaClient, Position, Gender, Canton, League } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ScrapedPlayer {
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

interface ScrapedTeam {
  name: string
  league: string
  town: string
  canton: string
  players: ScrapedPlayer[]
}

// Map position strings to enum
function mapPosition(pos: string): Position {
  const normalized = pos.toUpperCase()
  if (normalized.includes('SETTER')) return 'SETTER'
  if (normalized.includes('OPPOSITE')) return 'OPPOSITE'
  if (normalized.includes('OUTSIDE')) return 'OUTSIDE_HITTER'
  if (normalized.includes('MIDDLE')) return 'MIDDLE_BLOCKER'
  if (normalized.includes('LIBERO')) return 'LIBERO'
  return 'OUTSIDE_HITTER'
}

// Map league strings to enum
function mapLeague(league: string): League {
  if (league.includes('NLA')) return 'NLA'
  if (league.includes('NLB')) return 'NLB'
  if (league.includes('1') || league.includes('FIRST')) return 'FIRST_LEAGUE'
  if (league.includes('2') || league.includes('SECOND')) return 'SECOND_LEAGUE'
  return 'FIRST_LEAGUE'
}

// Map canton codes
function mapCanton(canton: string): Canton {
  const cantonMap: Record<string, Canton> = {
    'ZH': 'ZH', 'BE': 'BE', 'LU': 'LU', 'UR': 'UR', 'SZ': 'SZ',
    'OW': 'OW', 'NW': 'NW', 'GL': 'GL', 'ZG': 'ZG', 'FR': 'FR',
    'SO': 'SO', 'BS': 'BS', 'BL': 'BL', 'SH': 'SH', 'AR': 'AR',
    'AI': 'AI', 'SG': 'SG', 'GR': 'GR', 'AG': 'AG', 'TG': 'TG',
    'TI': 'TI', 'VD': 'VD', 'VS': 'VS', 'NE': 'NE', 'GE': 'GE', 'JU': 'JU'
  }
  return cantonMap[canton] || 'ZH'
}

async function importPlayers() {
  const dataPath = path.join(process.cwd(), 'data', 'volleybox-players.json')
  
  if (!fs.existsSync(dataPath)) {
    console.log('❌ No data file found. Run scraper first.')
    return
  }
  
  const teams: ScrapedTeam[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  console.log(`📦 Importing ${teams.length} teams\n`)
  
  let playersAdded = 0
  let playersSkipped = 0
  
  for (const team of teams) {
    console.log(`\n⚽ Processing: ${team.name}`)
    
    // Find club in database
    const club = await prisma.club.findFirst({
      where: { name: { contains: team.name.split(' ')[0] } }
    })
    
    if (!club) {
      console.log(`  ⚠️  Club not found in database, skipping`)
      continue
    }
    
    console.log(`  ✓ Matched to club: ${club.name}`)
    
    for (const player of team.players) {
      try {
        // Check if player exists
        const existing = await prisma.player.findFirst({
          where: {
            firstName: player.firstName,
            lastName: player.lastName,
            dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : undefined
          }
        })
        
        if (existing) {
          console.log(`    ⏭️  Skipped: ${player.name} (already exists)`)
          playersSkipped++
          continue
        }
        
        // Create user first
        const user = await prisma.user.create({
          data: {
            email: `${player.firstName.toLowerCase()}.${player.lastName.toLowerCase()}@temp.volleyball.ch`,
            password: 'temp_password_' + Math.random().toString(36),
            name: player.name,
            role: 'PLAYER'
          }
        })
        
        // Create player profile
        await prisma.player.create({
          data: {
            userId: user.id,
            firstName: player.firstName,
            lastName: player.lastName,
            dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : new Date('2000-01-01'),
            gender: 'MALE', // Default, update manually
            height: player.height || 180,
            blockReach: null, // To be filled by player
            spikeReach: null, // To be filled by player
            nationality: player.nationality,
            canton: mapCanton(team.canton),
            city: team.town || 'Zürich',
            positions: [mapPosition(player.position)], // Changed from position to positions array
            jerseyNumber: player.jerseyNumber,
            currentClubId: club.id,
            currentLeagues: [mapLeague(team.league)],
            profileImage: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name),
            isActive: true,
            lookingForClub: false,
            isPlaceholder: true, // Mark as placeholder from Volleybox
            achievements: [
              `Player at ${club.name}`,
              `Competing in ${team.league}`
            ],
            bio: `⚠️ PLACEHOLDER PROFILE - Imported from Volleybox.net\n\nThis profile was automatically created from public volleyball data. If this is your profile, please register and claim it to update your information.\n\nCurrent team: ${club.name}\nLeague: ${team.league}`
          }
        })
        
        console.log(`    ✅ Added: ${player.name} (#${player.jerseyNumber || 'N/A'})`)
        playersAdded++
        
      } catch (error: any) {
        console.log(`    ❌ Error adding ${player.name}: ${error.message}`)
      }
    }
  }
  
  console.log(`\n\n📊 Import Summary:`)
  console.log(`  ✅ Players added: ${playersAdded}`)
  console.log(`  ⏭️  Players skipped: ${playersSkipped}`)
  console.log(`  📦 Teams processed: ${teams.length}`)
}

importPlayers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
