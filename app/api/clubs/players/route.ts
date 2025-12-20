import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Convert display league names to enum values
function convertLeagueToEnum(league: string | null | undefined): string | undefined {
  if (!league || league === '') return undefined;
  
  const leagueMap: { [key: string]: string } = {
    'NLA': 'NLA',
    'NLB': 'NLB',
    '1. Liga': 'FIRST_LEAGUE',
    '2. Liga': 'SECOND_LEAGUE',
    '3. Liga': 'THIRD_LEAGUE',
    '4. Liga': 'FOURTH_LEAGUE',
    '5. Liga': 'FIFTH_LEAGUE',
    'U19 Elite': 'U19_ELITE',
    'U17 Elite': 'U17_ELITE',
    'U15 Elite': 'U15_ELITE',
    'U19': 'U19',
    'U17': 'U17',
    'U15': 'U15',
    'U13': 'U13'
  };
  
  return leagueMap[league] || league;
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const club = searchParams.get('club')
    const gender = searchParams.get('gender')
    const league = searchParams.get('league')
    const canton = searchParams.get('canton')
    
    // Build where clause for clubs
    const where: any = {}
    
    // If club is specified, only get that club
    if (club) {
      where.id = club
    }
    
    // Filter by canton if specified
    if (canton) {
      where.canton = canton
    }
    
    // Only get clubs that have players
    where.currentPlayers = {
      some: {}
    }
    
    // Build player filter
    const playerWhere: any = {
      isActive: true
    }
    
    if (gender) {
      playerWhere.gender = gender as any
    }
    
    if (league) {
      // Convert league display value to enum
      playerWhere.currentLeague = convertLeagueToEnum(league)
    }
    
    const clubs = await prisma.club.findMany({
      where,
      include: {
        currentPlayers: {
          where: playerWhere,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            positions: true,
            jerseyNumber: true,
            height: true,
            dateOfBirth: true,
            gender: true,
            canton: true,
            municipality: true,
            profileImage: true,
            currentLeague: true,
            isActive: true,
            lookingForClub: true,
            user: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            lastName: 'asc'
          }
        },
        _count: {
          select: {
            currentPlayers: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    })
    
    // If club was specified, return just the players
    if (club) {
      const clubData = clubs[0]
      if (!clubData) {
        return NextResponse.json({ players: [], total: 0 })
      }
      return NextResponse.json({
        players: clubData.currentPlayers,
        total: clubData.currentPlayers.length
      })
    }
    
    // Filter out clubs with no players
    const clubsWithPlayers = clubs.filter(club => club.currentPlayers.length > 0)
    
    return NextResponse.json({
      clubs: clubsWithPlayers,
      total: clubsWithPlayers.reduce((sum, club) => sum + club.currentPlayers.length, 0)
    })
    
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}
