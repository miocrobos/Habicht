import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 })
    }

    // Get user's player or recruiter ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        player: { select: { id: true } },
        recruiter: { select: { id: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const playerId = user.player?.id
    const recruiterId = user.recruiter?.id

    // Count unread messages where the user is a participant but not the sender
    let unreadCount = 0

    if (playerId) {
      unreadCount += await prisma.message.count({
        where: {
          conversation: {
            playerId: playerId
          },
          status: {
            not: 'READ'
          },
          senderId: {
            not: session.user.id
          }
        }
      })
    }

    if (recruiterId) {
      unreadCount += await prisma.message.count({
        where: {
          conversation: {
            recruiterId: recruiterId
          },
          status: {
            not: 'READ'
          },
          senderId: {
            not: session.user.id
          }
        }
      })
    }

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
