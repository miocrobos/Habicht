import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - recruiter profiles require login
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to view recruiter profiles' },
        { status: 401 }
      );
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            player: {
              select: {
                gender: true,
                dateOfBirth: true,
              },
            },
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
            town: true,
          },
        },
        clubHistory: {
          orderBy: {
            startDate: 'desc',
          },
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
        videos: true,
      },
    });

    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ recruiter });
  } catch (error) {
    console.error('Error fetching recruiter:', error);
    return NextResponse.json(
      { error: 'Failed to load recruiter data' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingRecruiter = await prisma.recruiter.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingRecruiter) {
      return NextResponse.json(
        { error: 'Recruiter not found' },
        { status: 404 }
      );
    }

    if (existingRecruiter.user.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to edit this profile' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Update the recruiter
    const updatedRecruiter = await prisma.recruiter.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        nationality: data.nationality,
        age: data.age ? parseInt(data.age) : undefined,
        organization: data.organization,
        coachRole: data.coachRole,
        coachingLicense: data.coachingLicense,
        bio: data.bio,
        canton: data.canton,
        province: data.province,
        phone: data.phone,
        instagram: data.instagram,
        tiktok: data.tiktok,
        youtube: data.youtube,
        facebook: data.facebook,
        genderCoached: data.genderCoached,
        positionsLookingFor: data.positionsLookingFor,
        preferredLanguage: data.preferredLanguage,
        lookingForMembers: data.lookingForMembers,
        profileImage: data.profileImage,
        customColor: data.customColor,
        achievements: data.achievements !== undefined ? 
          (Array.isArray(data.achievements) ? data.achievements.map((a: any) => typeof a === 'string' ? a : a.text) : []) 
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
            town: true,
          },
        },
        clubHistory: {
          orderBy: {
            startDate: 'desc',
          },
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
        videos: true,
      },
    });

    // Handle club history updates
    if (data.clubHistory !== undefined && Array.isArray(data.clubHistory)) {
      // Delete existing club history
      await prisma.recruiterClubHistory.deleteMany({
        where: { recruiterId: params.id }
      });
      
      // Find the current club from club history to update the main clubId
      const currentClubEntry = data.clubHistory.find((club: any) => club.currentClub);
      let currentClubId = null;
      
      if (currentClubEntry) {
        // First try to use clubId directly if provided
        if (currentClubEntry.clubId) {
          currentClubId = currentClubEntry.clubId;
        } else if (currentClubEntry.clubName) {
          // Try to find the club in the database by name
          const clubMatch = await prisma.club.findFirst({
            where: {
              name: {
                equals: currentClubEntry.clubName,
                mode: 'insensitive'
              }
            }
          });
          if (clubMatch) {
            currentClubId = clubMatch.id;
          }
        }
      }
      
      // Update the main clubId if we found a current club
      if (currentClubId) {
        await prisma.recruiter.update({
          where: { id: params.id },
          data: { clubId: currentClubId }
        });
      }
      
      // Create new club history entries
      if (data.clubHistory.length > 0) {
        const clubHistoryData = data.clubHistory.map((club: any) => {
          const yearFrom = club.yearFrom || club.startDate;
          const yearTo = club.yearTo || club.endDate;
          // Ensure leagues are unique
          const uniqueLeagues = Array.isArray(club.leagues) ? [...new Set(club.leagues)] : [];
          
          return {
            recruiterId: params.id,
            clubId: club.clubId || null,
            clubName: club.clubName || null,
            clubLogo: club.logo || null,
            clubCountry: club.country || 'Switzerland',
            role: Array.isArray(club.role) ? club.role : [],
            genderCoached: club.genderCoached || null,
            leagues: uniqueLeagues,
            startDate: yearFrom ? new Date(yearFrom) : new Date(),
            endDate: club.currentClub ? null : (yearTo ? new Date(yearTo) : null),
            currentClub: club.currentClub || false,
          };
        });
        
        await prisma.recruiterClubHistory.createMany({
          data: clubHistoryData
        });
      }
    }

    // Refetch the recruiter with updated club data
    const finalRecruiter = await prisma.recruiter.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            canton: true,
            town: true,
          },
        },
        clubHistory: {
          orderBy: {
            startDate: 'desc',
          },
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
        videos: true,
      },
    });

    return NextResponse.json({ recruiter: finalRecruiter });
  } catch (error) {
    console.error('Error updating recruiter:', error);
    return NextResponse.json(
      { error: 'Failed to update recruiter data' },
      { status: 500 }
    );
  }
}
