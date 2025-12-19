import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true, recruiter: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Deactivate user and associated profiles
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        emailVerified: false
      }
    });

    // Deactivate player profile if exists
    if (user.player) {
      await prisma.player.update({
        where: { id: user.player.id },
        data: { isActive: false }
      });
    }

    // Deactivate recruiter profile if exists
    if (user.recruiter) {
      await prisma.recruiter.update({
        where: { id: user.recruiter.id },
        data: { isActive: false }
      });
    }

    return NextResponse.json({ success: true, message: 'Account deactivated' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    return NextResponse.json({ error: 'Failed to deactivate account' }, { status: 500 });
  }
}
