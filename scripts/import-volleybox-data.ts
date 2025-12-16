/**
 * Import Volleybox data into Prisma database
 * 
 * This script reads the scraped data and imports it into your database
 * 
 * Usage: npx ts-node scripts/import-volleybox-data.ts
 */

import { PrismaClient, Canton, League, Position } from '@prisma/client';
import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to map league strings to League enum
function mapLeague(leagueStr: string): League | undefined {
  const mapping: Record<string, League> = {
    'NLA': League.NLA,
    'NLB': League.NLB,
    '1. Liga': League.FIRST_LEAGUE,
    '2. Liga': League.SECOND_LEAGUE,
    '3. Liga': League.THIRD_LEAGUE,
    '4. Liga': League.FOURTH_LEAGUE,
  }
  return mapping[leagueStr]
}

// Helper to map position strings to Position enum
function mapPosition(posStr: string): Position {
  const normalized = posStr.toLowerCase().trim()
  if (normalized.includes('setter') || normalized.includes('zuspieler')) return Position.SETTER
  if (normalized.includes('outside') || normalized.includes('aussen')) return Position.OUTSIDE_HITTER
  if (normalized.includes('middle') || normalized.includes('mittel')) return Position.MIDDLE_BLOCKER
  if (normalized.includes('opposite') || normalized.includes('diagonal')) return Position.OPPOSITE
  if (normalized.includes('libero')) return Position.LIBERO
  return Position.UNIVERSAL
}

interface ImportPlayer {
  name: string
  firstName: string
  lastName: string
  jerseyNumber: number
  position: string
  height: number
  dateOfBirth: string
  nationality: string
  profileUrl: string
}

interface ImportTeam {
  name: string
  league: string
  season: string
  country: string
  town: string
  canton: string
  founded?: number
  website?: string
  profileUrl: string
  players: ImportPlayer[]
}

async function importData() {
  try {
    console.log('Starting import...')
    
    // Read scraped data
    const dataPath = path.join(__dirname, '../data/volleybox-teams.json')
    
    if (!fs.existsSync(dataPath)) {
      console.error('Error: volleybox-teams.json not found!')
      console.log('Please run: npx ts-node scripts/scrape-volleybox.ts first')
      return
    }
    
    const teamsData: ImportTeam[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    
    console.log(`Found ${teamsData.length} teams to import`)
    
    let totalPlayersImported = 0
    let totalClubsImported = 0
    
    for (const teamData of teamsData) {
      console.log(`\nImporting ${teamData.name}...`)
      
      // Create or update club
      const club = await prisma.club.upsert({
        where: { name: teamData.name },
        update: {
          canton: teamData.canton as Canton,
          town: teamData.town,
          website: teamData.website || null,
          description: `${teamData.name} from ${teamData.town}, founded ${teamData.founded || 'N/A'}`
        },
        create: {
          name: teamData.name,
          canton: teamData.canton as Canton,
          town: teamData.town,
          website: teamData.website || null,
          description: `${teamData.name} from ${teamData.town}, founded ${teamData.founded || 'N/A'}`
        }
      })
      
      totalClubsImported++
      console.log(`✓ Club: ${club.name}`)
      
      // Import players for this club
      for (const playerData of teamData.players) {
        try {
          // Check if player already exists by name
          const existingPlayer = await prisma.player.findFirst({
            where: {
              firstName: playerData.firstName,
              lastName: playerData.lastName
            }
          })
          
          if (existingPlayer) {
            // Update existing player
            const mappedLeague = mapLeague(teamData.league) || League.NLB
            await prisma.player.update({
              where: { id: existingPlayer.id },
              data: {
                height: playerData.height,
                positions: playerData.position ? [mapPosition(playerData.position)] : [],
                jerseyNumber: playerData.jerseyNumber,
                currentClubId: club.id,
                currentLeague: mappedLeague,
              }
            })
            console.log(`  ↻ Updated: ${playerData.name}`)
          } else {
            // Create new player with User account
            const mappedLeague = mapLeague(teamData.league) || League.NLB
            
            // Generate a unique email from player name
            const emailUsername = `${playerData.firstName}.${playerData.lastName}`.toLowerCase().replace(/[^a-z.]/g, '')
            const email = `${emailUsername}@volleybox-import.ch`
            
            // Check if user with this email already exists
            let user = await prisma.user.findUnique({
              where: { email }
            })
            
            if (!user) {
              // Create user account with default password
              const hashedPassword = await bcrypt.hash('ChangeMe123!', 10)
              user = await prisma.user.create({
                data: {
                  name: `${playerData.firstName} ${playerData.lastName}`,
                  email,
                  password: hashedPassword,
                  role: 'PLAYER',
                }
              })
            }
            
            // Create player linked to user
            await prisma.player.create({
              data: {
                userId: user.id,
                firstName: playerData.firstName,
                lastName: playerData.lastName,
                dateOfBirth: new Date(playerData.dateOfBirth),
                gender: 'MALE', // Adjust if scraping women's teams
                height: playerData.height,
                positions: playerData.position ? [mapPosition(playerData.position)] : [],
                jerseyNumber: playerData.jerseyNumber,
                canton: teamData.canton as Canton,
                city: teamData.town,
                currentClubId: club.id,
                currentLeague: mappedLeague,
                bio: `Professional volleyball player from ${playerData.nationality}`,
                profileImage: '/players/default.jpg',
              }
            })
            totalPlayersImported++
            console.log(`  + Created: ${playerData.name} (${email})`)
          }
        } catch (playerError) {
          console.error(`  ✗ Error importing ${playerData.name}:`, playerError)
        }
      }
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('Import Complete!')
    console.log(`✓ Clubs imported/updated: ${totalClubsImported}`)
    console.log(`✓ Players imported: ${totalPlayersImported}`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('Import error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run import
if (require.main === module) {
  importData()
}

export { importData }
