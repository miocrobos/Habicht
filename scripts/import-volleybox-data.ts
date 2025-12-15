/**
 * Import Volleybox data into Prisma database
 * 
 * This script reads the scraped data and imports it into your database
 * 
 * Usage: npx ts-node scripts/import-volleybox-data.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

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
          league: teamData.league,
          canton: teamData.canton,
          websiteUrl: teamData.website || null,
          description: `${teamData.name} from ${teamData.town}, founded ${teamData.founded || 'N/A'}`
        },
        create: {
          name: teamData.name,
          league: teamData.league,
          canton: teamData.canton,
          websiteUrl: teamData.website || null,
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
            await prisma.player.update({
              where: { id: existingPlayer.id },
              data: {
                height: playerData.height,
                position: playerData.position,
                jerseyNumber: playerData.jerseyNumber,
                currentClubId: club.id,
                currentLeague: teamData.league,
              }
            })
            console.log(`  ↻ Updated: ${playerData.name}`)
          } else {
            // Create new player
            await prisma.player.create({
              data: {
                firstName: playerData.firstName,
                lastName: playerData.lastName,
                dateOfBirth: new Date(playerData.dateOfBirth),
                gender: 'MALE', // Adjust if scraping women's teams
                height: playerData.height,
                position: playerData.position,
                jerseyNumber: playerData.jerseyNumber,
                canton: teamData.canton,
                city: teamData.town,
                currentClubId: club.id,
                currentLeague: teamData.league,
                bio: `Professional volleyball player from ${playerData.nationality}`,
                profileImage: '/players/default.jpg',
                // You may need to create a user account first for authentication
              }
            })
            totalPlayersImported++
            console.log(`  + Created: ${playerData.name}`)
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
