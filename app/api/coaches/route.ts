import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clubId = searchParams.get('clubId')
    const playerId = searchParams.get('playerId')

    let where: any = {}

    if (clubId) {
      where.clubId = clubId
    }

    const coaches = await prisma.coach.findMany({
      where,
      include: {
        club: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        role: 'asc',
      },
    })

    const formattedCoaches = coaches.map((coach) => ({
      id: coach.id,
      firstName: coach.firstName,
      lastName: coach.lastName,
      role: coach.role,
      specialization: coach.specialization,
      photoUrl: coach.photoUrl,
      email: coach.email,
      yearsExperience: coach.yearsExperience,
      clubName: coach.club.name,
    }))

    return NextResponse.json({ coaches: formattedCoaches })
  } catch (error) {
    console.error('Error fetching coaches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      clubId,
      role,
      specialization,
      email,
      phone,
      bio,
      yearsExperience,
      certifications,
    } = body

    if (!firstName || !lastName || !clubId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const coach = await prisma.coach.create({
      data: {
        firstName,
        lastName,
        clubId,
        role,
        specialization,
        email,
        phone,
        bio,
        yearsExperience,
        certifications: certifications || [],
      },
    })

    return NextResponse.json({ success: true, coach })
  } catch (error) {
    console.error('Error creating coach:', error)
    return NextResponse.json(
      { error: 'Failed to create coach' },
      { status: 500 }
    )
  }
}
