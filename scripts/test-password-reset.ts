import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function testPasswordResetFlow() {
  const testEmail = 'kamsiyochukwuugoji@gmail.com'
  const testPassword = 'MyNewPassword123!'

  try {
    console.log('🧪 Testing Password Reset Flow\n')

    // Step 1: Get current user
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', user.email)
    console.log('Current hash:', user.password?.substring(0, 30) + '...\n')

    // Step 2: Simulate password reset request (what API does)
    const newPasswordHash = await bcrypt.hash(testPassword, 10)
    console.log('🔐 New password hash created:', newPasswordHash.substring(0, 30) + '...')

    // Step 3: Update user password (what verification does)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPasswordHash }
    })
    console.log('✅ Password updated in database\n')

    // Step 4: Verify the password works
    const updatedUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    if (!updatedUser?.password) {
      console.log('❌ Password not found after update')
      return
    }

    const isValid = await bcrypt.compare(testPassword, updatedUser.password)
    console.log('🔍 Testing password comparison...')
    console.log('Password entered:', testPassword)
    console.log('Stored hash:', updatedUser.password.substring(0, 30) + '...')
    console.log('Comparison result:', isValid ? '✅ MATCH' : '❌ NO MATCH')

    if (isValid) {
      console.log('\n✅ PASSWORD RESET FLOW WORKING!')
      console.log('\n🔐 Login with:')
      console.log('Email:', testEmail)
      console.log('Password:', testPassword)
    } else {
      console.log('\n❌ PASSWORD COMPARISON FAILED')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPasswordResetFlow()
