import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get all conversations for current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    
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
