import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get user's watchlist
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only recruiters and hybrid users can have watchlists
    if (session.user.role !== 'RECRUITER' && session.user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { watcherId: session.user.id },
      include: {
        player: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            currentClub: {
              select: {
                id: true,
                name: true,
                logo: true,
                canton: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Get watchlist error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// POST - Add player to watchlist
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only recruiters and hybrid users can add to watchlist
    if (session.user.role !== 'RECRUITER' && session.user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { playerId } = await request.json()

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 })
    }

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Check if already in watchlist
    const existing = await prisma.watchlist.findUnique({
      where: {
        playerId_watcherId: {
          playerId,
          watcherId: session.user.id
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already in watchlist' }, { status: 400 })
    }

    // Add to watchlist
    const watchlistEntry = await prisma.watchlist.create({
      data: {
        playerId,
        watcherId: session.user.id
      }
    })

    return NextResponse.json({ success: true, watchlistEntry }, { status: 201 })
  } catch (error) {
    console.error('Add to watchlist error:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

// DELETE - Remove player from watchlist
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 })
    }

    await prisma.watchlist.delete({
      where: {
        playerId_watcherId: {
          playerId,
          watcherId: session.user.id
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}
