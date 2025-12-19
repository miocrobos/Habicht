import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { sendPlayerLookingNotification } from '@/lib/email';

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
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nid Aamäldet' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { playerData, clubHistory, achievements } = body;

    // Check if lookingForClub status is changing to true
    const existingPlayer = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    });

    const isNewlyLooking = playerData.lookingForClub === true && existingPlayer?.lookingForClub === false;

    // Find current club league from club history if available
    let currentLeague = playerData.currentLeague;
    if (clubHistory && clubHistory.length > 0) {
      const currentClubHistory = clubHistory.find((club: any) => club.currentClub === true);
      if (currentClubHistory && currentClubHistory.league) {
        currentLeague = currentClubHistory.league;
      }
    }

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

      // Create new club history entries, preserving existing website URLs
      if (clubHistory.length > 0) {
        await prisma.clubHistory.createMany({
          data: clubHistory.map((club: any) => ({
            playerId: params.id,
            clubName: club.clubName,
            clubLogo: club.logo || null,
            clubCountry: club.country || 'Switzerland',
            // Preserve existing website URL if it was already set, otherwise use new one
            clubWebsiteUrl: existingWebsiteUrls.get(club.clubName) || club.clubWebsiteUrl || null,
            league: club.league || null,
            startDate: club.yearFrom ? new Date(club.yearFrom, 0, 1) : new Date(),
            endDate: club.currentClub ? null : (club.yearTo ? new Date(club.yearTo, 11, 31) : null),
            currentClub: club.currentClub || false,
          })),
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
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: 'Fehler Bim Aktualisiere Vo Spieler-Date' },
      { status: 500 }
    );
  }
}
