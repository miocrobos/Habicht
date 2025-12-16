import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Delete a specific video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nid Aamäldet' },
        { status: 401 }
      );
    }

    await prisma.video.delete({
      where: {
        id: params.videoId,
        playerId: params.id, // Ensure video belongs to this player
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video Erfolgriich Gl\u00f6scht',
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Fehler Bim L\u00f6sche Vo Video' },
      { status: 500 }
    );
  }
}

// Update a specific video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
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
    const { url, title, description, videoType } = body;

    const video = await prisma.video.update({
      where: {
        id: params.videoId,
        playerId: params.id,
      },
      data: {
        ...(url && { url }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(videoType && { videoType }),
      },
    });

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Fehler Bim Aktualisiere Vo Video' },
      { status: 500 }
    );
  }
}
