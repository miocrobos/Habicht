import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Check if user has shown interest and get interest count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if the request exists
    const playerRequest = await prisma.playerRequest.findUnique({
      where: { id },
      select: { id: true, creatorId: true }
    })

    if (!playerRequest) {
      return NextResponse.json({ error: 'Player request not found' }, { status: 404 })
    }

    // Check if the current user has shown interest
    const userInterest = await prisma.playerRequestInterest.findUnique({
      where: {
        requestId_userId: {
          requestId: id,
          userId: session.user.id
        }
      }
    })

    // Get total interest count
    const interestCount = await prisma.playerRequestInterest.count({
      where: { requestId: id }
    })

    return NextResponse.json({
      hasInterest: !!userInterest,
      interestCount,
      isCreator: playerRequest.creatorId === session.user.id
    })
  } catch (error) {
    console.error('Error checking interest:', error)
    return NextResponse.json({ error: 'Failed to check interest' }, { status: 500 })
  }
}

// POST - Express interest in a player request (Players and Hybrids only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only players and hybrids can express interest
    if (session.user.role !== 'PLAYER' && session.user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'Only players and hybrid users can express interest' }, { status: 403 })
    }

    const { id } = await params

    // Check if the request exists and is open
    const playerRequest = await prisma.playerRequest.findUnique({
      where: { id },
      select: { id: true, status: true, creatorId: true }
    })

    if (!playerRequest) {
      return NextResponse.json({ error: 'Player request not found' }, { status: 404 })
    }

    if (playerRequest.status !== 'OPEN') {
      return NextResponse.json({ error: 'Cannot express interest in a closed request' }, { status: 400 })
    }

    // Get user details for the interest record
    let userName = session.user.name || 'Unknown'
    let userImage: string | null = null

    if (session.user.role === 'PLAYER') {
      const player = await prisma.player.findUnique({
        where: { userId: session.user.id },
        select: { firstName: true, lastName: true, profileImage: true }
      })
      if (player) {
        userName = `${player.firstName} ${player.lastName}`
        userImage = player.profileImage
      }
    } else if (session.user.role === 'HYBRID') {
      const hybrid = await prisma.hybrid.findUnique({
        where: { userId: session.user.id },
        select: { firstName: true, lastName: true, profileImage: true }
      })
      if (hybrid) {
        userName = `${hybrid.firstName} ${hybrid.lastName}`
        userImage = hybrid.profileImage
      }
    }

    // Create the interest record
    const interest = await prisma.playerRequestInterest.create({
      data: {
        requestId: id,
        userId: session.user.id,
        userType: session.user.role as 'PLAYER' | 'HYBRID',
        userName,
        userImage
      }
    })

    // Get updated count
    const interestCount = await prisma.playerRequestInterest.count({
      where: { requestId: id }
    })

    return NextResponse.json({
      success: true,
      interest,
      interestCount
    })
  } catch (error: any) {
    // Handle duplicate entry
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'You have already expressed interest in this request' }, { status: 400 })
    }
    console.error('Error expressing interest:', error)
    return NextResponse.json({ error: 'Failed to express interest' }, { status: 500 })
  }
}

// DELETE - Remove interest from a player request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Delete the interest record
    await prisma.playerRequestInterest.delete({
      where: {
        requestId_userId: {
          requestId: id,
          userId: session.user.id
        }
      }
    })

    // Get updated count
    const interestCount = await prisma.playerRequestInterest.count({
      where: { requestId: id }
    })

    return NextResponse.json({
      success: true,
      interestCount
    })
  } catch (error: any) {
    // Handle not found
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 })
    }
    console.error('Error removing interest:', error)
    return NextResponse.json({ error: 'Failed to remove interest' }, { status: 500 })
  }
}
