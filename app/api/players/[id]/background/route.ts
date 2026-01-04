import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to verify player ownership
async function verifyPlayerOwnership(session: any, playerId: string): Promise<boolean> {
  // Check if session user has playerId directly
  if (session.user?.playerId === playerId) {
    return true;
  }
  
  // For HYBRID users, check if the player belongs to this user
  if (session.user?.role === 'HYBRID') {
    const player = await prisma.player.findUnique({
      where: { id: playerId }
    });
    return player?.userId === session.user.id;
  }
  
  return false;
}

// POST handler (legacy, not used by frontend)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(await verifyPlayerOwnership(session, params.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customColor } = await req.json();

  try {
    await prisma.player.update({
      where: { id: params.id },
      data: {
        customColor,
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
  
  if (!session || !(await verifyPlayerOwnership(session, params.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    // Accept customColor as JSON string containing all background data
    await prisma.player.update({
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
