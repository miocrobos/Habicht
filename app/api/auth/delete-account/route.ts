import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        player: true,
        recruiter: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete all related data
    if (user.player) {
      // Delete player videos
      await prisma.video.deleteMany({
        where: { playerId: user.player.id }
      });

      // Delete chat requests and conversations related to this player
      await prisma.chatRequest.deleteMany({
        where: { 
          OR: [
            { playerId: user.player.id },
            { recruiterId: user.recruiter?.id }
          ]
        }
      });

      await prisma.conversation.deleteMany({
        where: {
          OR: [
            { playerId: user.player.id },
            { recruiterId: user.recruiter?.id }
          ]
        }
      });

      // Delete player
      await prisma.player.delete({
        where: { id: user.player.id }
      });
    }

    if (user.recruiter) {
      // Delete recruiter data
      await prisma.recruiter.delete({
        where: { id: user.recruiter.id }
      });
    }

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    return NextResponse.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
