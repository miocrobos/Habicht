import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch a single player request
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

    const playerRequest = await prisma.playerRequest.findUnique({
      where: { id },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
            town: true,
          }
        }
      }
    })

    if (!playerRequest) {
      return NextResponse.json({ error: 'Player request not found' }, { status: 404 })
    }

    return NextResponse.json({ request: playerRequest })
  } catch (error) {
    console.error('Error fetching player request:', error)
    return NextResponse.json({ error: 'Failed to fetch player request' }, { status: 500 })
  }
}

// PATCH - Update or close a player request (creator only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Find the existing request
    const existingRequest = await prisma.playerRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Player request not found' }, { status: 404 })
    }

    // Only the creator can update the request
    if (existingRequest.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the creator can update this request' }, { status: 403 })
    }

    const updateData: any = {}

    // Handle closing the request
    if (body.status === 'CLOSED') {
      updateData.status = 'CLOSED'
      updateData.closedAt = new Date()
    }

    // Handle reopening the request
    if (body.status === 'OPEN' && existingRequest.status === 'CLOSED') {
      updateData.status = 'OPEN'
      updateData.closedAt = null
    }

    // Handle other updates (only if request is still open)
    if (existingRequest.status === 'OPEN') {
      if (body.title !== undefined) updateData.title = body.title
      if (body.description !== undefined) updateData.description = body.description
      if (body.positionNeeded !== undefined) updateData.positionNeeded = body.positionNeeded
      if (body.contractType !== undefined) updateData.contractType = body.contractType
      if (body.gender !== undefined) updateData.gender = body.gender || null
      if (body.league !== undefined) updateData.league = body.league || null
      if (body.salary !== undefined) updateData.salary = body.salary || null
      if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null
      if (body.requirements !== undefined) updateData.requirements = body.requirements || null
    }

    const updatedRequest = await prisma.playerRequest.update({
      where: { id },
      data: updateData,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
          }
        }
      }
    })

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    console.error('Error updating player request:', error)
    return NextResponse.json({ error: 'Failed to update player request' }, { status: 500 })
  }
}

// DELETE - Delete a player request (creator only)
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

    // Find the existing request
    const existingRequest = await prisma.playerRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Player request not found' }, { status: 404 })
    }

    // Only the creator can delete the request
    if (existingRequest.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Only the creator can delete this request' }, { status: 403 })
    }

    await prisma.playerRequest.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting player request:', error)
    return NextResponse.json({ error: 'Failed to delete player request' }, { status: 500 })
  }
}
