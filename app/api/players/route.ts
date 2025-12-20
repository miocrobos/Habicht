import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const position = searchParams.get('position') || ''
    const canton = searchParams.get('canton') || ''
    const league = searchParams.get('league') || ''
    const minHeight = searchParams.get('minHeight') || ''
    const gender = searchParams.get('gender') || ''

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
