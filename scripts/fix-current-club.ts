import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCurrentClub() {
  try {
    console.log('Finding players without currentClubId...');
    
    // Find all players without a currentClubId
    const playersWithoutClub = await prisma.player.findMany({
      where: {
        currentClubId: null,
      },
      include: {
        clubHistory: {
          orderBy: {
            startDate: 'desc',
          },
          take: 1,
        },
      },
    });

    console.log(`Found ${playersWithoutClub.length} players without currentClubId`);

    for (const player of playersWithoutClub) {
      if (player.clubHistory.length > 0) {
        const mostRecentClub = player.clubHistory[0];
        
        console.log(`Updating player ${player.firstName} ${player.lastName} with club ${mostRecentClub.clubName}`);
        
        // Normalize club name (remove numbers and youth suffixes)
        const normalizeClubName = (name: string): string => {
          return name
            .replace(/\s+\d+$/, '') // Remove trailing numbers (e.g., " 2", " 3")
            .replace(/\s+[IVX]+$/, '') // Remove Roman numerals
            .replace(/\s+U\d{2}$/, '') // Remove youth team suffixes (U19, U20, etc.)
            .trim();
        };

        const normalizedName = normalizeClubName(mostRecentClub.clubName);
        
        // Find the club by normalized name
        const club = await prisma.club.findFirst({
          where: {
            name: normalizedName,
          },
        });

        if (club) {
          // Update player with currentClubId
          await prisma.player.update({
            where: { id: player.id },
            data: {
              currentClubId: club.id,
            },
          });
          
          console.log(`✓ Updated ${player.firstName} ${player.lastName} with club ${club.name} (ID: ${club.id})`);
        } else {
          console.log(`✗ Club not found for ${mostRecentClub.clubName} (normalized: ${normalizedName})`);
        }
      } else {
        console.log(`⊘ Player ${player.firstName} ${player.lastName} has no club history`);
      }
    }

    // Show summary of club player counts
    console.log('\n=== Club Player Counts ===');
    const clubs = await prisma.club.findMany({
      include: {
        _count: {
          select: {
            currentPlayers: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    clubs.forEach(club => {
      if (club._count.currentPlayers > 0) {
        console.log(`${club.name}: ${club._count.currentPlayers} player(s)`);
      }
    });

    console.log('\nDone!');
  } catch (error) {
    console.error('Error fixing current club:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCurrentClub();
