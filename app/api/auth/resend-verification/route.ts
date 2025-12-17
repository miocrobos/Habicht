import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail Isch Erforderlich' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'Falls En Account Mit Dere E-Mail Existiert, Isch Es Verification E-Mail Gschickt Worde.'
      });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'E-Mail Isch Scho Verifiziert' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    const emailSent = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      verificationToken,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Fehler Bim E-Mail Schicke' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification E-Mail Isch Gschickt Worde. Lueg I Dim Postfach.'
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    return NextResponse.json(
      { error: 'En Fehler Isch Ufträtte' },
      { status: 500 }
    );
  }
}
