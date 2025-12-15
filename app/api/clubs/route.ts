import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const canton = searchParams.get('canton')
    const league = searchParams.get('league')

    const where: any = {}

    if (canton && canton !== 'Alle') {
      where.canton = canton
    }

    if (league && league !== 'Alle') {
      // Map display names to enum values
      const leagueMap: Record<string, string> = {
        'NLA': 'NLA',
        'NLB': 'NLB',
        '1. Liga': 'FIRST_LEAGUE',
        '2. Liga': 'SECOND_LEAGUE',
        '3. Liga': 'THIRD_LEAGUE',
        '4. Liga': 'FOURTH_LEAGUE',
        'U23': 'YOUTH_U23',
        'U19': 'YOUTH_U19',
        'U17': 'YOUTH_U17',
      }
      where.league = leagueMap[league] || league
    }

    const clubs = await prisma.club.findMany({
      where,
      orderBy: [
        { league: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        league: true,
        canton: true,
        town: true,
        website: true,
        description: true,
        _count: {
          select: {
            currentPlayers: true
          }
        }
      }
    })

    // Map league enum back to display names
    const clubsWithDisplayLeague = clubs.map((club: any) => ({
      ...club,
      leagueDisplay: club.league
        .replace('FIRST_LEAGUE', '1. Liga')
        .replace('SECOND_LEAGUE', '2. Liga')
        .replace('THIRD_LEAGUE', '3. Liga')
        .replace('FOURTH_LEAGUE', '4. Liga')
        .replace('YOUTH_U23', 'U23')
        .replace('YOUTH_U19', 'U19')
        .replace('YOUTH_U17', 'U17'),
      playerCount: club._count.currentPlayers
    }))

    return NextResponse.json({
      clubs: clubsWithDisplayLeague,
      total: clubs.length
    })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}
