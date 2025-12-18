import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get('gender') || 'MALE'
    const league = searchParams.get('league')
    const canton = searchParams.get('canton')
    
    // Get all clubs with their players
    const where: any = {
      currentPlayers: {
        some: {
          gender: gender as any
        }
      }
    }
    
    if (canton) {
      where.canton = canton
    }
    
    const clubs = await prisma.club.findMany({
      where,
      include: {
        currentPlayers: {
          where: {
            gender: gender as any,
            isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            positions: true,
            jerseyNumber: true,
            height: true,
            profileImage: true,
            currentLeague: true,
            isActive: true,
            lookingForClub: true,
            user: {
              select: {
                name: true
              }
            }
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
