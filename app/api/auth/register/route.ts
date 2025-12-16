import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, playerData } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Alli Fälder Sin Erforderlich' },
        { status: 400 }
      )
    }

    // Validate player data if role is PLAYER
    if (role === 'PLAYER' && playerData) {
      if (!playerData.profileImage) {
        return NextResponse.json(
          { error: 'Profilbild Isch Erforderlich' },
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
        { error: 'E-Mail Isch Scho Registriert' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with player data if applicable
    if (role === 'PLAYER' && playerData) {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'PLAYER',
          verificationToken,
          verificationTokenExpiry,
          emailVerified: false,
          player: {
            create: {
              firstName: playerData.firstName,
              lastName: playerData.lastName,
              dateOfBirth: new Date(playerData.dateOfBirth),
              gender: playerData.gender,
              positions: playerData.positions || [],
              height: playerData.height,
              weight: playerData.weight,
              spikeHeight: playerData.spikeHeight,
              blockHeight: playerData.blockHeight,
              canton: playerData.canton,
              city: playerData.city || 'Unknown',
              currentLeague: playerData.currentLeague || 'FIRST_LEAGUE',
              desiredLeague: playerData.desiredLeague,
              interestedClubs: playerData.interestedClubs || [],
              achievements: playerData.achievements || [],
              employmentStatus: playerData.employmentStatus,
              occupation: playerData.occupation,
              schoolName: playerData.schoolName,
              schoolType: playerData.schoolType,
              isStudent: playerData.employmentStatus === 'STUDENT_FULL_TIME' || playerData.employmentStatus === 'STUDENT_PART_TIME',
              graduationYear: playerData.graduationYear,
              phone: playerData.phone,
              instagram: playerData.instagram,
              tiktok: playerData.tiktok,
              youtube: playerData.youtube,
              highlightVideo: playerData.highlightVideo,
              swissVolleyLicense: playerData.swissVolleyLicense,
              skillReceiving: playerData.skillReceiving || 0,
              skillServing: playerData.skillServing || 0,
              skillAttacking: playerData.skillAttacking || 0,
              skillBlocking: playerData.skillBlocking || 0,
              skillDefense: playerData.skillDefense || 0,
              profileImage: playerData.profileImage, // Required
              coverImage: playerData.coverImage, // Optional
              bio: playerData.bio, // Player description
              lookingForClub: playerData.lookingForClub || false,
              nationality: playerData.nationality || 'Swiss',
              // Create club history entries
              clubHistory: playerData.clubHistory && playerData.clubHistory.length > 0 ? {
                create: playerData.clubHistory.map((club: any) => ({
                  clubName: club.clubName,
                  clubLogo: club.logo || null,
                  clubCountry: club.country || 'Switzerland',
                  clubWebsiteUrl: club.clubWebsiteUrl || null,
                  league: club.league || null,
                  startDate: club.yearFrom ? new Date(club.yearFrom, 0, 1) : new Date(),
                  endDate: club.currentClub ? null : (club.yearTo ? new Date(club.yearTo, 11, 31) : null),
                  currentClub: club.currentClub || false,
                }))
              } : undefined,
            },
          },
        },
        include: {
          player: {
            include: {
              clubHistory: true,
            },
          },
        },
      })

      // Send verification email
      const emailSent = await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationToken,
      })

      return NextResponse.json({
        success: true,
        emailSent,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        playerId: user.player?.id,
      })
    }

    // Create user without player data
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'PLAYER',
        verificationToken,
        verificationTokenExpiry,
        emailVerified: false,
      },
    })

    // Send verification email
    const emailSent = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    })

    return NextResponse.json({
      success: true,
      emailSent,
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
      { error: 'Fehler Bi Dä Registrierig' },
      { status: 500 }
    )
  }
}
