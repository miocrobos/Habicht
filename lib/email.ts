interface SendPasswordResetVerificationParams {
  email: string;
  name: string;
  token: string;
}

export async function sendPasswordResetVerification({ email, name, token }: SendPasswordResetVerificationParams): Promise<boolean> {
  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify-password-reset?token=${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('🔑 PASSWORD RESET VERIFICATION EMAIL');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Verify URL: ${verifyUrl}`);
      console.log('=================================\n');
    }
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return true;
    }
    try {
      const resendClient = getResendClient();
      if (!resendClient) {
        console.log('⚠️ Resend client not available');
        return false;
      }
      
      await resendClient.emails.send({
        from: 'Habicht <noreply@habicht-volleyball.ch>',
        to: email,
        subject: 'Bestätige Passwortänderig - Habicht',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    <!-- Logo Header -->
                    <tr>
                      <td style="background-color: #DC2626; padding: 40px 20px; text-align: center;">
                        <img src="https://habicht-volleyball.ch/eagle-logo.png" alt="Habicht Logo" width="100" height="100" style="display: block; margin: 0 auto 20px auto; border: 0; max-width: 100px;" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">Passwortänderig Bestätige</h1>
                      </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${name}!</h2>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Du hesch e Passwortänderig aagfragt. Zum Sicherheit muesch du die Änderig bestätige. Klick uf de Button, um dini Passwortänderig abzuschliesse:</p>
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                          <tr>
                            <td align="center">
                              <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                  <td style="background-color: #DC2626; border-radius: 8px;">
                                    <a href="${verifyUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                                      ✓ Passwortänderig Bestätige
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">Falls du kei Passwortänderig aagfragt hesch, ignorier die E-Mail.</p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0; font-family: Arial, Helvetica, sans-serif;">© 2025 Habicht | Swiss Volleyball Scouting Platform</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      console.log('✅ Password reset verification email sent successfully to:', email);
      return true;
    } catch (emailError) {
      console.error('❌ Error sending password reset verification email:', emailError);
      return false;
    }
  } catch (error) {
    console.error('Error in sendPasswordResetVerification:', error);
    return false;
  }
}
// Email utility for sending verification emails using Resend
// Lazy initialize Resend to avoid build-time errors when API key isn't available
function getResendClient() {
  // Skip initialization during build or when API key is missing
  if (!process.env.RESEND_API_KEY || process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  
  try {
    const { Resend } = require('resend');
    return new Resend(process.env.RESEND_API_KEY);
  } catch (error) {
    console.error('Failed to initialize Resend:', error);
    return null;
  }
}

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
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`;
    
    // For development, log AND send email if API key is present
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('📧 VERIFICATION EMAIL');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('=================================\n');
    }

    // Send email if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return true; // Return true in development even without API key
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      console.log('⚠️ Resend client not available');
      return false;
    }

    try {
      await resendClient.emails.send({
        from: 'Habicht <noreply@habicht-volleyball.ch>',
        to: email,
        subject: '🏐 Willkomme Bi Habicht - Verifizier Dini E-Mail',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    <!-- Logo Header -->
                    <tr>
                      <td style="background-color: #DC2626; padding: 40px 20px; text-align: center;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center">
                              <img src="https://habicht-volleyball.ch/eagle-logo.png" alt="Habicht Logo" width="100" height="100" style="display: block; margin: 0 auto 20px auto; border: 0; max-width: 100px;" />
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">Willkomme Bi Habicht!</h1>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${name}! 🎉</h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  <strong>Danke, Dass Du Teil Vo Üsere Habicht-Community Worde Bisch!</strong>
                </p>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  Du Hesch Din Erschte Schritt Gmacht, Um Dich Mit De Beschte Volleyball-Talente Und Clubs I De Schwiiz Z Verbinde. 
                  Üsi Platform Hilft Dir, Dini Fähigkeite Z Zeige, Neue Möglichkeite Z Entdecke, Und Din Traum Vo Ere Professionelle 
                  Volleyball-Karriere Z Verwirkliche.
                </p>

                <div style="background-color: #fef2f2; border-left: 4px solid #DC2626; padding: 15px; margin: 25px 0;">
                  <p style="color: #991B1B; margin: 0; font-style: italic;">
                    "Success isn't given, it's earned. On the court, in the gym, with blood, sweat, and the occasional spike to the face."
                  </p>
                </div>

                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  Bitte Verifizier Dini E-Mail-Adresse, Um Din Profil Z Aktiviere Und Loszlege:
                </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                          <tr>
                            <td align="center">
                              <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                  <td style="background-color: #DC2626; border-radius: 8px;">
                                    <a href="${verificationUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                                      ✓ E-Mail Jetzt Verifiziere
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                  <strong>Was Chunnsch Als Nächschts?</strong><br>
                  • Erstell Din Profil Vollständig<br>
                  • Upload Dini Bescht Spiel-Videos<br>
                  • Verbind Dich Mit Scouts Und Recruiters<br>
                  • Entdeck Neue Clubs Und Möglichkeite
                </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif;">
                          Dä Verifikations-Link Isch 24 Stunde Gültig.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                          Falls Du Dich Nid Registriert Hesch, Ignorier Die E-Mail Eifach.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0; font-family: Arial, Helvetica, sans-serif;">
                          © 2025 Habicht | Swiss Volleyball Scouting Platform
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log('✅ Verification email sent successfully to:', email);
      return true;
    } catch (emailError) {
      console.error('❌ Error sending verification email:', emailError);
      return false;
    }
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('🔑 PASSWORD RESET EMAIL');
      console.log('=================================');
      console.log(`To: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('=================================\n');
    }

    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured. Email not sent.');
      return true;
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      console.log('⚠️ Resend client not available');
      return false;
    }

    try {
      await resendClient.emails.send({
        from: 'Habicht <noreply@habicht-volleyball.ch>',
        to: email,
        subject: 'Passwort Zruggsetze - Habicht',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 0;">
                  <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff;">
                    <!-- Logo Header -->
                    <tr>
                      <td style="background-color: #DC2626; padding: 40px 20px; text-align: center;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center">
                              <img src="https://habicht-volleyball.ch/eagle-logo.png" alt="Habicht Logo" width="100" height="100" style="display: block; margin: 0 auto 20px auto; border: 0; max-width: 100px;" />
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">Passwort Zruggsetze</h1>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
            <p>Hallo,</p>
            <p>Du Hesch Es Passwort-Reset Aagfragt. Klick Uf De Button Um Din Passwort Z Ändere:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Passwort Zruggsetze
            </a>
            <p>Oder Kopier Die URL I Din Browser:</p>
            <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">
              ${resetUrl}
            </p>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                          Falls Du Kei Reset Aagfragt Hesch, Ignorier Die E-Mail.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0; font-family: Arial, Helvetica, sans-serif;">
                          © 2025 Habicht | Swiss Volleyball Scouting Platform
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      console.log('✅ Password reset email sent successfully to:', email);
      return true;
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      return false;
    }
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    return false;
  }
}
