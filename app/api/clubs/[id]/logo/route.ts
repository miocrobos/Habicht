import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { logo } = await request.json()
    const clubId = params.id

    if (!logo) {
      return NextResponse.json(
        { error: 'Logo is required' },
        { status: 400 }
      )
    }

    // Update club logo
    const club = await prisma.club.update({
      where: { id: clubId },
      data: { logo },
      select: {
        id: true,
        name: true,
        logo: true
      }
    })

    return NextResponse.json({ 
      success: true,
      club 
    })
  } catch (error) {
    console.error('Error updating club logo:', error)
    return NextResponse.json(
      { error: 'Failed to update club logo' },
      { status: 500 }
    )
  }
}
