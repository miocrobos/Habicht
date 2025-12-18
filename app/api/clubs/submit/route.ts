import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Lazy load Resend client to avoid build-time initialization
function getResendClient() {
  if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submitterName,
      submitterEmail,
      clubName,
      league,
      canton,
      website,
      additionalInfo,
    } = body;

    // Validate required fields
    if (!submitterName || !submitterEmail || !clubName) {
      return NextResponse.json(
        { error: 'Name, Email und Club Name Sind Erforderlich' },
        { status: 400 }
      );
    }

    // Admin email to receive submissions
    const adminEmail = process.env.ADMIN_EMAIL || 'habichtinfo@gmail.com';

    // In development, just log
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=================================');
      console.log('🏐 NEW CLUB SUBMISSION');
      console.log('=================================');
      console.log(`From: ${submitterName} (${submitterEmail})`);
      console.log(`Club Name: ${clubName}`);
      console.log(`League: ${league || 'N/A'}`);
      console.log(`Canton: ${canton || 'N/A'}`);
      console.log(`Website: ${website || 'N/A'}`);
      console.log(`Additional Info: ${additionalInfo || 'N/A'}`);
      console.log('=================================\n');
      
      return NextResponse.json({ 
        success: true,
        message: 'Submission logged to console (development mode)'
      });
    }

    // In production, send email to admin
    try {
      const resend = getResendClient();
      if (!resend) {
        console.warn('Resend client not available, skipping email');
        return NextResponse.json({ 
          success: true,
          message: 'Submission received (email unavailable during build)'
        });
      }
      
      // Send confirmation email to submitter
      await resend.emails.send({
        from: 'Habicht <noreply@habicht-volleyball.ch>',
        to: submitterEmail,
        subject: `✓ Danke Für Dini Club Mäldig - ${clubName}`,
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
                        <img src="https://habicht-volleyball.ch/eagle-logo.png" alt="Habicht Logo" width="100" height="100" style="display: block; margin: 0 auto 20px auto; border: 0;" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                          Danke Für Dini Mäldig! 🏐
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${submitterName}!</h2>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                          <strong>Dini Mäldig Isch Üs Erreicht!</strong> 🎉
                        </p>
                        
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Mir Ha Dini Aafroog Zum Hinzuefüege Vo <strong>${clubName}</strong> Erhalte. 
                          Üsi Team Wird D Informatione Prüefe Und De Club So Schnell Wie Möglich Zü Üsere Plattform Hinzuefüege.
                        </p>

                        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0;">
                          <p style="color: #065f46; margin: 0; font-size: 14px;">
                            <strong>Dini Iigräichti Informatione:</strong><br><br>
                            <strong>Club:</strong> ${clubName}<br>
                            ${league ? `<strong>Liga:</strong> ${league}<br>` : ''}
                            ${canton ? `<strong>Kanton:</strong> ${canton}<br>` : ''}
                            ${website ? `<strong>Websiite:</strong> ${website}<br>` : ''}
                          </p>
                        </div>

                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Falls Mir Zuesätzlechi Informatione Brüched, Werde Mir Üs Bi Dir Mälde.
                        </p>

                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                          Merci Für Din Biitrag Zum Ufbau Vo De Grösste Schweizer Volleyball-Community! 🙌
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
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

      // Send notification email to admin
      await resend.emails.send({
        from: 'Habicht <noreply@habicht-volleyball.ch>',
        to: adminEmail,
        replyTo: submitterEmail,
        subject: `Neue Club Mäldig: ${clubName}`,
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
                        <img src="https://habicht-volleyball.ch/eagle-logo.png" alt="Habicht Logo" width="80" height="80" style="display: block; margin: 0 auto 15px auto; border: 0;" />
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                          🏐 Neue Club Mäldig
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 30px;">
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #374151; margin-top: 0;">Kontaktperson</h2>
              <p><strong>Name:</strong> ${submitterName}</p>
              <p><strong>E-Mail:</strong> <a href="mailto:${submitterEmail}">${submitterEmail}</a></p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #374151; margin-top: 0;">Club Informatione</h2>
              <p><strong>Club Name:</strong> ${clubName}</p>
              ${league ? `<p><strong>Liga:</strong> ${league}</p>` : ''}
              ${canton ? `<p><strong>Kanton:</strong> ${canton}</p>` : ''}
              ${website ? `<p><strong>Websiite:</strong> <a href="${website}" target="_blank">${website}</a></p>` : ''}
            </div>

            ${additionalInfo ? `
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #374151; margin-top: 0;">Zuesätzlechi Informatione</h2>
                <p style="white-space: pre-wrap;">${additionalInfo}</p>
              </div>
            ` : ''}

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                          <p>Dä Club Cha Über Dis Admin-Panel Dezue Gfüegt Wärde.</p>
                          <p>Um Direkt Z Antworte, Eifach Uf Dä E-Mail Antwort.</p>
                        </div>
                        
                        <!-- Admin Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <table role="presentation" style="border-collapse: collapse;">
                                <tr>
                                  <td style="background-color: #DC2626; border-radius: 8px;">
                                    <a href="https://www.habicht-volleyball.ch/admin/clubs" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                                      🏐 Zum Admin Panel
                                    </a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
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

      return NextResponse.json({ 
        success: true,
        message: 'Club submission received and admin notified'
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Still return success since the submission was received
      return NextResponse.json({ 
        success: true,
        message: 'Submission received but email notification failed'
      });
    }
  } catch (error) {
    console.error('Error processing club submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
