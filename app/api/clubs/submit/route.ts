import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
