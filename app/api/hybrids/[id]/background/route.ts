import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST handler (legacy, not used by frontend)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // Check if the session user is the owner of this hybrid profile
  if (!session || session.user?.id !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customColor, backgroundImage } = await req.json();

  try {
    await prisma.hybrid.update({
      where: { userId: params.id },
      data: {
        customColor,
        backgroundImage,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'playerProfile.errorSavingPlayerData' }, { status: 500 });
  }
}

// PUT handler (used by frontend)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // Check if the session user is the owner of this hybrid profile
  if (!session || session.user?.id !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    // First check if user exists and is HYBRID role
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, role: true },
    });

    if (!user || user.role !== 'HYBRID') {
      return NextResponse.json({ error: 'User is not a hybrid' }, { status: 400 });
    }

    // Upsert the hybrid record - create if doesn't exist, update if it does
    await prisma.hybrid.upsert({
      where: { userId: params.id },
      update: {
        customColor: body.customColor,
      },
      create: {
        userId: params.id,
        firstName: user.name?.split(' ')[0] || 'User',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        customColor: body.customColor,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving hybrid background:', error);
    return NextResponse.json({ error: 'playerProfile.errorSavingPlayerData' }, { status: 500 });
  }
}
