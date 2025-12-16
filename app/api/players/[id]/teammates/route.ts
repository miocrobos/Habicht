import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id

    const teammates = await prisma.teammate.findMany({
      where: { playerId },
      include: {
        teammate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            positions: true,
            jerseyNumber: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        season: 'desc',
      },
    })

    const formattedTeammates = teammates.map((t) => ({
      id: t.teammate.id,
      firstName: t.teammate.firstName,
      lastName: t.teammate.lastName,
      positions: t.teammate.positions,
      jerseyNumber: t.teammate.jerseyNumber,
      profileImage: t.teammate.profileImage,
      season: t.season,
      clubName: t.clubName,
    }))

    return NextResponse.json({ teammates: formattedTeammates })
  } catch (error) {
    console.error('Error fetching teammates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teammates' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id
    const body = await request.json()
    const { teammateId, clubName, season } = body

    if (!teammateId || !clubName || !season) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const teammate = await prisma.teammate.create({
      data: {
        playerId,
        teammateId,
        clubName,
        season,
      },
    })

    return NextResponse.json({ success: true, teammate })
  } catch (error) {
    console.error('Error adding teammate:', error)
    return NextResponse.json(
      { error: 'Failed to add teammate' },
      { status: 500 }
    )
  }
}
