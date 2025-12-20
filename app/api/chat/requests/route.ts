import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// POST - Create a chat request from player to coach
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { recruiterId, playerId, message } = await request.json()

    // Verify player owns this request
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        userId: session.user.id
      }
    })

    if (!player) {
      return NextResponse.json({ error: 'Spieler nicht gefunden' }, { status: 404 })
    }

    // Verify recruiter exists
    const recruiter = await prisma.recruiter.findUnique({
      where: { id: recruiterId },
      include: { club: true }
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Coach nicht gefunden' }, { status: 404 })
    }

    // Check if request already exists
    const existingRequest = await prisma.chatRequest.findFirst({
      where: {
        playerId,
        recruiterId,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Anfrage bereits gesendet' }, { status: 400 })
    }

    // Create chat request
    const chatRequest = await prisma.chatRequest.create({
      data: {
        playerId,
        recruiterId,
        message,
        status: 'PENDING'
      },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            positions: true,
            currentLeague: true
          }
        },
        recruiter: {
          include: {
            club: true
          }
        }
      }
    })

    return NextResponse.json({ chatRequest }, { status: 201 })
  } catch (error) {
    console.error('Chat request error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Anfrage' },
      { status: 500 }
    )
  }
}

// GET - Get all chat requests for current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or 'received'

    let requests: any[] = []

    if (session.user.role === 'PLAYER') {
      // Get player's sent requests
      const player = await prisma.player.findFirst({
        where: { userId: session.user.id }
      })

      if (player) {
        requests = await prisma.chatRequest.findMany({
          where: { playerId: player.id },
          include: {
            recruiter: {
              include: {
                club: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    } else if (session.user.role === 'RECRUITER') {
      // Get coach's received requests
      const recruiter = await prisma.recruiter.findFirst({
        where: { userId: session.user.id }
      })

      if (recruiter) {
        requests = await prisma.chatRequest.findMany({
          where: { recruiterId: recruiter.id },
          include: {
            player: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                positions: true,
                currentLeague: true,
                height: true,
                canton: true,
                city: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      }
    }

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Get requests error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Anfragen' },
      { status: 500 }
    )
  }
}
