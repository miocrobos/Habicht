import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id

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

    // Increment view count
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
