import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Remove a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get the photo to verify ownership
    const photo = await prisma.playerPhoto.findUnique({
      where: { id: params.photoId },
      include: { player: true }
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (session.user.playerId !== photo.playerId) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Delete the photo
    await prisma.playerPhoto.delete({
      where: { id: params.photoId }
    });

    // Reorder remaining photos
    const remainingPhotos = await prisma.playerPhoto.findMany({
      where: { playerId: photo.playerId },
      orderBy: { order: 'asc' }
    });

    // Update order for remaining photos
    for (let i = 0; i < remainingPhotos.length; i++) {
      await prisma.playerPhoto.update({
        where: { id: remainingPhotos[i].id },
        data: { order: i }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
