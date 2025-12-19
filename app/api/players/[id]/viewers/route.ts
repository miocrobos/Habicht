import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const playerId = params.id

    // Check if the requesting user is the profile owner
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { userId: true }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Only the profile owner can see who viewed their profile
    if (session?.user?.id !== player.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get all viewers with their player or recruiter info
    const viewers = await prisma.playerView.findMany({
      where: { playerId },
      orderBy: { viewedAt: 'desc' },
      include: {
        viewerUser: {
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                positions: true,
                canton: true
              }
            },
            recruiter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                canton: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ viewers })
  } catch (error) {
    console.error('Error fetching viewers:', error)
    return NextResponse.json({ error: 'Failed to fetch viewers' }, { status: 500 })
  }
}
