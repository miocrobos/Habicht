import { PrismaClient, League } from '@prisma/client'

const prisma = new PrismaClient()

async function syncAllPlayerLeagues() {
  try {
    console.log('🔄 Synchronizing all player leagues from club history...\n')

    // Get all players with their club history
    const players = await prisma.player.findMany({
      include: {
        clubHistory: {
          where: {
            currentClub: true
          },
          orderBy: {
            startDate: 'desc'
          },
          take: 1
        }
      }
    })

    console.log(`Found ${players.length} players to sync\n`)

    let updated = 0
    let skipped = 0

    // Map display league name to database enum value
    const leagueMap: Record<string, League> = {
      'NLA': 'NLA' as League,
      'NLB': 'NLB' as League,
      '1. Liga': 'FIRST_LEAGUE' as League,
      '2. Liga': 'SECOND_LEAGUE' as League,
      '3. Liga': 'THIRD_LEAGUE' as League,
      '4. Liga': 'FOURTH_LEAGUE' as League,
      '5. Liga': 'FIFTH_LEAGUE' as League,
      'U23': 'YOUTH_U23' as League,
      'U19': 'YOUTH_U19' as League,
      'U17': 'YOUTH_U17' as League,
    }

    for (const player of players) {
      const currentClubHistory = player.clubHistory[0]
      
      if (currentClubHistory && currentClubHistory.league) {
        // Map the league string to the enum value
        const leagueString = currentClubHistory.league
        const leagueFromHistory = leagueMap[leagueString] || leagueString as League
        
        // Only update if different from current league
        if (player.currentLeague !== leagueFromHistory) {
          await prisma.player.update({
            where: { id: player.id },
            data: { currentLeague: leagueFromHistory }
          })
          
          console.log(`✓ Updated ${player.firstName} ${player.lastName}`)
          console.log(`  Old League: ${player.currentLeague || 'None'}`)
          console.log(`  New League: ${leagueFromHistory}`)
          console.log(`  Club: ${currentClubHistory.clubName}\n`)
          updated++
        } else {
          skipped++
        }
      } else {
        skipped++
      }
    }

    console.log('\n✅ Synchronization Complete!')
    console.log(`   Updated: ${updated} players`)
    console.log(`   Skipped: ${skipped} players (already correct or no current club)`)
    
  } catch (error) {
    console.error('Error syncing player leagues:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncAllPlayerLeagues()
