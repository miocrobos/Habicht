import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league');
    const canton = searchParams.get('canton');

    if (!league) {
      return NextResponse.json(
        { error: 'Liga Parameter Isch Erforderlich' },
        { status: 400 }
      );
    }

    // Find all clubs that have players in this league
    const clubsWithPlayers = await prisma.clubHistory.findMany({
      where: {
        league: {
          contains: league,
          mode: 'insensitive',
        },
        ...(canton && {
          club: {
            canton: canton as any,
          },
        }),
      },
      include: {
        club: true,
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            positions: true,
          },
        },
      },
      distinct: ['clubId'],
    });

    // Also get clubs that match the league directly
    const clubs = await prisma.club.findMany({
      where: {
        OR: [
          {
            league: {
              contains: league,
              mode: 'insensitive',
            },
          },
          {
            id: {
              in: clubsWithPlayers
                .filter(ch => ch.clubId !== null)
                .map(ch => ch.clubId as string),
            },
          },
        ],
        ...(canton && { canton: canton as any }),
      },
      include: {
        currentPlayers: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            positions: true,
          },
        },
        _count: {
          select: {
            currentPlayers: true,
          },
        },
      },
    });

    return NextResponse.json({
      clubs,
      league,
      totalClubs: clubs.length,
    });
  } catch (error) {
    console.error('Error fetching clubs by league:', error);
    return NextResponse.json(
      { error: 'Fehler Bim Lade Vo Verein' },
      { status: 500 }
    );
  }
}
