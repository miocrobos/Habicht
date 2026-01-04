import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PATCH - Mark messages as read
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is participant
    let canMarkAsRead = false
    let currentUserId: string | null = null
    let isRecruiterChat = false

    if (session.user.role === 'PLAYER') {
      const player = await prisma.player.findFirst({
        where: { userId: session.user.id }
      })
      if (player) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: params.id,
            playerId: player.id
          }
        })
        if (conversation) {
          canMarkAsRead = true
          currentUserId = player.id
        }
      }
    } else if (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') {
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })
      if (recruiter) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: params.id,
            OR: [
              { recruiterId: recruiter.id },
              { secondRecruiterId: recruiter.id }
            ]
          }
        })
        if (conversation) {
          canMarkAsRead = true
          currentUserId = recruiter.id
          // Check if this is a recruiter-to-recruiter chat
          isRecruiterChat = conversation.playerId === null && conversation.secondRecruiterId !== null
        }
      }
    }

    if (!canMarkAsRead || !currentUserId) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    // Mark all unread messages from opponent(s) as read
    let result
    if (isRecruiterChat) {
      // For recruiter-to-recruiter chat, mark messages not from current user
      result = await prisma.message.updateMany({
        where: {
          conversationId: params.id,
          senderId: { not: currentUserId },
          status: { not: 'READ' }
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      })
    } else {
      // For player-recruiter chat, use sender type
      const oppositeType = session.user.role === 'PLAYER' ? 'RECRUITER' : 'PLAYER'
      result = await prisma.message.updateMany({
        where: {
          conversationId: params.id,
          senderType: oppositeType,
          status: { not: 'READ' }
        },
        data: {
          status: 'READ',
          readAt: new Date()
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      markedAsRead: result.count 
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    )
  }
}
