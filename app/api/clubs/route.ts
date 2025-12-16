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

    // Get all clubs matching the filters
    const allClubs = await prisma.club.findMany({
      where,
      orderBy: [
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
        logo: true,
        _count: {
          select: {
            currentPlayers: true
          }
        }
      }
    })

    // Group clubs by name and combine leagues
    const clubsMap = new Map<string, any>()
    
    for (const club of allClubs) {
      if (clubsMap.has(club.name)) {
        const existing = clubsMap.get(club.name)
        // Add league to the leagues array if not already included
        if (!existing.leagues.includes(club.league)) {
          existing.leagues.push(club.league)
        }
        // Update logo if current club has one and existing doesn't
        if (club.logo && !existing.logo) {
          existing.logo = club.logo
        }
        // Update website if current club has one and existing doesn't
        if (club.website && !existing.website) {
          existing.website = club.website
        }
      } else {
        clubsMap.set(club.name, {
          ...club,
          leagues: [club.league]
        })
      }
    }

    // Convert map to array and process each club
    const clubs = Array.from(clubsMap.values())
    
    const clubsWithDisplayLeague = await Promise.all(clubs.map(async (club: any) => {
      // Count players who have this club in their current club history
      const playersWithClub = await prisma.clubHistory.count({
        where: {
          clubName: club.name,
          currentClub: true
        }
      })
      
      // Map all leagues to display format
      const leaguesDisplay = club.leagues.map((league: string) => 
        league
          .replace('FIRST_LEAGUE', '1. Liga')
          .replace('SECOND_LEAGUE', '2. Liga')
          .replace('THIRD_LEAGUE', '3. Liga')
          .replace('FOURTH_LEAGUE', '4. Liga')
          .replace('YOUTH_U23', 'U23')
          .replace('YOUTH_U19', 'U19')
          .replace('YOUTH_U17', 'U17')
      )
      
      return {
        ...club,
        leaguesDisplay,
        playerCount: playersWithClub
      }
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
