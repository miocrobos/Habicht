import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function checkAndFixPassword() {
  const correctEmail = 'kamsiyochukwuugoji@gmail.com' // The correct email
  const wrongEmail = 'pl_pako@icloud.com' // Wrong email to revert
  const newPassword = 'TestPass123!' // Desired password

  try {
    console.log('🔄 Processing password changes...\n')

    // 1. Fix the correct user's password
    const correctUser = await prisma.user.findUnique({
      where: { email: correctEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
      }
    })

    if (correctUser) {
      console.log('=== Correct User Found ===')
      console.log('Email:', correctUser.email)
      console.log('Name:', correctUser.name)
      console.log('Email Verified:', correctUser.emailVerified)

      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 10)

      // Update password
      await prisma.user.update({
        where: { id: correctUser.id },
        data: { 
          password: newHash,
          emailVerified: true
        }
      })

      console.log('✅ Password updated for:', correctEmail)
      console.log('🔐 New password:', newPassword)
      console.log('')
    } else {
      console.log('❌ User not found:', correctEmail)
    }

    // 2. Revert wrong user's password (note: we don't have original, so skip actual change)
    const wrongUser = await prisma.user.findUnique({
      where: { email: wrongEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      }
    })

    if (wrongUser) {
      console.log('=== Wrong User (No Changes) ===')
      console.log('Email:', wrongUser.email)
      console.log('Name:', wrongUser.name)
      console.log('ℹ️  Password left unchanged (we don\'t know original password)')
      console.log('ℹ️  User should use password reset if needed')
      console.log('')
    }

    console.log('✅ All done!')
    console.log('\n🔐 Login credentials for kamsiyochukwuugoji@gmail.com:')
    console.log('Email:', correctEmail)
    console.log('Password:', newPassword)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndFixPassword()
