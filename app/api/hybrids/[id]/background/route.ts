import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST handler (legacy, not used by frontend)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // Hybrid users have both playerId and recruiterId, check if either matches
  if (!session || (session.user?.playerId !== params.id && session.user?.recruiterId !== params.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customColor, backgroundImage } = await req.json();

  try {
    await prisma.hybrid.update({
      where: { id: params.id },
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
  // Hybrid users have both playerId and recruiterId, check if either matches
  if (!session || (session.user?.playerId !== params.id && session.user?.recruiterId !== params.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    // Accept customColor as JSON string containing all background data
    await prisma.hybrid.update({
      where: { id: params.id },
      data: {
        customColor: body.customColor,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'playerProfile.errorSavingPlayerData' }, { status: 500 });
  }
}
