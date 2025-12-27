import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { sendPlayerLookingNotification, sendWatchlistUpdateNotification } from '@/lib/email';
import { authOptions } from '@/lib/auth';

// Convert display league names to enum values with fault tolerance
function convertLeagueToEnum(league: string | null | undefined): string | undefined {
  if (!league || league === '') return undefined;
  
  // Normalize input: trim, uppercase, remove extra spaces and dots
  const normalized = league.trim().toUpperCase().replace(/\s+/g, ' ').replace(/\.$/, '');
  
  // Try direct match first
  const leagueMap: { [key: string]: string } = {
    'NLA': 'NLA',
    'NL A': 'NLA',
    'NATIONAL LIGA A': 'NLA',
    'NLB': 'NLB',
    'NL B': 'NLB',
    'NATIONAL LIGA B': 'NLB',
    '1. LIGA': 'FIRST_LEAGUE',
    '1 LIGA': 'FIRST_LEAGUE',
    'ERSTE LIGA': 'FIRST_LEAGUE',
    '2. LIGA': 'SECOND_LEAGUE',
    '2 LIGA': 'SECOND_LEAGUE',
    'ZWEITE LIGA': 'SECOND_LEAGUE',
    '3. LIGA': 'THIRD_LEAGUE',
    '3 LIGA': 'THIRD_LEAGUE',
    'DRITTE LIGA': 'THIRD_LEAGUE',
    '4. LIGA': 'FOURTH_LEAGUE',
    '4 LIGA': 'FOURTH_LEAGUE',
    'VIERTE LIGA': 'FOURTH_LEAGUE',
    '5. LIGA': 'FIFTH_LEAGUE',
    '5 LIGA': 'FIFTH_LEAGUE',
    'FÜNFTE LIGA': 'FIFTH_LEAGUE',
    'U19 ELITE': 'U19_ELITE',
    'U-19 ELITE': 'U19_ELITE',
    'U17 ELITE': 'U17_ELITE',
    'U-17 ELITE': 'U17_ELITE',
    'U15 ELITE': 'U15_ELITE',
    'U-15 ELITE': 'U15_ELITE',
    'U19': 'U19',
    'U-19': 'U19',
    'U17': 'U17',
    'U-17': 'U17',
    'U15': 'U15',
    'U-15': 'U15',
    'U13': 'U13',
    'U-13': 'U13'
  };
  
  const mapped = leagueMap[normalized];
  if (mapped) return mapped;
  
  // Try pattern matching for common variations
  if (normalized.match(/^(NL\s*A|NATIONAL.*A)/)) return 'NLA';
  if (normalized.match(/^(NL\s*B|NATIONAL.*B)/)) return 'NLB';
  if (normalized.match(/^1[\.\s]*(LIGA|LIG)/)) return 'FIRST_LEAGUE';
  if (normalized.match(/^2[\.\s]*(LIGA|LIG)/)) return 'SECOND_LEAGUE';
  if (normalized.match(/^3[\.\s]*(LIGA|LIG)/)) return 'THIRD_LEAGUE';
  if (normalized.match(/^4[\.\s]*(LIGA|LIG)/)) return 'FOURTH_LEAGUE';
  if (normalized.match(/^5[\.\s]*(LIGA|LIG)/)) return 'FIFTH_LEAGUE';
  if (normalized.match(/^U[-\s]*19.*ELITE/)) return 'U19_ELITE';
  if (normalized.match(/^U[-\s]*17.*ELITE/)) return 'U17_ELITE';
  if (normalized.match(/^U[-\s]*15.*ELITE/)) return 'U15_ELITE';
  if (normalized.match(/^U[-\s]*19/)) return 'U19';
  if (normalized.match(/^U[-\s]*17/)) return 'U17';
  if (normalized.match(/^U[-\s]*15/)) return 'U15';
  if (normalized.match(/^U[-\s]*13/)) return 'U13';
  
  // Return original if no match (will be validated on save)
  return league;
}

// Function to detect and describe profile changes
function detectProfileChanges(oldPlayer: any, newData: any, newLeague: string | undefined): string[] {
  const changes: string[] = [];
  
  // Check positions
  if (JSON.stringify(oldPlayer.positions?.sort()) !== JSON.stringify(newData.positions?.sort())) {
    const oldPos = oldPlayer.positions?.join(', ') || 'None';
    const newPos = newData.positions?.join(', ') || 'None';
    changes.push(`Position changed from ${oldPos} to ${newPos}`);
  }
  
  // Check current league
  if (oldPlayer.currentLeague !== newLeague && newLeague) {
    changes.push(`League changed to ${newLeague}`);
  }
  
  // Check club (using currentClubId comparison)
  const oldClubName = oldPlayer.currentClub?.name || 'No club';
  // We'll check club changes by comparing the club history entries
  
  // Check height
  if (oldPlayer.height !== newData.height && newData.height) {
    changes.push(`Height updated to ${newData.height} cm`);
  }
  
  // Check skills
  const skillChanges: string[] = [];
  if (oldPlayer.skillReceiving !== newData.skillReceiving) skillChanges.push('Receiving');
  if (oldPlayer.skillServing !== newData.skillServing) skillChanges.push('Serving');
  if (oldPlayer.skillAttacking !== newData.skillAttacking) skillChanges.push('Attacking');
  if (oldPlayer.skillBlocking !== newData.skillBlocking) skillChanges.push('Blocking');
  if (oldPlayer.skillDefense !== newData.skillDefense) skillChanges.push('Defense');
  
  if (skillChanges.length > 0) {
    changes.push(`Skill ratings updated: ${skillChanges.join(', ')}`);
  }
  
  // Check looking for club status
  if (oldPlayer.lookingForClub !== newData.lookingForClub && newData.lookingForClub) {
    changes.push('Now looking for a club');
  }
  
  return changes;
}

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
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to load player data' },
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
    // Convert league display value to enum value and ensure undefined if empty
    currentLeague = convertLeagueToEnum(currentLeague);

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
        dominantHand: playerData.dominantHand || undefined,
        preferredLanguage: playerData.preferredLanguage || undefined,
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

          return {
            playerId: params.id,
            clubId: clubId,
            clubName: club.clubName,
            clubLogo: club.logo || null,
            clubCountry: club.country || null,
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

    // Send watchlist update notifications
    try {
      // Detect changes
      const changes = detectProfileChanges(existingPlayer, playerData, currentLeague);
      
      if (changes.length > 0) {
        // Find all watchers for this player
        const watchers = await prisma.watchlist.findMany({
          where: { playerId: params.id },
          include: {
            watcher: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        });

        // Send notification to each watcher
        for (const watchItem of watchers) {
          if (watchItem.watcher.email) {
            // Create in-app notification
            await prisma.notification.create({
              data: {
                userId: watchItem.watcher.id,
                type: 'PROFILE_UPDATE',
                title: `${playerData.firstName} ${playerData.lastName} updated profile`,
                message: changes.join('; '),
                actionUrl: `/players/${params.id}`,
                read: false,
              }
            });

            // Send email notification
            await sendWatchlistUpdateNotification({
              recipientEmail: watchItem.watcher.email,
              recipientName: watchItem.watcher.name || 'Recruiter',
              playerName: `${playerData.firstName} ${playerData.lastName}`,
              playerImage: playerData.profileImage || null,
              playerId: params.id,
              changes: changes,
            });
          }
        }
        
        console.log(`✅ Sent watchlist notifications to ${watchers.length} watchers for player ${params.id}`);
      }
    } catch (watchlistError) {
      console.error('Error sending watchlist notifications:', watchlistError);
      // Don't fail the request if watchlist notifications fail
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
      { error: 'playerProfile.errorSavingPlayerData' },
      { status: 500 }
    );
  }
}
