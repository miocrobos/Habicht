import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url))
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
      include: {
        player: true,
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?error=token_expired', request.url))
    }

    // Mark email as verified and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    })

    // Redirect to player profile if player, otherwise to login with success
    if (user.role === 'PLAYER' && user.player) {
      return NextResponse.redirect(
        new URL(`/players/${user.player.id}?verified=true`, request.url)
      )
    }

    return NextResponse.redirect(new URL('/auth/login?verified=true', request.url))
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', request.url))
  }
}
