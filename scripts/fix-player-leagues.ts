import { PrismaClient } from '@prisma/client';

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
    const leagueMap: Record<string, string> = {
      'NLA': 'NLA',
      'NLB': 'NLB',
      '1. Liga': 'FIRST_LEAGUE',
      '2. Liga': 'SECOND_LEAGUE',
      '3. Liga': 'THIRD_LEAGUE',
      '4. Liga': 'FOURTH_LEAGUE',
      'U23': 'U23',
      'U19': 'U19',
      'U17': 'U17',
    };

    let updatedCount = 0;

    for (const player of players) {
      if (player.clubHistory.length > 0) {
        const mostRecentClub = player.clubHistory[0];
        const leagueFromHistory = mostRecentClub.league;
        
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
