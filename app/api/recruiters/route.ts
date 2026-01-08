import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const canton = searchParams.get('canton') || ''
    const genderCoached = searchParams.get('genderCoached') || ''
    const positionLookingFor = searchParams.get('positionLookingFor') || ''
    const lookingForMembers = searchParams.get('lookingForMembers') === 'true'
    const userType = searchParams.get('userType') || ''

    // Build where clause - show all active recruiters (users with Recruiter profiles)
    const where: any = {
      isActive: true,
    }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { coachRole: { contains: search, mode: 'insensitive' } },
        { club: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Canton filter
    if (canton) {
      where.canton = canton
    }

    // Gender coached filter
    if (genderCoached) {
      where.genderCoached = genderCoached
    }

    // Position looking for filter
    if (positionLookingFor) {
      where.positionsLookingFor = {
        has: positionLookingFor,
      }
    }

    // Looking for members filter
    if (lookingForMembers) {
      where.lookingForMembers = true
    }

    // User type filter (RECRUITER or HYBRID) - only apply if explicitly requested
    if (userType) {
      where.user = {
        role: userType,
      }
    }

    // Fetch recruiters
    const recruiters = await prisma.recruiter.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            role: true,
            player: {
              select: {
                gender: true,
              },
            },
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            canton: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { lookingForMembers: 'desc' }, // Active recruiters first
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      recruiters,
      total: recruiters.length,
    })
  } catch (error) {
    console.error('Error fetching recruiters:', error)
    return NextResponse.json(
      { error: 'Error Fetching Recruiters' },
      { status: 500 }
    )
  }
}
