import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    
    // Store token in database (you'll need to add a verificationToken field to your User model)
    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
        emailVerified: false,
      },
    })

    // Send verification email
    const transporter = nodemailer.createTransport({
      // Configure your email service
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${verificationToken}`

    await transporter.sendMail({
      from: '"Habicht Volleyball" <noreply@habicht-volleyball.ch>',
      to: email,
      subject: 'Willkommen bei Habicht - Bestätige deine E-Mail',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px; background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%); }
            .logo { width: 80px; height: 80px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 15px 30px; background: #FF0000; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${process.env.NEXT_PUBLIC_URL}/eagle-logo.png" alt="Habicht Logo" class="logo">
              <h1 style="color: white; margin: 10px 0;">Habicht Volleyball</h1>
            </div>
            
            <div class="content">
              <h2>Willkommen bei Habicht!</h2>
              <p>Vielen Dank für deine Registrierung auf der Habicht Volleyball Scouting Plattform.</p>
              <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Button klickst:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">E-Mail bestätigen</a>
              </div>
              
              <p>Oder kopiere diesen Link in deinen Browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationUrl}</p>
              
              <p>Falls du dich nicht registriert hast, ignoriere diese E-Mail bitte.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 Habicht Volleyball Scouting Platform</p>
              <p>Swiss Volley | Alle Ligen | Ein Ort</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ message: 'Verification email sent' })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    )
  }
}
