import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const data = await request.json()
    const { notifyChatMessages, notifyPlayerLooking, notifyRecruiterSearching } = data

    // Update user notification preferences
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
      { error: 'Fehler beim Aktualisieren der Benachrichtigungseinstellungen' },
      { status: 500 }
    )
  }
}
