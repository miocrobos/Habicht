import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Get a single conversation by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    // Fetch the conversation with all related data
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            positions: true,
            currentLeagues: true,
            profileImage: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        recruiter: {
          include: {
            club: {
              select: {
                id: true,
                name: true
              }
            },
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        secondRecruiter: {
          include: {
            club: {
              select: {
                id: true,
                name: true
              }
            },
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Verify user is a participant in this conversation
    let isParticipant = false

    if (session.user.role === 'PLAYER' || session.user.role === 'HYBRID') {
      // Check if user is the player in this conversation
      const player = await prisma.player.findFirst({
        where: { userId: session.user.id }
      })
      if (player && conversation.playerId === player.id) {
        isParticipant = true
      }
    }
    
    if (!isParticipant && (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID')) {
      // Check if user is a recruiter in this conversation
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })
      if (recruiter) {
        if (conversation.recruiterId === recruiter.id || conversation.secondRecruiterId === recruiter.id) {
          isParticipant = true
        }
      }
    }

    if (!isParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}
