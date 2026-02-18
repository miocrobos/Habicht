import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertLeagueToEnum } from '@/lib/leagueUtils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const club = searchParams.get('club')
    const gender = searchParams.get('gender')
    const league = searchParams.get('league')
    const canton = searchParams.get('canton')
    const position = searchParams.get('position')
    
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
      playerWhere.currentLeagues = { has: convertLeagueToEnum(league) }
    }
    if (position) {
      // Filter by position (array contains)
      playerWhere.positions = { has: position }
    }
    if (searchParams.get('age')) {
      // Age filter: match players who are exactly the given age
      const age = parseInt(searchParams.get('age') || '', 10)
      if (!isNaN(age) && age > 0) {
        const today = new Date();
        // Lower bound: birthday after this date (one year older)
        const lower = new Date(today.getFullYear() - age - 1, today.getMonth(), today.getDate() + 1);
        // Upper bound: birthday before or on this date (exact age)
        const upper = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
        playerWhere.dateOfBirth = { gt: lower, lte: upper };
      }
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
            currentLeagues: true,
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
