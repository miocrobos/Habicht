import { PrismaClient, League, Gender } from '@prisma/client'

const prisma = new PrismaClient()

async function syncClubLeagues() {
  console.log('🔄 Syncing club league flags based on current players...\n')

  try {
    // Get all clubs with their current players
    const clubs = await prisma.club.findMany({
      include: {
        currentPlayers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentLeague: true,
            gender: true,
          }
        }
      }
    })

    for (const club of clubs) {
      console.log(`\n📍 ${club.name} (${club.town})`)
      console.log(`   Current players: ${club.currentPlayers.length}`)

      // Reset all league flags
      const updates: any = {
        hasNLAMen: false,
        hasNLAWomen: false,
        hasNLBMen: false,
        hasNLBWomen: false,
        has1LigaMen: false,
        has1LigaWomen: false,
        has2LigaMen: false,
        has2LigaWomen: false,
        has3LigaMen: false,
        has3LigaWomen: false,
        has4LigaMen: false,
        has4LigaWomen: false,
        hasU23Men: false,
        hasU23Women: false,
        hasU19Men: false,
        hasU19Women: false,
        hasU17Men: false,
        hasU17Women: false,
      }

      // Set flags based on current players
      const leagues = new Set<string>()
      
      for (const player of club.currentPlayers) {
        const isMale = player.gender === 'MALE'
        const leagueKey = `${player.currentLeague}_${isMale ? 'MEN' : 'WOMEN'}`
        leagues.add(leagueKey)

        // Map league and gender to boolean field
        switch (player.currentLeague) {
          case 'NLA':
            if (isMale) updates.hasNLAMen = true
            else updates.hasNLAWomen = true
            break
          case 'NLB':
            if (isMale) updates.hasNLBMen = true
            else updates.hasNLBWomen = true
            break
          case 'FIRST_LEAGUE':
            if (isMale) updates.has1LigaMen = true
            else updates.has1LigaWomen = true
            break
          case 'SECOND_LEAGUE':
            if (isMale) updates.has2LigaMen = true
            else updates.has2LigaWomen = true
            break
          case 'THIRD_LEAGUE':
            if (isMale) updates.has3LigaMen = true
            else updates.has3LigaWomen = true
            break
          case 'FOURTH_LEAGUE':
            if (isMale) updates.has4LigaMen = true
            else updates.has4LigaWomen = true
            break
          case 'YOUTH_U23':
            if (isMale) updates.hasU23Men = true
            else updates.hasU23Women = true
            break
          case 'YOUTH_U19':
            if (isMale) updates.hasU19Men = true
            else updates.hasU19Women = true
            break
          case 'YOUTH_U17':
            if (isMale) updates.hasU17Men = true
            else updates.hasU17Women = true
            break
        }
      }

      if (leagues.size > 0) {
        console.log(`   Leagues found: ${Array.from(leagues).join(', ')}`)
        
        // Update club
        await prisma.club.update({
          where: { id: club.id },
          data: updates
        })
        
        console.log(`   ✅ Updated league flags`)
      } else {
        console.log(`   ⚠️  No players with leagues`)
      }
    }

    console.log('\n✅ Sync complete!')
  } catch (error) {
    console.error('Error syncing club leagues:', error)
  } finally {
    await prisma.$disconnect()
  }
}

syncClubLeagues()
