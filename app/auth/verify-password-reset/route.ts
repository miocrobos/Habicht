import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?error=invalid_token", req.url));
  }

  try {
    // Find the reset request
    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRequest) {
      return NextResponse.redirect(new URL("/auth/login?error=invalid_token", req.url));
    }

    // Check if request is less than 24 hours old
    const hoursSinceRequest = (Date.now() - resetRequest.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceRequest > 24) {
      await prisma.passwordResetRequest.delete({ where: { id: resetRequest.id } });
      return NextResponse.redirect(new URL("/auth/login?error=token_expired", req.url));
    }

    // Update user's password
    await prisma.user.update({
      where: { id: resetRequest.userId },
      data: { password: resetRequest.newPasswordHash },
    });

    // Delete the reset request
    await prisma.passwordResetRequest.delete({ where: { id: resetRequest.id } });

    // Redirect to login with success message
    return NextResponse.redirect(new URL("/auth/login?success=password_reset", req.url));
  } catch (error) {
    console.error("Error verifying password reset:", error);
    return NextResponse.redirect(new URL("/auth/login?error=server_error", req.url));
  }
}
