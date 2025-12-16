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

    // If filtering by league, only show clubs that have teams in that league
    if (league && league !== 'Alle') {
      // Map display names to field names
      const leagueFields: Record<string, string[]> = {
        'NLA': ['hasNLAMen', 'hasNLAWomen'],
        'NLB': ['hasNLBMen', 'hasNLBWomen'],
        '1. Liga': ['has1LigaMen', 'has1LigaWomen'],
        '2. Liga': ['has2LigaMen', 'has2LigaWomen'],
        '3. Liga': ['has3LigaMen', 'has3LigaWomen'],
        '4. Liga': ['has4LigaMen', 'has4LigaWomen'],
        'U23': ['hasU23Men', 'hasU23Women'],
        'U19': ['hasU19Men', 'hasU19Women'],
        'U17': ['hasU17Men', 'hasU17Women'],
      }
      
      const fields = leagueFields[league]
      if (fields) {
        where.OR = fields.map(field => ({ [field]: true }))
      }
    }

    const clubs = await prisma.club.findMany({
      where,
      orderBy: [
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        canton: true,
        town: true,
        website: true,
        description: true,
        logo: true,
        hasNLAMen: true,
        hasNLAWomen: true,
        hasNLBMen: true,
        hasNLBWomen: true,
        has1LigaMen: true,
        has1LigaWomen: true,
        has2LigaMen: true,
        has2LigaWomen: true,
        has3LigaMen: true,
        has3LigaWomen: true,
        has4LigaMen: true,
        has4LigaWomen: true,
        hasU23Men: true,
        hasU23Women: true,
        hasU19Men: true,
        hasU19Women: true,
        hasU17Men: true,
        hasU17Women: true,
        _count: {
          select: {
            currentPlayers: true
          }
        }
      }
    })

    const clubsWithLeagues = clubs.map((club: any) => {
      // Use _count.currentPlayers which is already queried
      const playerCount = club._count.currentPlayers
      
      // Build list of leagues club participates in
      const leagues: string[] = []
      if (club.hasNLAMen || club.hasNLAWomen) leagues.push('NLA')
      if (club.hasNLBMen || club.hasNLBWomen) leagues.push('NLB')
      if (club.has1LigaMen || club.has1LigaWomen) leagues.push('1. Liga')
      if (club.has2LigaMen || club.has2LigaWomen) leagues.push('2. Liga')
      if (club.has3LigaMen || club.has3LigaWomen) leagues.push('3. Liga')
      if (club.has4LigaMen || club.has4LigaWomen) leagues.push('4. Liga')
      if (club.hasU23Men || club.hasU23Women) leagues.push('U23')
      if (club.hasU19Men || club.hasU19Women) leagues.push('U19')
      if (club.hasU17Men || club.hasU17Women) leagues.push('U17')
      
      return {
        id: club.id,
        name: club.name,
        canton: club.canton,
        town: club.town,
        website: club.website,
        description: club.description,
        logo: club.logo,
        leaguesDisplay: leagues,
        playerCount: playerCount
      }
    })

    return NextResponse.json({
      clubs: clubsWithLeagues,
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, canton, town, website, logo } = body

    if (!name || !canton) {
      return NextResponse.json(
        { error: 'Name and canton are required' },
        { status: 400 }
      )
    }

    const club = await prisma.club.create({
      data: {
        name,
        canton,
        town: town || null,
        website: website || null,
        logo: logo || null,
      }
    })

    return NextResponse.json({ club }, { status: 201 })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
