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

    // Check if this user has already viewed this profile
    const existingView = await prisma.playerView.findUnique({
      where: {
        playerId_viewerUserId: {
          playerId,
          viewerUserId
        }
      }
    })

    // Only create a new view if this user hasn't viewed before
    if (!existingView) {
      await prisma.playerView.create({
        data: {
          playerId,
          viewerUserId,
          viewedAt: new Date()
        }
      })
    }

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
