import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { schoolName: { contains: search, mode: 'insensitive' } },
        { currentClub: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (position) {
      where.position = position
    }

    if (canton) {
      where.canton = canton
    }

    if (league) {
      where.currentLeague = league
    }

    if (minHeight) {
      where.height = { gte: parseInt(minHeight) }
    }

    if (gender) {
      where.gender = gender
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
