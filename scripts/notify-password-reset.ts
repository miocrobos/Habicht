import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

async function sendPasswordResetNotification(email: string, name: string): Promise<boolean> {
  try {
    const resetUrl = 'https://www.habicht-volleyball.ch/auth/forgot-password'
    
    await resend.emails.send({
      from: 'Habicht <noreply@habicht-volleyball.ch>',
      to: email,
      subject: 'Bitte setz dis Passwort zrugg - Habicht',
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
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">Passwort Zruggsetzä</h1>
                    </td>
                  </tr>
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hallo ${name}!</h2>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Mir hei e wichtigi Sicherheitsaktualisierig durgfüehrt und müesse di bitte, dis Passwort zrugzsetze.
                      </p>
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Klick uf de Button, um e neus Passwort z'setze:
                      </p>
                      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <table role="presentation" style="border-collapse: collapse;">
                              <tr>
                                <td style="background-color: #DC2626; border-radius: 8px;">
                                  <a href="${resetUrl}" style="display: inline-block; color: #ffffff; padding: 16px 40px; text-decoration: none; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                                    🔑 Passwort Zruggsetzä
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                        Falls du Frage hesch, meld di bi üs.
                      </p>
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
    })
    
    console.log(`✅ Email sent to: ${email}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error)
    return false
  }
}

async function notifyAllUsersToResetPassword() {
  try {
    console.log('🔍 Finding all users...')
    
    // Exclude the user whose password wasn't changed
    const excludeEmail = 'kamsiyouchukwuugoji@gmail.com'
    
    // Find all users except the excluded one
    const users = await prisma.user.findMany({
      where: {
        email: {
          not: excludeEmail,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    console.log(`📧 Found ${users.length} users to notify`)
    console.log(`ℹ️  Excluding: ${excludeEmail}`)

    if (users.length === 0) {
      console.log('✅ No users to notify!')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const user of users) {
      console.log(`\n📨 Sending to: ${user.email} (${user.name || 'No name'})`)
      
      const success = await sendPasswordResetNotification(
        user.email,
        user.name || 'Benutzer'
      )
      
      if (success) {
        successCount++
      } else {
        errorCount++
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n========================================')
    console.log('📊 SUMMARY')
    console.log('========================================')
    console.log(`✅ Successfully sent: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📧 Total users: ${users.length}`)
    console.log('========================================')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the script
notifyAllUsersToResetPassword()
