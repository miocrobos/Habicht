import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { action } = await request.json() // 'ACCEPTED' or 'REJECTED'

    const recruiter = await prisma.recruiter.findFirst({
      where: { userId: session.user.id }
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter nicht gefunden' }, { status: 404 })
    }

    const chatRequest = await prisma.chatRequest.findUnique({
      where: { id: params.id },
      include: {
        player: true
      }
    })

    if (!chatRequest || chatRequest.recruiterId !== recruiter.id) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 })
    }

    // Update request status
    const updatedRequest = await prisma.chatRequest.update({
      where: { id: params.id },
      data: {
        status: action,
        respondedAt: new Date()
      }
    })

    // If accepted, create conversation
    if (action === 'ACCEPTED') {
      const conversation = await prisma.conversation.create({
        data: {
          playerId: chatRequest.playerId,
          recruiterId: recruiter.id,
          isActive: true
        }
      })

      // Create initial message from the request
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          playerId: chatRequest.playerId,
          senderId: chatRequest.playerId,
          senderType: 'PLAYER',
          content: chatRequest.message,
          status: 'DELIVERED'
        }
      })

      return NextResponse.json({ 
        chatRequest: updatedRequest, 
        conversation 
      })
    }

    return NextResponse.json({ chatRequest: updatedRequest })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Anfrage' },
      { status: 500 }
    )
  }
}
