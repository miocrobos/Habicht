import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST handler (legacy, not used by frontend)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.id !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { customColor } = await req.json();

  try {
    await prisma.recruiter.update({
      where: { id: params.id },
      data: {
        customColor,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'recruiterProfile.errorSavingRecruiterData' }, { status: 500 });
  }
}

// PUT handler (used by frontend)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.id !== params.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  try {
    await prisma.recruiter.update({
      where: { id: params.id },
      data: {
        customColor: body.customColor,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'recruiterProfile.errorSavingRecruiterData' }, { status: 500 });
  }
}
