// Email utility for sending verification emails
// Using Resend API (you'll need to install: npm install resend)
// Or can use nodemailer for other providers

interface SendVerificationEmailParams {
  email: string;
  name: string;
  verificationToken: string;
}

export async function sendVerificationEmail({
  email,
  name,
  verificationToken,
}: SendVerificationEmailParams): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/verify?token=${verificationToken}`;
    
    // For development, just log the verification URL
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('📧 VERIFICATION EMAIL');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('=================================\n');
      return true;
    }

    // In production, you would use a service like Resend, SendGrid, or nodemailer
    // Example with fetch to a generic email API:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UniSports <noreply@unisports.ch>',
        to: email,
        subject: 'Verifizier Dini E-Mail - UniSports',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #DC2626;">Willkomme Bi UniSports!</h1>
            <p>Hallo ${name},</p>
            <p>Danke Für Dini Registrierig! Bitte Verifizier Dini E-Mail-Adresse, Zum Din Account Z Aktiviere.</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              E-Mail Verifiziere
            </a>
            <p>Oder Kopier Die URL I Din Browser:</p>
            <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">
              ${verificationUrl}
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Dä Link Isch 24 Stunde Gültig. Falls Du Dich Nid Registriert Hesch, Ignorier Die E-Mail.
            </p>
          </div>
        `,
      }),
    });

    return response.ok;
    */

    return true; // For now, return true in development
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/auth/reset-password?token=${resetToken}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('🔑 PASSWORD RESET EMAIL');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=================================\n');
      return true;
    }

    // Production implementation here
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
