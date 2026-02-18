import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertLeagueToEnum } from '@/lib/leagueUtils'

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
    const lookingForClub = searchParams.get('lookingForClub') || ''
    const userType = searchParams.get('userType') || ''

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
      // Check both currentLeagues and clubHistory for league filter
      andConditions.push({
        OR: [
          { currentLeagues: { has: leagueEnum } },
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

    if (lookingForClub === 'true') {
      andConditions.push({ lookingForClub: true })
    }

    // Filter by user type (PLAYER or HYBRID)
    if (userType) {
      andConditions.push({
        user: {
          role: userType
        }
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
        user: {
          select: {
            id: true,
            role: true,
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
