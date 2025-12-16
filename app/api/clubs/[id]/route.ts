import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // For now, allow any authenticated user - add admin check later
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { website, logo } = data

    // Get current club to check if logo already exists
    const currentClub = await prisma.club.findUnique({
      where: { id: params.id },
      select: { logo: true }
    })

    // Prepare update data
    const updateData: any = {}
    
    // Only update website if provided
    if (website !== undefined) {
      updateData.website = website || null
    }
    
    // CRITICAL: Only update logo if a NEW logo is provided AND it's not empty
    // NEVER overwrite an existing logo with null or empty string
    if (logo && logo.trim() !== '') {
      updateData.logo = logo
    }
    // If trying to set logo to null/empty but club already has a logo, keep the existing logo
    // This prevents accidental logo deletion

    const updatedClub = await prisma.club.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ club: updatedClub })
  } catch (error) {
    console.error('Error updating club:', error)
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to explicitly remove a club logo (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only admins can delete logos
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'remove-logo') {
      const updatedClub = await prisma.club.update({
        where: { id: params.id },
        data: { logo: null },
      })
      return NextResponse.json({ club: updatedClub, message: 'Logo removed' })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error deleting club data:', error)
    return NextResponse.json(
      { error: 'Failed to delete club data' },
      { status: 500 }
    )
  }
}
