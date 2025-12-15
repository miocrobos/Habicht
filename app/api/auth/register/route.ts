import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, playerData } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate player data if role is PLAYER
    if (role === 'PLAYER' && playerData) {
      if (!playerData.profileImage) {
        return NextResponse.json(
          { error: 'Profilbild ist erforderlich' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ist bereits registriert' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with player data if applicable
    if (role === 'PLAYER' && playerData) {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'PLAYER',
          player: {
            create: {
              firstName: playerData.firstName,
              lastName: playerData.lastName,
              dateOfBirth: new Date(playerData.dateOfBirth),
              gender: playerData.gender,
              position: playerData.position,
              height: playerData.height,
              weight: playerData.weight,
              jerseyNumber: playerData.jerseyNumber,
              canton: playerData.canton,
              city: playerData.city,
              currentLeague: playerData.currentLeague,
              desiredLeague: playerData.desiredLeague,
              interestedClubs: playerData.interestedClubs || [],
              schoolName: playerData.schoolName,
              schoolType: playerData.schoolType,
              graduationYear: playerData.graduationYear,
              phone: playerData.phone,
              instagramHandle: playerData.instagram,
              bio: playerData.bio,
              profileImage: playerData.profileImage, // Required
              coverImage: playerData.coverImage, // Optional
            },
          },
        },
        include: {
          player: true,
        },
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    }

    // Create user without player data
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'PLAYER',
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Fehler bei der Registrierung' },
      { status: 500 }
    )
  }
}
