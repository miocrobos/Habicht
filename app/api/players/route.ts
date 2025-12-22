import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const position = searchParams.get('position') || ''
    const canton = searchParams.get('canton') || ''
    const league = searchParams.get('league') || ''
    const minHeight = searchParams.get('minHeight') || ''
    const gender = searchParams.get('gender') || ''
    const school = searchParams.get('school') || ''

    // Build where clause
    const where: any = {
      isPublic: true,
      isActive: true,
    }

    const andConditions: any[] = []

    if (search) {
      andConditions.push({
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { schoolName: { contains: search, mode: 'insensitive' } },
          { currentClub: { name: { contains: search, mode: 'insensitive' } } },
        ]
      })
    }

    if (position) {
      // Check if positions array contains the specified position
      andConditions.push({
        positions: {
          has: position
        }
      })
    }

    if (canton) {
      andConditions.push({ canton })
    }

    if (league) {
      // Convert league display value to enum
      const leagueEnum = convertLeagueToEnum(league);
      // Check both currentLeague and clubHistory for league filter
      andConditions.push({
        OR: [
          { currentLeague: leagueEnum },
          {
            clubHistory: {
              some: {
                league: leagueEnum,
                currentClub: true
              }
            }
          }
        ]
      })
    }

    if (minHeight) {
      andConditions.push({ height: { gte: parseInt(minHeight) } })
    }

    if (gender) {
      andConditions.push({ gender })
    }

    if (school) {
      andConditions.push({ 
        schoolName: { contains: school, mode: 'insensitive' }
      })
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }

    // Fetch players
    const players = await prisma.player.findMany({
      where,
      include: {
        currentClub: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}
