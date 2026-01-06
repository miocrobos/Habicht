import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Mark all watchlist-related notifications as read
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Only recruiters and hybrid users can have watchlists
    if (session.user.role !== 'RECRUITER' && session.user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Mark all watchlist-related notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        type: { in: ['WATCHLIST_UPDATE', 'PROFILE_UPDATE'] },
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      markedAsRead: result.count 
    })
  } catch (error) {
    console.error('Mark watchlist as viewed error:', error)
    return NextResponse.json(
      { error: 'Failed to mark as viewed' },
      { status: 500 }
    )
  }
}
