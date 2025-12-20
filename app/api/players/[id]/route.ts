import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { sendPlayerLookingNotification } from '@/lib/email';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        currentClub: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
            town: true,
          },
        },
        clubHistory: {
          orderBy: {
            startDate: 'desc',
          },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
        videos: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Spieler Nid Gfunde' },
        { status: 404 }
      );
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Fehler Bim Lade Vo Spieler-Date' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nid Aamäldet' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { playerData, clubHistory, achievements } = body;

    console.log('=== SAVE PLAYER DATA ===');
    console.log('Received clubHistory:', JSON.stringify(clubHistory, null, 2));
    console.log('Current clubs in request:', clubHistory?.filter((c: any) => c.currentClub === true));

    // Check if lookingForClub status is changing to true
    const existingPlayer = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const isNewlyLooking = playerData.lookingForClub === true && existingPlayer?.lookingForClub === false;

    // Find current club league from club history if available
    let currentLeague = playerData.currentLeague || undefined;
    if (clubHistory && clubHistory.length > 0) {
      const currentClubHistory = clubHistory.find((club: any) => club.currentClub === true);
      if (currentClubHistory && currentClubHistory.league) {
        currentLeague = currentClubHistory.league;
      }
    }
    // Ensure currentLeague is undefined if empty string or null
    if (!currentLeague || currentLeague === '') {
      currentLeague = undefined;
    }

    // Update user name to match player name
    await prisma.user.update({
      where: { id: existingPlayer.userId },
      data: {
        name: `${playerData.firstName} ${playerData.lastName}`
      }
    });

    // Update player
    const player = await prisma.player.update({
      where: { id: params.id },
      data: {
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        dateOfBirth: playerData.dateOfBirth ? new Date(playerData.dateOfBirth) : undefined,
        gender: playerData.gender,
        nationality: playerData.nationality,
        canton: playerData.canton,
        city: playerData.city,
        municipality: playerData.municipality,
        height: playerData.height ? parseFloat(playerData.height) : undefined,
        weight: playerData.weight ? parseFloat(playerData.weight) : undefined,
        spikeHeight: playerData.spikeHeight ? parseFloat(playerData.spikeHeight) : undefined,
        blockHeight: playerData.blockHeight ? parseFloat(playerData.blockHeight) : undefined,
        phone: playerData.phone,
        employmentStatus: playerData.employmentStatus,
        occupation: playerData.occupation,
        schoolName: playerData.schoolName,
        positions: playerData.positions || [],
        currentLeague: currentLeague,
        profileImage: playerData.profileImage,
        instagram: playerData.instagram,
        tiktok: playerData.tiktok,
        youtube: playerData.youtube,
        highlightVideo: playerData.highlightVideo,
        swissVolleyLicense: playerData.swissVolleyLicense,
        ausweiss: playerData.ausweiss,
        skillReceiving: playerData.skillReceiving,
        skillServing: playerData.skillServing,
        skillAttacking: playerData.skillAttacking,
        skillBlocking: playerData.skillBlocking,
        skillDefense: playerData.skillDefense,
        bio: playerData.bio,
        achievements: achievements || [],
        lookingForClub: playerData.lookingForClub,
        showEmail: playerData.showEmail !== undefined ? playerData.showEmail : undefined,
        showPhone: playerData.showPhone !== undefined ? playerData.showPhone : undefined,
      },
      include: {
        clubHistory: true,
        videos: true,
      },
    });

    // Update club history
    if (clubHistory) {
      // Fetch existing club history to preserve immutable fields like clubWebsiteUrl
      const existingClubHistory = await prisma.clubHistory.findMany({
        where: { playerId: params.id },
        select: { id: true, clubName: true, clubWebsiteUrl: true },
      });

      // Create a map of existing website URLs by club name
      const existingWebsiteUrls = new Map(
        existingClubHistory.map((club) => [club.clubName, club.clubWebsiteUrl])
      );

      // Delete existing club history
      await prisma.clubHistory.deleteMany({
        where: { playerId: params.id },
      });

      // Find current club ID from database if club exists
      let currentClubId: string | null = null;
      const currentClubEntry = clubHistory.find((club: any) => club.currentClub === true);
      
      if (currentClubEntry) {
        // Try to find the club in the database by name
        const clubInDb = await prisma.club.findFirst({
          where: {
            name: {
              equals: currentClubEntry.clubName,
              mode: 'insensitive'
            }
          }
        });
        
        if (clubInDb) {
          currentClubId = clubInDb.id;
        }
      }

      // Update player's currentClubId
      await prisma.player.update({
        where: { id: params.id },
        data: {
          currentClubId: currentClubId
        }
      });

      // Create new club history entries, preserving existing website URLs
      if (clubHistory.length > 0) {
        const clubHistoryData = await Promise.all(clubHistory.map(async (club: any) => {
          // Parse year from string, handling formats like "2023" or "2023-2024"
          const parseYear = (yearStr: string) => {
            if (!yearStr) return null;
            const match = yearStr.match(/(\d{4})/);
            return match ? parseInt(match[1], 10) : null;
          };

          const yearFrom = parseYear(club.yearFrom);
          const yearTo = parseYear(club.yearTo);

          // Try to find the club ID in database
          let clubId: string | null = null;
          const clubInDb = await prisma.club.findFirst({
            where: {
              name: {
                equals: club.clubName,
                mode: 'insensitive'
              }
            }
          });
          
          if (clubInDb) {
            clubId = clubInDb.id;
          }

          console.log('Processing club history entry:', {
            clubName: club.clubName,
            clubId,
            league: club.league,
            yearFrom,
            yearTo,
            currentClub: club.currentClub,
            currentClubType: typeof club.currentClub,
            rawYearFrom: club.yearFrom,
            rawYearTo: club.yearTo
          });

          return {
            playerId: params.id,
            clubId: clubId,
            clubName: club.clubName,
            clubLogo: club.logo || null,
            clubCountry: club.country || 'Switzerland',
            // Preserve existing website URL if it was already set, otherwise use new one
            clubWebsiteUrl: existingWebsiteUrls.get(club.clubName) || club.clubWebsiteUrl || null,
            league: club.league || null,
            startDate: yearFrom ? new Date(yearFrom, 0, 1) : new Date(),
            endDate: club.currentClub === true ? null : (yearTo ? new Date(yearTo, 11, 31) : null),
            currentClub: club.currentClub === true,
          };
        }));

        await prisma.clubHistory.createMany({
          data: clubHistoryData,
        });
      }
    }

    // Send notifications to recruiters if player is newly looking for club
    if (isNewlyLooking) {
      try {
        // Get all recruiters with notifications enabled
        const recruiters = await prisma.recruiter.findMany({
          include: {
            user: {
              select: {
                email: true,
                name: true,
                notifyPlayerLooking: true
              }
            }
          }
        });

        // Send notification to each recruiter who has notifications enabled
        const positionText = playerData.positions?.join(', ') || 'Unknown';
        const leagueText = existingPlayer?.currentLeague || 'N/A';

        for (const recruiter of recruiters) {
          if (recruiter.user.notifyPlayerLooking && recruiter.user.email) {
            await sendPlayerLookingNotification({
              recipientEmail: recruiter.user.email,
              recipientName: recruiter.user.name || recruiter.firstName + ' ' + recruiter.lastName,
              playerName: `${playerData.firstName} ${playerData.lastName}`,
              playerPosition: positionText,
              playerLeague: leagueText,
              playerId: params.id
            });
          }
        }
      } catch (emailError) {
        console.error('Error sending player looking notifications:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      player,
    });
  } catch (error) {
    console.error('===== ERROR UPDATING PLAYER =====');
    console.error('Error updating player:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });
    return NextResponse.json(
      { error: 'Fehler Bim Aktualisiere Vo Spieler-Date', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
