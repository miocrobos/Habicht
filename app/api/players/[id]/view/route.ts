import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendProfileViewNotification } from '@/lib/email'

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
      select: { 
        id: true, 
        userId: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
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

    // Only create notification and send email on first view
    if (!existingView) {
      // Create view record
      await prisma.playerView.create({
        data: {
          playerId,
          viewerUserId,
          viewedAt: new Date()
        }
      })

      // Get viewer info
      const viewer = await prisma.user.findUnique({
        where: { id: viewerUserId },
        select: {
          name: true,
          email: true,
          player: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
              id: true
            }
          },
          recruiter: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
              id: true
            }
          }
        }
      })

      if (viewer) {
        const viewerName = viewer.player 
          ? `${viewer.player.firstName} ${viewer.player.lastName}`
          : viewer.recruiter
          ? `${viewer.recruiter.firstName} ${viewer.recruiter.lastName}`
          : viewer.name

        const viewerImage = viewer.player?.profileImage || viewer.recruiter?.profileImage || null
        const viewerProfileUrl = viewer.player
          ? `/players/${viewer.player.id}`
          : viewer.recruiter
          ? `/recruiters/${viewer.recruiter.id}`
          : null

        // Create notification
        await prisma.notification.create({
          data: {
            userId: existingPlayer.userId,
            type: 'PROFILE_VIEW',
            title: 'Profil Aagluegt',
            message: `${viewerName} het din Profil aagluegt`,
            senderId: viewerUserId,
            senderName: viewerName,
            senderImage: viewerImage,
            actionUrl: viewerProfileUrl
          }
        })

        // Send email notification
        try {
          await sendProfileViewNotification({
            recipientEmail: existingPlayer.user.email,
            recipientName: `${existingPlayer.firstName} ${existingPlayer.lastName}`,
            viewerName,
            viewerProfileUrl: viewerProfileUrl || '#',
            profileUrl: `/players/${playerId}`,
            viewerImage: viewerImage,
            viewerRole: viewer.player ? 'player' : viewer.recruiter ? 'recruiter' : null
          })
        } catch (emailError) {
          console.error('Error sending profile view email:', emailError)
          // Don't fail the request if email fails
        }
      }
    }

    // Get total unique view count
    const viewCount = await prisma.playerView.count({
      where: { playerId }
    })

    // Update the player's views field to match the count
    await prisma.player.update({
      where: { id: playerId },
      data: { views: viewCount }
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
