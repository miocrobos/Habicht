import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET all court / venue locations (Standorte)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const canton = searchParams.get('canton')

    const courts = await prisma.court.findMany({
      where: canton ? { canton: canton as any } : undefined,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ courts })
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json({ courts: [] }, { status: 500 })
  }
}

// POST create a court location (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      address,
      city,
      canton,
      latitude,
      longitude,
      indoor,
      courtsCount,
      website,
      imageUrl,
    } = body

    if (!name || !address || !city || !canton || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'Name, address, city, canton, latitude and longitude are required' },
        { status: 400 }
      )
    }

    const court = await prisma.court.create({
      data: {
        name,
        description: description || null,
        address,
        city,
        canton: canton as any,
        latitude: Number(latitude),
        longitude: Number(longitude),
        indoor: indoor !== false,
        courtsCount: Number(courtsCount) || 1,
        website: website || null,
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json({ court }, { status: 201 })
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 })
  }
}
