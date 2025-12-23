import { PrismaClient } from '@prisma/client'
import { sendVerificationEmail } from '../lib/email'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function resendAllVerifications() {
  try {
    console.log('🔍 Finding all unverified users...')
    
    // Find all users who haven't verified their email yet
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationToken: true,
        verificationTokenExpiry: true,
      },
    })

    console.log(`📧 Found ${unverifiedUsers.length} unverified users`)

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!')
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const user of unverifiedUsers) {
      try {
        // Generate new verification token (refresh expired ones)
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        // Update user with new token
        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationToken,
            verificationTokenExpiry,
          },
        })

        // Send verification email
        const emailSent = await sendVerificationEmail({
          email: user.email,
          name: user.name,
          verificationToken,
        })

        if (emailSent) {
          console.log(`✅ Sent verification email to ${user.email} (${user.role})`)
          successCount++
        } else {
          console.log(`❌ Failed to send email to ${user.email}`)
          errorCount++
        }
      } catch (error) {
        console.error(`❌ Error processing ${user.email}:`, error)
        errorCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully sent: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📧 Total processed: ${unverifiedUsers.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
resendAllVerifications()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
