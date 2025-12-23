import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ isWatched: false })
    }

    // Only check for recruiters and hybrid users
    if (session.user.role !== 'RECRUITER' && session.user.role !== 'HYBRID') {
      return NextResponse.json({ isWatched: false })
    }

    const watchlistEntry = await prisma.watchlist.findUnique({
      where: {
        playerId_watcherId: {
          playerId: params.id,
          watcherId: session.user.id
        }
      }
    })

    return NextResponse.json({ isWatched: !!watchlistEntry })
  } catch (error) {
    console.error('Check watchlist error:', error)
    return NextResponse.json({ isWatched: false })
  }
}
