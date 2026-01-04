import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendAddedToWatchlistNotification } from '@/lib/email'

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

    // Transform to include firstName/lastName at top level for easier access
    const transformedWatchlist = watchlist.map(item => ({
      ...item,
      player: {
        ...item.player,
        firstName: item.player.firstName,
        lastName: item.player.lastName,
        profileImage: item.player.profileImage
      }
    }))

    // Mark watchlist-related notifications as read when watchlist is viewed
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        type: { in: ['WATCHLIST_UPDATE'] },
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({ watchlist: transformedWatchlist })
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

    // Check if player exists and get their info
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
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

    // Get watcher's name for notification
    const watcher = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, role: true }
    })

    const watcherName = watcher?.name || 'Someone'

    // Create in-app notification for the player
    try {
      await prisma.notification.create({
        data: {
          userId: player.user.id,
          type: 'WATCHLIST_ADD',
          title: 'Added to Watchlist',
          message: `${watcherName} has added you to their watchlist`,
          actionUrl: '/settings',
          senderId: session.user.id,
          senderName: watcherName,
          read: false
        }
      })

      // Send email notification to the player
      if (player.user.email) {
        await sendAddedToWatchlistNotification({
          recipientEmail: player.user.email,
          recipientName: player.firstName || player.user.name || 'Player',
          watcherName: watcherName,
          watcherRole: session.user.role
        })
      }

      console.log(`✅ Watchlist add notification sent to player ${playerId}`)
    } catch (notifError) {
      console.error('Error sending watchlist add notification:', notifError)
      // Don't fail the request if notification fails
    }

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
