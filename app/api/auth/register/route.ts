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
      // Normalize club name helper function
      const normalizeClubName = (name: string): string => {
        return name
          .replace(/\s+\d+$/, '')  // Remove " 2", " 3", etc. at end
          .replace(/\s+[IVX]+$/, '') // Remove Roman numerals at end
          .replace(/\s+U\d{2}$/i, '') // Remove U19, U20, U21, U23 at end
          .trim()
      }

      // Find current club and get its ID before creating player
      let currentClubId: string | null = null
      let playerCurrentLeague: string | null = null
      if (playerData.clubHistory && playerData.clubHistory.length > 0) {
        const currentClubEntry = playerData.clubHistory.find((club: any) => club.currentClub)
        if (currentClubEntry && currentClubEntry.clubName) {
          const normalizedName = normalizeClubName(currentClubEntry.clubName)
          
          // Map display league name to database enum value
          const leagueMap: Record<string, string> = {
            'NLA': 'NLA',
            'NLB': 'NLB',
            '1. Liga': 'FIRST_LEAGUE',
            '2. Liga': 'SECOND_LEAGUE',
            '3. Liga': 'THIRD_LEAGUE',
            '4. Liga': 'FOURTH_LEAGUE',
            'U23': 'U23',
            'U19': 'U19',
            'U17': 'U17',
          }
          playerCurrentLeague = leagueMap[currentClubEntry.league] || null
          
          // Try to find or create the current club
          let existingClub = await prisma.club.findFirst({
            where: { name: normalizedName }
          })

          if (!existingClub && currentClubEntry.country === 'Switzerland') {
            // Create club if it doesn't exist
            const leagueFieldMap: Record<string, { men: string, women: string }> = {
              'NLA': { men: 'hasNLAMen', women: 'hasNLAWomen' },
              'NLB': { men: 'hasNLBMen', women: 'hasNLBWomen' },
              '1. Liga': { men: 'has1LigaMen', women: 'has1LigaWomen' },
              '2. Liga': { men: 'has2LigaMen', women: 'has2LigaWomen' },
              '3. Liga': { men: 'has3LigaMen', women: 'has3LigaWomen' },
              '4. Liga': { men: 'has4LigaMen', women: 'has4LigaWomen' },
              'U23': { men: 'hasU23Men', women: 'hasU23Women' },
              'U19': { men: 'hasU19Men', women: 'hasU19Women' },
              'U17': { men: 'hasU17Men', women: 'hasU17Women' },
            }

            const isMale = playerData.gender === 'MALE'
            const leagueFields = leagueFieldMap[currentClubEntry.league]
            const leagueFieldToUpdate = leagueFields ? (isMale ? leagueFields.men : leagueFields.women) : null

            const clubData: any = {
              name: normalizedName,
              canton: playerData.canton || 'ZH',
              town: playerData.city || 'Unknown',
              logo: currentClubEntry.logo || null,
              website: currentClubEntry.clubWebsiteUrl || null,
            }

            if (leagueFieldToUpdate) {
              clubData[leagueFieldToUpdate] = true
            }

            existingClub = await prisma.club.create({
              data: clubData
            })
          }

          if (existingClub) {
            currentClubId = existingClub.id
            
            // Update club league flags if needed
            if (currentClubEntry.league) {
              const leagueFieldMap: Record<string, { men: string, women: string }> = {
                'NLA': { men: 'hasNLAMen', women: 'hasNLAWomen' },
                'NLB': { men: 'hasNLBMen', women: 'hasNLBWomen' },
                '1. Liga': { men: 'has1LigaMen', women: 'has1LigaWomen' },
                '2. Liga': { men: 'has2LigaMen', women: 'has2LigaWomen' },
                '3. Liga': { men: 'has3LigaMen', women: 'has3LigaWomen' },
                '4. Liga': { men: 'has4LigaMen', women: 'has4LigaWomen' },
                'U23': { men: 'hasU23Men', women: 'hasU23Women' },
                'U19': { men: 'hasU19Men', women: 'hasU19Women' },
                'U17': { men: 'hasU17Men', women: 'hasU17Women' },
              }

              const isMale = playerData.gender === 'MALE'
              const leagueFields = leagueFieldMap[currentClubEntry.league]
              const leagueFieldToUpdate = leagueFields ? (isMale ? leagueFields.men : leagueFields.women) : null

              if (leagueFieldToUpdate) {
                const updateData: any = {}
                updateData[leagueFieldToUpdate] = true
                
                // CRITICAL: NEVER overwrite an existing uploaded logo
                // Only set logo if club has NO logo OR has the default volleyball emoji
                // This protects logos uploaded via admin panel
                if (currentClubEntry.logo && 
                    (!existingClub.logo || existingClub.logo === '🏐' || existingClub.logo.length <= 2)) {
                  // Only update if the new logo is a valid image URL (starts with http or data:)
                  if (currentClubEntry.logo.startsWith('http') || currentClubEntry.logo.startsWith('data:')) {
                    updateData.logo = currentClubEntry.logo
                  }
                  // Skip emoji logos from the static database file
                }

                await prisma.club.update({
                  where: { id: existingClub.id },
                  data: updateData
                })
              }
            }
          }
        }
      }

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
              currentLeague: playerCurrentLeague || playerData.currentLeague || 'FIRST_LEAGUE',
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
              // Link to current club
              currentClubId: currentClubId,
              // Create club history entries and update clubs
              clubHistory: playerData.clubHistory && playerData.clubHistory.length > 0 ? {
                create: await Promise.all(playerData.clubHistory.map(async (club: any) => {
                  let clubId = null
                  
                  // Normalize club name - remove trailing numbers/suffixes like " 2", " 3", " II", " III"
                  const normalizeClubName = (name: string): string => {
                    return name
                      .replace(/\s+\d+$/, '')  // Remove " 2", " 3", etc. at end
                      .replace(/\s+[IVX]+$/, '') // Remove Roman numerals at end
                      .replace(/\s+U\d{2}$/i, '') // Remove U19, U20, U21, U23 at end
                      .trim()
                  }
                  
                  const normalizedClubName = normalizeClubName(club.clubName)
                  
                  // Try to find or create the club in the database
                  if (normalizedClubName && club.currentClub) {
                    try {
                      // Check if club exists (using normalized name)
                      let existingClub = await prisma.club.findFirst({
                        where: { name: normalizedClubName }
                      })

                      // Determine which league field to update based on league and gender
                      const leagueFieldMap: Record<string, { men: string, women: string }> = {
                        'NLA': { men: 'hasNLAMen', women: 'hasNLAWomen' },
                        'NLB': { men: 'hasNLBMen', women: 'hasNLBWomen' },
                        '1. Liga': { men: 'has1LigaMen', women: 'has1LigaWomen' },
                        '2. Liga': { men: 'has2LigaMen', women: 'has2LigaWomen' },
                        '3. Liga': { men: 'has3LigaMen', women: 'has3LigaWomen' },
                        '4. Liga': { men: 'has4LigaMen', women: 'has4LigaWomen' },
                        'U23': { men: 'hasU23Men', women: 'hasU23Women' },
                        'U19': { men: 'hasU19Men', women: 'hasU19Women' },
                        'U17': { men: 'hasU17Men', women: 'hasU17Women' },
                      }

                      const isMale = playerData.gender === 'MALE'
                      const leagueFields = leagueFieldMap[club.league]
                      const leagueFieldToUpdate = leagueFields ? (isMale ? leagueFields.men : leagueFields.women) : null

                      if (existingClub) {
                        clubId = existingClub.id
                        // CRITICAL: Only update logo if club has NO logo or only has volleyball emoji AND new logo is a valid URL
                        const updateData: any = {}
                        
                        // Only update if club has no logo or only has volleyball emoji (never overwrite uploaded logos)
                        if (club.logo && (!existingClub.logo || existingClub.logo === '🏐' || existingClub.logo.length <= 2)) {
                          // Only update if new logo is a valid URL, not an emoji from static database
                          if (club.logo.startsWith('http') || club.logo.startsWith('data:')) {
                            updateData.logo = club.logo
                          }
                          // Skip emoji logos - they should never replace uploaded logos
                        }
                        
                        // Mark that club has a team in this league/gender
                        if (leagueFieldToUpdate) {
                          updateData[leagueFieldToUpdate] = true
                        }
                        
                        if (Object.keys(updateData).length > 0) {
                          await prisma.club.update({
                            where: { id: existingClub.id },
                            data: updateData
                          })
                        }
                      } else if (club.league && club.country === 'Switzerland') {
                        // Create new Swiss club with league flag set (using normalized name)
                        const clubData: any = {
                          name: normalizedClubName,
                          canton: playerData.canton || 'ZH',
                          town: playerData.city || 'Unknown',
                          logo: club.logo || null,
                          website: club.clubWebsiteUrl || null,
                        }
                        
                        // Set the appropriate league flag
                        if (leagueFieldToUpdate) {
                          clubData[leagueFieldToUpdate] = true
                        }
                        
                        existingClub = await prisma.club.create({
                          data: clubData
                        })
                        clubId = existingClub.id
                      }
                    } catch (error) {
                      console.error('Error creating/updating club:', error)
                    }
                  }

                  return {
                    clubName: normalizedClubName, // Store normalized name in clubHistory
                    clubId: clubId,
                    clubLogo: club.logo || null,
                    clubCountry: club.country || 'Switzerland',
                    clubWebsiteUrl: club.clubWebsiteUrl || null,
                    league: club.league || null,
                    startDate: club.yearFrom ? new Date(club.yearFrom, 0, 1) : new Date(),
                    endDate: club.currentClub ? null : (club.yearTo ? new Date(club.yearTo, 11, 31) : null),
                    currentClub: club.currentClub || false,
                  }
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
