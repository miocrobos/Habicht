import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Verify this is the user's own profile
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!player || player.userId !== session.user.id) {
      return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 })
    }

    // Delete all PlayerView records for this player
    await prisma.playerView.deleteMany({
      where: { playerId: params.id }
    })

    return NextResponse.json({ success: true, message: 'Profil-Aaluege zruckgsetzt' })
  } catch (error) {
    console.error('Error resetting views:', error)
    return NextResponse.json(
      { error: 'Fehler beim Zrucksetze vo de Aaluege' },
      { status: 500 }
    )
  }
}
