import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixInvalidLeagues() {
  try {
    console.log('🔧 Fixing players with leagues but no valid club history...\n')

    // Get all players
    const players = await prisma.player.findMany({
      include: {
        currentClub: true,
        clubHistory: {
          where: {
            OR: [
              { currentClub: true },
              { endDate: null }
            ]
          }
        }
      }
    })

    console.log(`Found ${players.length} total players\n`)

    let updatedCount = 0

    for (const player of players) {
      // Check if player has a league but no current club or valid club history
      const hasLeagues = player.currentLeagues && player.currentLeagues.length > 0;
      if (hasLeagues && !player.currentClub && player.clubHistory.length === 0) {
        console.log(`❌ ${player.firstName} ${player.lastName} - League: ${player.currentLeagues.join(', ')}, No current club or history`)
        
        // Clear the leagues
        await prisma.player.update({
          where: { id: player.id },
          data: {
            currentLeagues: []
          }
        })
        
        updatedCount++
        console.log(`   ✅ Cleared leagues\n`)
      } else {
        console.log(`✓ ${player.firstName} ${player.lastName} - Valid (has ${player.currentClub ? 'current club' : 'club history'})`)
      }
    }

    console.log(`\n✅ Fixed ${updatedCount} players`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixInvalidLeagues()
