import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET - Get all messages in a conversation
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
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
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
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
      { error: 'Fehler beim Laden der Nachrichten' },
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
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { content, senderType } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Nachricht darf nicht leer sein' }, { status: 400 })
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

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    )
  }
}
