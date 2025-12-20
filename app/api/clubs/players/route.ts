import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
