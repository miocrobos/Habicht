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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let conversations: any[] = []

    if (session.user.role === 'PLAYER') {
      // Players can only see conversations where a recruiter has messaged them
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
              select: {
                id: true,
                firstName: true,
                lastName: true,
                coachRole: true,
                profileImage: true,
                club: {
                  select: {
                    name: true
                  }
                },
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
    } else if (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') {
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })

      // For HYBRID users, also get their player profile
      const player = session.user.role === 'HYBRID' ? await prisma.player.findFirst({
        where: { userId: session.user.id }
      }) : null

      // Get player conversations (where recruiter is primary)
      const playerConversations = recruiter ? await prisma.conversation.findMany({
        where: { 
          recruiterId: recruiter.id,
          playerId: { not: null },
          isActive: true
        },
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              positions: true,
              currentLeagues: true,
              profileImage: true,
              currentClub: {
                select: { name: true }
              },
              user: {
                select: { id: true }
              }
            }
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              coachRole: true,
              profileImage: true,
              club: {
                select: { name: true }
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
                  senderType: 'PLAYER',
                  status: { not: 'READ' }
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      }) : []

      // For HYBRID users - get conversations where they are the PLAYER
      const hybridAsPlayerConversations = player ? await prisma.conversation.findMany({
        where: { 
          playerId: player.id,
          isActive: true
        },
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              positions: true,
              currentLeagues: true,
              profileImage: true,
              currentClub: {
                select: { name: true }
              },
              user: {
                select: { id: true }
              }
            }
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              coachRole: true,
              profileImage: true,
              club: {
                select: { name: true }
              },
              user: {
                select: { name: true }
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
      }) : []

      // Get recruiter-to-recruiter conversations (as initiator)
      const recruiterConversationsAsInitiator = recruiter ? await prisma.conversation.findMany({
        where: { 
          recruiterId: recruiter.id,
          secondRecruiterId: { not: null },
          playerId: null,
          isActive: true
        },
        include: {
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              coachRole: true,
              profileImage: true,
              club: {
                select: { name: true }
              }
            }
          },
          secondRecruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              coachRole: true,
              profileImage: true,
              club: {
                select: { name: true }
              },
              user: {
                select: {
                  id: true,
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
                  recruiterId: { not: recruiter.id },
                  status: { not: 'READ' }
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      }) : []

      // Get recruiter-to-recruiter conversations (as recipient)
      const recruiterConversationsAsRecipient = recruiter ? await prisma.conversation.findMany({
        where: { 
          secondRecruiterId: recruiter.id,
          playerId: null,
          isActive: true
        },
        include: {
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              coachRole: true,
              profileImage: true,
              club: {
                select: { name: true }
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
            select: {
              id: true,
              firstName: true,
              lastName: true,
              coachRole: true,
              profileImage: true,
              club: {
                select: { name: true }
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
                  recruiterId: recruiter.id,
                  status: { not: 'READ' }
                }
              }
            }
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      }) : []

      // Combine all conversations, removing duplicates for hybrids
      const allConversations = [
        ...playerConversations,
        ...hybridAsPlayerConversations,
        ...recruiterConversationsAsInitiator,
        ...recruiterConversationsAsRecipient
      ]
      
      // Remove duplicates (a hybrid might see same conversation twice)
      const uniqueConversations = allConversations.filter((conv, index, self) => 
        index === self.findIndex(c => c.id === conv.id)
      )
      
      conversations = uniqueConversations.sort((a, b) => {
        const aTime = a.lastMessageAt?.getTime() || 0
        const bTime = b.lastMessageAt?.getTime() || 0
        return bTime - aTime
      })
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    )
  }
}

// POST - Create or get existing conversation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { participantId, participantType } = await request.json()

    console.log('Creating conversation:', { 
      currentUser: session.user.id, 
      currentRole: session.user.role,
      participantId, 
      participantType 
    })

    // Players cannot initiate chats - they can only respond to existing conversations
    if (session.user.role === 'PLAYER') {
      // Check if a conversation already exists
      const player = await prisma.player.findFirst({
        where: { userId: session.user.id }
      })

      if (!player) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }

      // Players can only chat with recruiters
      if (participantType === 'PLAYER') {
        return NextResponse.json({ 
          error: 'Players cannot chat with other players.' 
        }, { status: 403 })
      }

      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: participantId }
      })

      if (!recruiter) {
        return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
      }

      // Check if conversation already exists (recruiter must have started it)
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          playerId: player.id,
          recruiterId: recruiter.id
        }
      })

      if (!existingConversation) {
        return NextResponse.json({ 
          error: 'Players cannot initiate chats. Wait for a recruiter to message you first.' 
        }, { status: 403 })
      }

      // Return existing conversation
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Recruiters and Hybrids can initiate chats
    if (session.user.role === 'RECRUITER' || session.user.role === 'HYBRID') {
      const currentRecruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })

      if (!currentRecruiter) {
        return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 })
      }

      // Recruiter-to-Recruiter chat
      if (participantType === 'RECRUITER' || participantType === 'HYBRID') {
        const targetRecruiter = await prisma.recruiter.findFirst({
          where: { userId: participantId }
        })

        if (!targetRecruiter) {
          return NextResponse.json({ error: 'Target recruiter not found' }, { status: 404 })
        }

        // Can't chat with yourself
        if (currentRecruiter.id === targetRecruiter.id) {
          return NextResponse.json({ error: 'Cannot chat with yourself' }, { status: 400 })
        }

        // Check for existing conversation (in either direction)
        let conversation = await prisma.conversation.findFirst({
          where: {
            OR: [
              { recruiterId: currentRecruiter.id, secondRecruiterId: targetRecruiter.id },
              { recruiterId: targetRecruiter.id, secondRecruiterId: currentRecruiter.id }
            ],
            playerId: null
          }
        })

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              recruiterId: currentRecruiter.id,
              secondRecruiterId: targetRecruiter.id,
              playerId: null,
              isActive: true,
              lastMessageAt: new Date()
            }
          })
        } else if (!conversation.isActive) {
          conversation = await prisma.conversation.update({
            where: { id: conversation.id },
            data: { isActive: true }
          })
        }

        return NextResponse.json({ conversationId: conversation.id })
      }

      // Recruiter-to-Player chat
      const player = await prisma.player.findFirst({
        where: { userId: participantId }
      })

      if (!player) {
        return NextResponse.json({ error: 'Player not found' }, { status: 404 })
      }

      // Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          playerId: player.id,
          recruiterId: currentRecruiter.id
        }
      })

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            playerId: player.id,
            recruiterId: currentRecruiter.id,
            isActive: true,
            lastMessageAt: new Date()
          }
        })
      } else if (!conversation.isActive) {
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: { isActive: true }
        })
      }

      return NextResponse.json({ conversationId: conversation.id })
    }

    return NextResponse.json({ error: 'Invalid user role' }, { status: 400 })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}

