import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get('clubId')
    const gender = searchParams.get('gender')
    const league = searchParams.get('league')
    const canton = searchParams.get('canton')
    
    // Build where clause for clubs
    const where: any = {}
    
    // If clubId is specified, only get that club
    if (clubId) {
      where.id = clubId
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
      playerWhere.currentLeague = league
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
    
    // If clubId was specified, return just the players
    if (clubId) {
      const club = clubs[0]
      if (!club) {
        return NextResponse.json({ players: [], total: 0 })
      }
      return NextResponse.json({
        players: club.currentPlayers,
        total: club.currentPlayers.length
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
