import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

// PATCH - Mark messages as read
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Verify user is participant
    let canMarkAsRead = false
    let oppositeType: 'PLAYER' | 'RECRUITER' | null = null

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
          oppositeType = 'RECRUITER'
        }
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
        if (conversation) {
          canMarkAsRead = true
          oppositeType = 'PLAYER'
        }
      }
    }

    if (!canMarkAsRead || !oppositeType) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    // Mark all unread messages from opponent as read
    const result = await prisma.message.updateMany({
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

    return NextResponse.json({ 
      success: true, 
      markedAsRead: result.count 
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Markieren als gelesen' },
      { status: 500 }
    )
  }
}
