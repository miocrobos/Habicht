import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Upload a new photo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify ownership
    if (session.user.playerId !== params.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Check if user is verified
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true }
    });

    if (!user?.emailVerified) {
      return NextResponse.json(
        { error: 'Email not verified. Please verify your email to upload photos.' },
        { status: 403 }
      );
    }

    // Check photo count
    const photoCount = await prisma.playerPhoto.count({
      where: { playerId: params.id }
    });

    if (photoCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 photos allowed' },
        { status: 400 }
      );
    }

    // Accept file upload via multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Photo file is required' },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage (demo only)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Photo = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Create photo with order based on current count
    const photo = await prisma.playerPhoto.create({
      data: {
        playerId: params.id,
        photoUrl: base64Photo,
        order: photoCount,
      }
    });

    return NextResponse.json({
      success: true,
      photo
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// GET - Get all photos for a player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photos = await prisma.playerPhoto.findMany({
      where: { playerId: params.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
