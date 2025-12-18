import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Deactivate user account
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        active: false,
        emailVerified: null // Prevent login
      }
    });

    return NextResponse.json({ success: true, message: 'Account deactivated' });
  } catch (error) {
    console.error('Error deactivating account:', error);
    return NextResponse.json({ error: 'Failed to deactivate account' }, { status: 500 });
  }
}
