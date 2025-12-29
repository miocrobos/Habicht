interface SendPasswordResetVerificationParams {
  email: string;
  name: string;
  token: string;
}

export async function sendPasswordResetVerification({ email, name, token }: SendPasswordResetVerificationParams): Promise<boolean> {
  try {
    const verifyUrl = `https://www.habicht-volleyball.ch/auth/verify-password-reset?token=${token}`;
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
    const verificationUrl = `https://www.habicht-volleyball.ch/api/auth/verify?token=${verificationToken}`;
    
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

interface SendChatNotificationParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderRole: string;
  messagePreview: string;
  conversationId: string;
}

export async function sendChatNotification({
  recipientEmail,
  recipientName,
  senderName,
  senderRole,
  messagePreview,
  conversationId,
}: SendChatNotificationParams): Promise<boolean> {
  try {
    const chatUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?tab=messages&conversation=${conversationId}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('💬 CHAT NOTIFICATION EMAIL');
      console.log('=================================');
      console.log(`To: ${recipientEmail}`);
      console.log(`From: ${senderName}`);
      console.log(`Preview: ${messagePreview}`);
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

    await resendClient.emails.send({
      from: 'Habicht <noreply@habicht-volleyball.ch>',
      to: recipientEmail,
      subject: `Neui Nachricht vo ${senderName} - Habicht`,
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
                  <tr>
                    <td style="background-color: #DC2626; padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">💬 Neui Nachricht</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${recipientName}!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        <strong>${senderName}</strong> (${senderRole}) het dir e Nachricht gschickt:
                      </p>
                      <div style="background-color: #f9fafb; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0; font-style: italic;">"${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}"</p>
                      </div>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                              <tr>
                                <td style="background-color: #DC2626; border-radius: 8px;">
                                  <a href="${chatUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold;">
                                    💬 Nachricht Aaluege
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Habicht | Swiss Volleyball Scouting Platform</p>
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

    console.log('✅ Chat notification email sent to:', recipientEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending chat notification:', error);
    return false;
  }
}

interface SendPlayerStatusNotificationParams {
  recipientEmail: string;
  recipientName: string;
  playerName: string;
  playerPosition: string;
  playerLeague: string;
  playerId: string;
}

export async function sendPlayerLookingNotification({
  recipientEmail,
  recipientName,
  playerName,
  playerPosition,
  playerLeague,
  playerId,
}: SendPlayerStatusNotificationParams): Promise<boolean> {
  try {
    const playerUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/players/${playerId}`;
    
    if (!process.env.RESEND_API_KEY) {
      return true;
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      return false;
    }

    await resendClient.emails.send({
      from: 'Habicht <noreply@habicht-volleyball.ch>',
      to: recipientEmail,
      subject: `Neue Spieler suecht Club: ${playerName} - Habicht`,
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
                  <tr>
                    <td style="background-color: #16a34a; padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🏐 Spieler Suecht Club</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${recipientName}!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        <strong>${playerName}</strong> suecht aktiv e neue Club!
                      </p>
                      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #166534; font-size: 14px; margin: 5px 0;"><strong>Position:</strong> ${playerPosition}</p>
                        <p style="color: #166534; font-size: 14px; margin: 5px 0;"><strong>Liga:</strong> ${playerLeague}</p>
                      </div>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                              <tr>
                                <td style="background-color: #16a34a; border-radius: 8px;">
                                  <a href="${playerUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold;">
                                    👤 Profil Aaluege
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Habicht | Swiss Volleyball Scouting Platform</p>
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

    return true;
  } catch (error) {
    console.error('❌ Error sending player status notification:', error);
    return false;
  }
}

interface SendRecruiterStatusNotificationParams {
  recipientEmail: string;
  recipientName: string;
  recruiterName: string;
  recruiterClub: string;
  recruiterRole: string;
  recruiterId: string;
}

export async function sendRecruiterSearchingNotification({
  recipientEmail,
  recipientName,
  recruiterName,
  recruiterClub,
  recruiterRole,
  recruiterId,
}: SendRecruiterStatusNotificationParams): Promise<boolean> {
  try {
    const recruiterUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/recruiters/${recruiterId}`;
    
    if (!process.env.RESEND_API_KEY) {
      return true;
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      return false;
    }

    await resendClient.emails.send({
      from: 'Habicht <noreply@habicht-volleyball.ch>',
      to: recipientEmail,
      subject: `${recruiterClub} suecht Spieler - Habicht`,
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
                  <tr>
                    <td style="background-color: #2563eb; padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🔍 Club Suecht Spieler</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${recipientName}!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        <strong>${recruiterName}</strong> vo ${recruiterClub} suecht aktiv Spieler!
                      </p>
                      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <p style="color: #1e40af; font-size: 14px; margin: 5px 0;"><strong>Club:</strong> ${recruiterClub}</p>
                        <p style="color: #1e40af; font-size: 14px; margin: 5px 0;"><strong>Rolle:</strong> ${recruiterRole}</p>
                      </div>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                              <tr>
                                <td style="background-color: #2563eb; border-radius: 8px;">
                                  <a href="${recruiterUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold;">
                                    👤 Profil Aaluege
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Habicht | Swiss Volleyball Scouting Platform</p>
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

    return true;
  } catch (error) {
    console.error('❌ Error sending recruiter status notification:', error);
    return false;
  }
}

interface SendProfileViewNotificationParams {
  recipientEmail: string
  recipientName: string
  viewerName: string
  viewerProfileUrl: string
  profileUrl: string
  viewerImage?: string | null
  viewerRole?: 'player' | 'recruiter' | null
}

export async function sendProfileViewNotification({
  recipientEmail,
  recipientName,
  viewerName,
  viewerProfileUrl,
  profileUrl,
  viewerImage,
  viewerRole
}: SendProfileViewNotificationParams): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('👁️ PROFILE VIEW NOTIFICATION EMAIL');
      console.log('=================================');
      console.log(`To: ${recipientEmail}`);
      console.log(`Recipient: ${recipientName}`);
      console.log(`Viewer: ${viewerName}`);
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
    
    const roleLabel = viewerRole === 'player' ? 'Spieler' : viewerRole === 'recruiter' ? 'Scout' : 'Benutzer';
    const defaultAvatar = 'https://www.habicht-volleyball.ch/default-avatar.png';
    const avatarUrl = viewerImage || defaultAvatar;

    await resendClient.emails.send({
      from: 'Habicht Volleyball <noreply@habicht-volleyball.ch>',
      to: recipientEmail,
      subject: `${viewerName} het din Profil aagluegt | Habicht`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Profil View</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Profil Aagluegt 👁️</h1>
              </div>
              
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${recipientName}!</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  <strong>${viewerName}</strong> het din Profil uf Habicht Volleyball aagluegt.
                </p>
                
                <!-- User Card -->
                <a href="https://www.habicht-volleyball.ch${viewerProfileUrl}" style="text-decoration: none; display: block; margin: 30px 0;">
                  <div style="background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%); border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <div style="display: flex; align-items: center; gap: 20px;">
                      <div style="flex-shrink: 0;">
                        <img src="${avatarUrl}" alt="${viewerName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #dc2626; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);" />
                      </div>
                      <div style="flex-grow: 1; text-align: left;">
                        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 22px; font-weight: 700;">${viewerName}</h3>
                        <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${roleLabel}</p>
                        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">📍 Profil aaluege</p>
                      </div>
                      <div style="flex-shrink: 0;">
                        <div style="width: 40px; height: 40px; background-color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <span style="color: #ffffff; font-size: 20px;">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
                
                <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    💡 Das isch e Zeiche dass din Profil Ufmerksamkeit bechunnt!
                  </p>
                </div>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="https://www.habicht-volleyball.ch${viewerProfileUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                    ${viewerName} aazeige
                  </a>
                  <a href="https://www.habicht-volleyball.ch/notifications" style="display: inline-block; background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(31, 41, 55, 0.3);">
                    Zu Benachrichtigunge
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                  Viel Erfolg mit dinere Sportkarriere! 🏐
                </p>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                  © ${new Date().getFullYear()} Habicht Volleyball. Alli Rächt vorbehalte.<br>
                  Du hesch die E-Mail becho, will di Konto Benachrichtigungen aktiviert het.
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    console.log('✅ Profile view notification email sent successfully to:', recipientEmail);
    return true
  } catch (error) {
    console.error('Error sending profile view notification:', error)
    return false
  }
}
interface SendWatchlistUpdateParams {
  recipientEmail: string;
  recipientName: string;
  playerName: string;
  playerImage: string | null;
  playerId: string;
  changes: string[];
}

export async function sendWatchlistUpdateNotification({
  recipientEmail,
  recipientName,
  playerName,
  playerImage,
  playerId,
  changes,
}: SendWatchlistUpdateParams): Promise<boolean> {
  try {
    const playerUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/players/${playerId}`;
    
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured. Watchlist update email not sent.');
      return true;
    }

    const resendClient = getResendClient();
    if (!resendClient) {
      console.log('⚠️ Resend client not available');
      return false;
    }

    const changesList = changes.map(change => `<li style="color: #4b5563; font-size: 14px; margin: 8px 0;">${change}</li>`).join('');

    await resendClient.emails.send({
      from: 'Habicht <noreply@habicht-volleyball.ch>',
      to: recipientEmail,
      subject: `${playerName} het Profil aktualisiert - Habicht Watchlist`,
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
                  <tr>
                    <td style="background-color: #dc2626; padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔖 Watchlist Update</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Hallo ${recipientName}!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        <strong>${playerName}</strong> vo dinere Watchlist het es Profil aktualisiert.
                      </p>
                      ${playerImage ? `
                      <div style="text-align: center; margin: 20px 0;">
                        <img src="${playerImage}" alt="${playerName}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #dc2626;" />
                      </div>
                      ` : ''}
                      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #991b1b; margin-top: 0; font-size: 16px;">Änderige:</h3>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                          ${changesList}
                        </ul>
                      </div>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                              <tr>
                                <td style="background-color: #dc2626; border-radius: 8px;">
                                  <a href="${playerUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold;">
                                    👤 Profil Aaluege
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Habicht | Swiss Volleyball Scouting Platform</p>
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

    console.log('✅ Watchlist update email sent successfully to:', recipientEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending watchlist update notification:', error);
    return false;
  }
}

// Position translations for emails
const positionNames: Record<string, string> = {
  OUTSIDE_HITTER: 'Aussespieler',
  OPPOSITE: 'Diagonalspieler',
  MIDDLE_BLOCKER: 'Mittelblocker',
  SETTER: 'Zuspieler',
  LIBERO: 'Libero',
  UNIVERSAL: 'Universal'
};

// Contract type translations for emails
const contractTypeNames: Record<string, string> = {
  PROFESSIONAL: 'Professionell',
  SEMI_PROFESSIONAL: 'Semi-Professionell',
  AMATEUR: 'Amateur',
  VOLUNTEER: 'Freiwillig',
  INTERNSHIP: 'Praktikum'
};

interface SendPlayerRequestNotificationParams {
  recipientEmail: string;
  recipientName: string;
  creatorName: string;
  clubName: string;
  canton: string;
  position: string;
  contractType: string;
  title: string;
  description: string;
  requestUrl: string;
}

export async function sendPlayerRequestNotification({
  recipientEmail,
  recipientName,
  creatorName,
  clubName,
  canton,
  position,
  contractType,
  title,
  description,
  requestUrl
}: SendPlayerRequestNotificationParams): Promise<boolean> {
  try {
    const fullRequestUrl = `https://www.habicht-volleyball.ch${requestUrl}`;
    const positionDisplay = positionNames[position] || position;
    const contractDisplay = contractTypeNames[contractType] || contractType;
    const truncatedDescription = description.length > 200 
      ? description.substring(0, 200) + '...' 
      : description;

    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('🏐 PLAYER REQUEST NOTIFICATION EMAIL');
      console.log('=================================');
      console.log(`To: ${recipientEmail}`);
      console.log(`Recipient: ${recipientName}`);
      console.log(`Creator: ${creatorName}`);
      console.log(`Club: ${clubName} (${canton})`);
      console.log(`Position: ${positionDisplay}`);
      console.log(`Contract: ${contractDisplay}`);
      console.log(`Title: ${title}`);
      console.log(`URL: ${fullRequestUrl}`);
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

    await resendClient.emails.send({
      from: 'Habicht <noreply@habicht-volleyball.ch>',
      to: recipientEmail,
      subject: `🏐 Neui Spieler-Aafrog: ${title}`,
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
                    <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                      <img src="https://habicht-volleyball.ch/eagle-logo.png" alt="Habicht Logo" width="80" height="80" style="display: block; margin: 0 auto 15px auto; border: 0;" />
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🏐 Neui Spieler-Aafrog</h1>
                    </td>
                  </tr>
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 22px;">Hallo ${recipientName}!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Es git e neui Spieler-Aafrog wo für dich interessant sii chönnt:
                      </p>
                      
                      <!-- Request Card -->
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
                        <h3 style="color: #1e40af; margin-top: 0; font-size: 20px; margin-bottom: 16px;">${title}</h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #64748b;">🏢 Club:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${clubName}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #64748b;">📍 Kanton:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${canton}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #64748b;">🎯 Position:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${positionDisplay}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #64748b;">📝 Vertragstyp:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${contractDisplay}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #64748b;">👤 Vo:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${creatorName}
                            </td>
                          </tr>
                        </table>
                        
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                          <strong style="color: #64748b; display: block; margin-bottom: 8px;">📄 Beschriibig:</strong>
                          <p style="color: #374151; margin: 0; line-height: 1.5;">${truncatedDescription}</p>
                        </div>
                      </div>
                      
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                              <tr>
                                <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px;">
                                  <a href="${fullRequestUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold;">
                                    🔍 Aafrog aaluege
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                        Wenn du interessiert bisch, chasch direkt mit em Recruiter i Kontakt trätte!
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 Habicht | Swiss Volleyball Scouting Platform</p>
                      <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">
                        Du chasch dini Benachrichtigunge i dine <a href="https://www.habicht-volleyball.ch/settings" style="color: #3b82f6;">Istellige</a> ändere.
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

    console.log('✅ Player request notification email sent successfully to:', recipientEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending player request notification:', error);
    return false;
  }
}