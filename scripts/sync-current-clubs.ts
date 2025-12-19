import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncCurrentClubs() {
  console.log('🔄 Syncing current clubs for all players...\n');

  try {
    // Get all players
    const players = await prisma.player.findMany({
      include: {
        clubHistory: {
          where: {
            currentClub: true
          },
          take: 1
        }
      }
    });

    console.log(`Found ${players.length} players to check\n`);

    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const player of players) {
      // Check if player has a current club in their history
      if (player.clubHistory.length === 0) {
        skipped++;
        continue;
      }

      const currentClubHistory = player.clubHistory[0];
      
      // Try to find the club in the database
      const club = await prisma.club.findFirst({
        where: {
          name: {
            equals: currentClubHistory.clubName || '',
            mode: 'insensitive'
          }
        }
      });

      if (!club) {
        console.log(`⚠️  Club not found: ${currentClubHistory.clubName} for player ${player.firstName} ${player.lastName}`);
        notFound++;
        
        // Update player to clear currentClubId if no club found
        await prisma.player.update({
          where: { id: player.id },
          data: { currentClubId: null }
        });
        continue;
      }

      // Update player's currentClubId
      await prisma.player.update({
        where: { id: player.id },
        data: { currentClubId: club.id }
      });

      // Update clubHistory entry with clubId
      await prisma.clubHistory.update({
        where: { id: currentClubHistory.id },
        data: { clubId: club.id }
      });

      console.log(`✅ Updated ${player.firstName} ${player.lastName} -> ${club.name}`);
      updated++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped (no current club): ${skipped}`);
    console.log(`⚠️  Not found in DB: ${notFound}`);

  } catch (error) {
    console.error('Error syncing current clubs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncCurrentClubs();
