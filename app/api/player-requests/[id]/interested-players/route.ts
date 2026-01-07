import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get all interested players for a request (creator only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if the request exists and user is the creator
    const playerRequest = await prisma.playerRequest.findUnique({
      where: { id },
      select: { id: true, creatorId: true, title: true }
    })

    if (!playerRequest) {
      return NextResponse.json({ error: 'Player request not found' }, { status: 404 })
    }

    if (playerRequest.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the creator can view interested players' }, { status: 403 })
    }

    // Get all interests with additional user details
    const interests = await prisma.playerRequestInterest.findMany({
      where: { requestId: id },
      orderBy: { createdAt: 'desc' }
    })

    // Enrich with additional player/hybrid details
    const enrichedInterests = await Promise.all(
      interests.map(async (interest) => {
        let profileData: any = null
        let profileUrl = ''

        if (interest.userType === 'PLAYER') {
          const player = await prisma.player.findUnique({
            where: { userId: interest.userId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              positions: true,
              currentLeagues: true,
              canton: true,
              city: true,
              gender: true,
              lookingForClub: true,
              currentClub: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          })
          if (player) {
            profileData = player
            profileUrl = `/players/${player.id}`
          }
        } else if (interest.userType === 'HYBRID') {
          const hybrid = await prisma.hybrid.findUnique({
            where: { userId: interest.userId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              canton: true,
              city: true,
              gender: true
            }
          })
          if (hybrid) {
            profileData = hybrid
            profileUrl = `/hybrids/${hybrid.id}`
          }
        }

        return {
          ...interest,
          profileData,
          profileUrl
        }
      })
    )

    return NextResponse.json({
      requestTitle: playerRequest.title,
      interests: enrichedInterests,
      count: enrichedInterests.length
    })
  } catch (error) {
    console.error('Error fetching interested players:', error)
    return NextResponse.json({ error: 'Failed to fetch interested players' }, { status: 500 })
  }
}
