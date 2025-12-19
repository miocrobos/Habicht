import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Admin-only endpoint to sync current clubs for all players
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Only allow admin users to run this sync
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting club sync via API...');

    // Get all players with their club history
    const players = await prisma.player.findMany({
      include: {
        clubHistory: {
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    });

    let playersUpdated = 0;
    let playersCleared = 0;
    let playersSkipped = 0;
    let clubsNotFound = 0;
    let historyLinksUpdated = 0;

    for (const player of players) {
      // Find current club in history
      const currentClubHistory = player.clubHistory.find(ch => ch.currentClub === true);
      
      if (!currentClubHistory) {
        // Clear currentClubId if no current club in history
        if (player.currentClubId) {
          await prisma.player.update({
            where: { id: player.id },
            data: { currentClubId: null }
          });
          playersCleared++;
        } else {
          playersSkipped++;
        }
      } else {
        // Process current club
        const club = await prisma.club.findFirst({
          where: {
            name: {
              equals: currentClubHistory.clubName || '',
              mode: 'insensitive'
            }
          }
        });

        if (!club) {
          clubsNotFound++;
          
          // Clear currentClubId if club not found in database
          if (player.currentClubId) {
            await prisma.player.update({
              where: { id: player.id },
              data: { currentClubId: null }
            });
          }
        } else {
          // Update player's currentClubId if different
          if (player.currentClubId !== club.id) {
            await prisma.player.update({
              where: { id: player.id },
              data: { currentClubId: club.id }
            });
          }

          // Update current club history entry with clubId if not set
          if (currentClubHistory.clubId !== club.id) {
            await prisma.clubHistory.update({
              where: { id: currentClubHistory.id },
              data: { clubId: club.id }
            });
            historyLinksUpdated++;
          }

          playersUpdated++;
        }
      }

      // Update ALL club history entries (not just current) to link them to clubs in DB
      for (const history of player.clubHistory) {
        if (!history.clubId && history.clubName) {
          const club = await prisma.club.findFirst({
            where: {
              name: {
                equals: history.clubName,
                mode: 'insensitive'
              }
            }
          });

          if (club && history.clubId !== club.id) {
            await prisma.clubHistory.update({
              where: { id: history.id },
              data: { clubId: club.id }
            });
            historyLinksUpdated++;
          }
        }
      }
    }

    const summary = {
      totalPlayers: players.length,
      playersUpdated,
      playersCleared,
      playersSkipped,
      historyLinksUpdated,
      clubsNotFound,
      success: true
    };

    console.log('✨ Club sync complete:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Error syncing clubs:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}
