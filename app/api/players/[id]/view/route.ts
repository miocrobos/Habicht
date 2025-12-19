import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = params.id
    const session = await getServerSession(authOptions)
    
    // Only count views from registered users
    if (!session?.user?.id) {
      return NextResponse.json({ views: 0 })
    }

    const viewerUserId = session.user.id

    // Check if player exists first
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, userId: true }
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Don't track if viewing your own profile
    if (viewerUserId === existingPlayer.userId) {
      const viewCount = await prisma.playerView.count({
        where: { playerId }
      })
      return NextResponse.json({ views: viewCount })
    }

    // Create or update view record (upsert ensures uniqueness)
    await prisma.playerView.upsert({
      where: {
        playerId_viewerUserId: {
          playerId,
          viewerUserId
        }
      },
      create: {
        playerId,
        viewerUserId,
        viewedAt: new Date()
      },
      update: {
        viewedAt: new Date()
      }
    })

    // Get total unique view count
    const viewCount = await prisma.playerView.count({
      where: { playerId }
    })

    return NextResponse.json({ views: viewCount })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
