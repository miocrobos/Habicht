import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id
    const session = await getServerSession()
    const viewerId = session?.user?.playerId || session?.user?.recruiterId

    // Check if player exists first
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, views: true }
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Don't increment if viewing your own profile
    if (viewerId && viewerId === playerId) {
      return NextResponse.json({ views: existingPlayer.views })
    }

    // For now, increment view count
    // TODO: Implement proper unique viewer tracking with a separate table
    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        views: {
          increment: 1
        }
      },
      select: {
        views: true
      }
    })

    return NextResponse.json({ views: player.views })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}
