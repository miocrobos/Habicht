import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendChatNotification } from '@/lib/email'
import { authOptions } from '@/lib/auth'

// GET - Get all messages in a conversation
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Verify user is participant in this conversation
    let isParticipant = false
    let userId: string | null = null

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
        isParticipant = !!conversation
        userId = player.id
      }
    } else if (session.user.role === 'RECRUITER') {
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })
      if (recruiter) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: params.id,
            recruiterId: recruiter.id
          }
        })
        isParticipant = !!conversation
        userId = recruiter.id
      }
    }

    if (!isParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        recruiter: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Mark opponent's messages as delivered
    const oppositeType = session.user.role === 'PLAYER' ? 'RECRUITER' : 'PLAYER'
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderType: oppositeType,
        status: 'SENT'
      },
      data: {
        status: 'DELIVERED'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    )
  }
}

// POST - Send a new message
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { content, senderType } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    // Verify user is participant and get their ID
    let senderId: string | null = null
    let playerId: string | null = null
    let recruiterId: string | null = null

    if (senderType === 'PLAYER' && session.user.role === 'PLAYER') {
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
          senderId = player.id
          playerId = player.id
        }
      }
    } else if (senderType === 'RECRUITER' && session.user.role === 'RECRUITER') {
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })
      if (recruiter) {
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: params.id,
            recruiterId: recruiter.id
          }
        })
        if (conversation) {
          senderId = recruiter.id
          recruiterId = recruiter.id
        }
      }
    }

    if (!senderId) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId,
        senderType,
        playerId,
        recruiterId,
        content: content.trim(),
        status: 'SENT'
      }
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: params.id },
      data: { lastMessageAt: new Date() }
    })

    // Send email notification to recipient
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: params.id },
        include: {
          player: {
            include: {
              user: true
            }
          },
          recruiter: {
            include: {
              user: true
            }
          }
        }
      })

      if (conversation) {
        // Determine sender and recipient
        let recipientEmail = ''
        let recipientName = ''
        let recipientUserId = ''
        let senderName = ''
        let senderImage = ''
        let senderRoleText = ''
        let notifyEnabled = false

        if (senderType === 'PLAYER' && conversation.recruiter?.user) {
          // Sender is player, recipient is recruiter
          recipientEmail = conversation.recruiter.user.email || ''
          recipientName = conversation.recruiter.user.name || 'Recruiter'
          recipientUserId = conversation.recruiter.user.id
          senderName = conversation.player ? `${conversation.player.firstName} ${conversation.player.lastName}` : 'Spieler'
          senderImage = conversation.player?.profileImage || ''
          senderRoleText = 'Spieler'
          notifyEnabled = conversation.recruiter.user.notifyChatMessages
        } else if (senderType === 'RECRUITER' && conversation.player?.user) {
          // Sender is recruiter, recipient is player
          recipientEmail = conversation.player.user.email || ''
          recipientName = `${conversation.player.firstName} ${conversation.player.lastName}`
          recipientUserId = conversation.player.user.id
          senderName = conversation.recruiter?.user?.name || 'Recruiter'
          senderImage = conversation.recruiter?.profileImage || ''
          senderRoleText = 'Recruiter'
          notifyEnabled = conversation.player.user.notifyChatMessages
        }

        // Create notification for recipient
        if (recipientUserId) {
          await prisma.notification.create({
            data: {
              userId: recipientUserId,
              type: 'MESSAGE',
              title: `Nachricht vo ${senderName}`,
              message: content.trim().substring(0, 100) + (content.trim().length > 100 ? '...' : ''),
              senderId: session.user.id,
              senderName,
              senderImage,
              actionUrl: `/chat/${params.id}`,
              read: false,
              emailSent: notifyEnabled && !!recipientEmail
            }
          })
        }

        // Send email notification if recipient email exists and notifications enabled
        if (recipientEmail && notifyEnabled) {
          await sendChatNotification({
            recipientEmail,
            recipientName,
            senderName,
            senderRole: senderRoleText,
            messagePreview: content.trim(),
            conversationId: params.id
          })
        }
      }
    } catch (emailError) {
      console.error('Error sending chat notification email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
