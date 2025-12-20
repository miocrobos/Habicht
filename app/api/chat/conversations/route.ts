import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Get all conversations for current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    let conversations: any[] = []

    if (session.user.role === 'PLAYER') {
      const player = await prisma.player.findFirst({
        where: { userId: session.user.id }
      })

      if (player) {
        conversations = await prisma.conversation.findMany({
          where: { 
            playerId: player.id,
            isActive: true
          },
          include: {
            recruiter: {
              include: {
                club: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            _count: {
              select: {
                messages: {
                  where: {
                    senderType: 'RECRUITER',
                    status: { not: 'READ' }
                  }
                }
              }
            }
          },
          orderBy: { lastMessageAt: 'desc' }
        })
      }
    } else if (session.user.role === 'RECRUITER') {
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })

      if (recruiter) {
        conversations = await prisma.conversation.findMany({
          where: { 
            recruiterId: recruiter.id,
            isActive: true
          },
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                positions: true,
                currentLeague: true,
                profileImage: true
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            _count: {
              select: {
                messages: {
                  where: {
                    senderType: 'PLAYER',
                    status: { not: 'READ' }
                  }
                }
              }
            }
          },
          orderBy: { lastMessageAt: 'desc' }
        })
      }
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Konversationen' },
      { status: 500 }
    )
  }
}

// POST - Create or get existing conversation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { participantId, participantType } = await request.json()

    let playerId: string
    let recruiterId: string

    // Determine player and recruiter IDs based on current user
    if (session.user.role === 'PLAYER') {
      const player = await prisma.player.findFirst({
        where: { userId: session.user.id }
      })

      if (!player) {
        return NextResponse.json({ error: 'Spieler nicht gefunden' }, { status: 404 })
      }

      playerId = player.id

      // Find recruiter by user ID
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: participantId }
      })

      if (!recruiter) {
        return NextResponse.json({ error: 'Rekrutierer nicht gefunden' }, { status: 404 })
      }

      recruiterId = recruiter.id
    } else if (session.user.role === 'RECRUITER') {
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })

      if (!recruiter) {
        return NextResponse.json({ error: 'Rekrutierer nicht gefunden' }, { status: 404 })
      }

      recruiterId = recruiter.id

      // Find player by user ID
      const player = await prisma.player.findFirst({
        where: { userId: participantId }
      })

      if (!player) {
        return NextResponse.json({ error: 'Spieler nicht gefunden' }, { status: 404 })
      }

      playerId = player.id
    } else {
      return NextResponse.json({ error: 'Ungültige Benutzerrolle' }, { status: 400 })
    }

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        playerId,
        recruiterId
      }
    })

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          playerId,
          recruiterId,
          isActive: true,
          lastMessageAt: new Date()
        }
      })
    } else {
      // Reactivate if it was closed
      if (!conversation.isActive) {
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: { isActive: true }
        })
      }
    }

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Konversation' },
      { status: 500 }
    )
  }
}
