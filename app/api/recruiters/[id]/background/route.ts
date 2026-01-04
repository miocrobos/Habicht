import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST handler (legacy, not used by frontend)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.recruiterId !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customColor } = await req.json();

  try {
    await prisma.recruiter.update({
      where: { id: params.id },
      data: {
        customColor,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'recruiterProfile.errorSavingRecruiterData' }, { status: 500 });
  }
}

// PUT handler (used by frontend)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  // Allow both recruiters and hybrids to update their profile
  if (!session || (session.user?.recruiterId !== params.id && session.user?.role !== 'HYBRID')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // For hybrid users, verify they own this recruiter profile
  if (session.user?.role === 'HYBRID') {
    const recruiter = await prisma.recruiter.findUnique({
      where: { id: params.id }
    });
    if (!recruiter || recruiter.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const body = await req.json();

  try {
    // Build update data object
    const updateData: any = {};
    
    // Background settings
    if (body.backgroundGradient !== undefined) {
      // Store background info as JSON string in customColor field
      updateData.customColor = JSON.stringify({
        backgroundGradient: body.backgroundGradient,
        customColor: body.customColor,
        backgroundImage: body.backgroundImage
      });
    } else if (body.customColor !== undefined) {
      updateData.customColor = body.customColor;
    }
    
    // Profile fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.coachRole !== undefined) updateData.coachRole = body.coachRole;
    if (body.organization !== undefined) updateData.organization = body.organization;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.canton !== undefined) updateData.canton = body.canton;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.tiktok !== undefined) updateData.tiktok = body.tiktok;
    if (body.youtube !== undefined) updateData.youtube = body.youtube;
    if (body.facebook !== undefined) updateData.facebook = body.facebook;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;
    if (body.lookingForMembers !== undefined) updateData.lookingForMembers = body.lookingForMembers;
    if (body.positionsLookingFor !== undefined) updateData.positionsLookingFor = body.positionsLookingFor;
    if (body.genderCoached !== undefined) updateData.genderCoached = body.genderCoached;
    if (body.achievements !== undefined) updateData.achievements = body.achievements.map((a: any) => a.text || a);
    
    // Update recruiter
    await prisma.recruiter.update({
      where: { id: params.id },
      data: updateData,
    });
    
    // Handle club history updates
    if (body.clubHistory !== undefined) {
      // Delete existing club history
      await prisma.recruiterClubHistory.deleteMany({
        where: { recruiterId: params.id }
      });
      
      // Create new club history entries
      if (body.clubHistory.length > 0) {
        const clubHistoryData = body.clubHistory.map((club: any) => ({
          recruiterId: params.id,
          clubName: club.clubName,
          clubLogo: club.logo || null,
          clubCountry: club.country || 'Switzerland',
          role: Array.isArray(club.role) ? club.role : [],
          genderCoached: club.genderCoached || null,
          leagues: Array.isArray(club.leagues) ? club.leagues : [], // Multi-league support
          startDate: new Date(club.yearFrom || new Date().getFullYear(), 0, 1),
          endDate: club.currentClub ? null : (club.yearTo ? new Date(club.yearTo, 11, 31) : null),
          currentClub: club.currentClub || false,
        }));
        
        await prisma.recruiterClubHistory.createMany({
          data: clubHistoryData
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving recruiter profile:', error);
    return NextResponse.json({ error: 'recruiterProfile.errorSavingRecruiterData' }, { status: 500 });
  }
}
