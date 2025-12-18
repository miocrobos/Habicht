import { prisma } from '../lib/prisma'
import { sendVerificationEmail } from '../lib/email'

async function resendLastUserVerification() {
  try {
    // Find the most recent user
    const lastUser = await prisma.user.findFirst({
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

    if (!lastUser) {
      console.log('No users found in database')
      return
    }

    console.log('\n=== Last Registered User ===')
    console.log('Name:', lastUser.name)
    console.log('Email:', lastUser.email)
    console.log('Created:', lastUser.createdAt)
    console.log('Email Verified:', lastUser.emailVerified)
    console.log('Has Token:', !!lastUser.verificationToken)

    if (lastUser.emailVerified) {
      console.log('\n✅ This user is already verified!')
      return
    }

    if (!lastUser.verificationToken) {
      console.log('\n❌ No verification token found. Generating new one...')
      const crypto = require('crypto')
      const newToken = crypto.randomBytes(32).toString('hex')
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.user.update({
        where: { id: lastUser.id },
        data: {
          verificationToken: newToken,
          verificationTokenExpiry: newExpiry,
        }
      })

      console.log('✅ New token generated')
      
      const emailSent = await sendVerificationEmail({
        email: lastUser.email,
        name: lastUser.name,
        verificationToken: newToken,
      })

      if (emailSent) {
        console.log('✅ Verification email sent successfully!')
      } else {
        console.log('❌ Failed to send verification email')
      }
    } else {
      console.log('\n📧 Resending verification email...')
      
      const emailSent = await sendVerificationEmail({
        email: lastUser.email,
        name: lastUser.name,
        verificationToken: lastUser.verificationToken,
      })

      if (emailSent) {
        console.log('✅ Verification email sent successfully!')
      } else {
        console.log('❌ Failed to send verification email')
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resendLastUserVerification()
