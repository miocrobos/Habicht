import { PrismaClient, League } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPlayerLeagues() {
  try {
    console.log('Updating player leagues based on their most recent club history...');
    
    // Get all players with club history
    const players = await prisma.player.findMany({
      include: {
        clubHistory: {
          orderBy: {
            startDate: 'desc',
          },
          take: 1,
        },
      },
    });

    console.log(`Found ${players.length} players to check`);

    // Map display league name to database enum value
    const leagueMap: Record<string, League> = {
      'NLA': League.NLA,
      'NLB': League.NLB,
      '1. Liga': League.FIRST_LEAGUE,
      '2. Liga': League.SECOND_LEAGUE,
      '3. Liga': League.THIRD_LEAGUE,
      '4. Liga': League.FOURTH_LEAGUE,
      '5. Liga': League.FIFTH_LEAGUE,
      'U23': League.YOUTH_U23,
      'U20': League.YOUTH_U20,
      'U18': League.YOUTH_U18,
    };

    let updatedCount = 0;

    for (const player of players) {
      if (player.clubHistory.length > 0) {
        const mostRecentClub = player.clubHistory[0];
        const leagueFromHistory = mostRecentClub.league;
        
        if (!leagueFromHistory) {
          continue; // Skip if no league data
        }
        
        // Map the league to the enum value
        const mappedLeague = leagueMap[leagueFromHistory];
        
        if (mappedLeague && mappedLeague !== player.currentLeague) {
          console.log(`Updating ${player.firstName} ${player.lastName}: ${player.currentLeague || 'null'} → ${mappedLeague} (${leagueFromHistory})`);
          
          await prisma.player.update({
            where: { id: player.id },
            data: {
              currentLeague: mappedLeague,
            },
          });
          
          updatedCount++;
        }
      }
    }

    console.log(`\n✓ Updated ${updatedCount} players' leagues`);
    console.log('\nDone!');
  } catch (error) {
    console.error('Error fixing player leagues:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPlayerLeagues();
