import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Fetch user's notifications
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to load notifications' },
      { status: 500 }
    )
  }
}

// PUT - Update notification preferences
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { notifyChatMessages, notifyPlayerLooking, notifyRecruiterSearching } = data

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(notifyChatMessages !== undefined && { notifyChatMessages }),
        ...(notifyPlayerLooking !== undefined && { notifyPlayerLooking }),
        ...(notifyRecruiterSearching !== undefined && { notifyRecruiterSearching })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
