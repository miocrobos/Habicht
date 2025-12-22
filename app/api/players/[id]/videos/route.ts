import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Get all videos for a player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const videos = await prisma.video.findMany({
      where: { playerId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to load videos' },
      { status: 500 }
    );
  }
}

// Add a new video
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nid Aamäldet' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, title, description, highlightType } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Video URL Isch Erforderlich' },
        { status: 400 }
      );
    }

    const video = await prisma.video.create({
      data: {
        playerId: params.id,
        videoUrl: url,
        videoType: 'UPLOADED',
        title: title || '',
        description: description || '',
        highlightType: highlightType || 'HIGHLIGHTS',
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json(
      { error: 'Failed to add video' },
      { status: 500 }
    );
  }
}
