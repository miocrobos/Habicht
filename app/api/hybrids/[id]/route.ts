import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Fetch the user with HYBRID role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    })

    if (!user || user.role !== 'HYBRID') {
      return NextResponse.json(
        { error: 'Hybrid user not found' },
        { status: 404 }
      )
    }

    // Fetch the player profile for this user
    const player = await prisma.player.findUnique({
      where: { userId },
      include: {
        currentClub: {
          select: {
            id: true,
            name: true,
            logo: true,
            canton: true,
            town: true,
          },
        },
        clubHistory: {
          orderBy: { startDate: 'desc' },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    })

    // Fetch the recruiter profile for this user
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            canton: true,
            town: true,
          },
        },
        clubHistory: {
          orderBy: { startDate: 'desc' },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
          },
        },
      },
    })

    // Fetch the hybrid profile data
    const hybrid = await prisma.hybrid.findUnique({
      where: { userId },
    })

    // Combine all data
    const hybridProfile = {
      id: userId,
      user,
      player,
      recruiter,
      // Hybrid-specific fields (background, etc.)
      customColor: hybrid?.customColor || null,
      backgroundImage: hybrid?.backgroundImage || null,
      bio: hybrid?.bio || player?.bio || recruiter?.bio || null,
      profileImage: hybrid?.profileImage || player?.profileImage || recruiter?.profileImage || null,
      firstName: hybrid?.firstName || player?.firstName || recruiter?.firstName || user.name?.split(' ')[0] || '',
      lastName: hybrid?.lastName || player?.lastName || recruiter?.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      achievements: hybrid?.achievements || [],
      isActive: hybrid?.isActive ?? true,
      isPublic: hybrid?.isPublic ?? true,
    }

    return NextResponse.json({ hybrid: hybridProfile })
  } catch (error) {
    console.error('Error fetching hybrid profile:', error)
    return NextResponse.json(
      { error: 'Error fetching hybrid profile' },
      { status: 500 }
    )
  }
}

// PUT - Update hybrid profile shared data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify the user is updating their own profile
    if (session.user.id !== params.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const userId = params.id
    const data = await request.json()

    // Verify user is a hybrid
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'User is not a hybrid' }, { status: 400 })
    }

    // Update the hybrid profile with shared data
    const updatedHybrid = await prisma.hybrid.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        profileImage: data.profileImage,
        nationality: data.nationality,
        phone: data.phone,
        canton: data.canton || null,
        municipality: data.municipality,
        bio: data.bio,
      }
    })

    return NextResponse.json({ success: true, hybrid: updatedHybrid })
  } catch (error) {
    console.error('Error updating hybrid profile:', error)
    return NextResponse.json(
      { error: 'Error updating hybrid profile' },
      { status: 500 }
    )
  }
}
