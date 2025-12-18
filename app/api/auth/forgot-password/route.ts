import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetVerification } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "E-Mail und Passwort sind erforderlich." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
  }
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Kein Benutzer mit dieser E-Mail gefunden." }, { status: 404 });
  }
  
  // Delete any existing password reset requests for this user
  await prisma.passwordResetRequest.deleteMany({
    where: { userId: user.id }
  });
  
  // Generate a token for password reset verification
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  // Save token and new password hash (pending verification)
  const passwordHash = await bcrypt.hash(password, 10);
  console.log('🔐 Creating password reset request for:', email);
  console.log('📧 Token generated:', token);
  
  await prisma.passwordResetRequest.create({
    data: {
      userId: user.id,
      email,
      token,
      newPasswordHash: passwordHash,
      createdAt: new Date(),
    },
  });
  console.log('✅ Password reset request created successfully');
  
  // Send verification email
  const emailSent = await sendPasswordResetVerification({
    email,
    name: user.name || email,
    token,
  });
  console.log('📧 Email sent:', emailSent);
  
  return NextResponse.json({ message: "Bitte prüfe deine E-Mails, um die Passwortänderung zu bestätigen." });
}
