import { prisma } from '../lib/prisma'
import { sendVerificationEmail, sendPasswordResetVerification } from '../lib/email'
import crypto from 'crypto'

async function sendAllVerifications() {
  try {
    console.log('\n🔍 Finding all users...\n')

    // Find all users who haven't verified their email
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        verificationToken: true,
        createdAt: true,
      }
    })

    console.log(`📊 Found ${unverifiedUsers.length} unverified users\n`)

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!')
      return
    }

    let successCount = 0
    let failCount = 0

    for (const user of unverifiedUsers) {
      console.log(`\n📧 Processing: ${user.name} (${user.email})`)
      console.log(`   Created: ${user.createdAt}`)

      let token = user.verificationToken

      // Generate new token if missing
      if (!token) {
        console.log('   ⚠️  No token found. Generating new one...')
        token = crypto.randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        await prisma.user.update({
          where: { id: user.id },
          data: {
            verificationToken: token,
            verificationTokenExpiry: expiry,
          }
        })
        console.log('   ✅ New token generated')
      }

      // Send verification email
      const emailSent = await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationToken: token,
      })

      if (emailSent) {
        console.log('   ✅ Verification email sent!')
        successCount++
      } else {
        console.log('   ❌ Failed to send email')
        failCount++
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successfully sent: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📧 Total processed: ${unverifiedUsers.length}`)
    console.log('='.repeat(50) + '\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

sendAllVerifications()
