import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../lib/email';
import crypto from 'crypto';


const prisma = new PrismaClient();

async function resendVerificationEmails() {
  try {
    console.log('🔍 Finding users with unverified emails...\n');

    // Find all users who haven't verified their email
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        verificationToken: true,
      },
    });

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users have verified their emails!');
      return;
    }

    console.log(`📧 Found ${unverifiedUsers.length} unverified users:\n`);
    unverifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
    });
    console.log('\nSending verification emails...\n');

    let successCount = 0;
    let failCount = 0;

    for (const user of unverifiedUsers) {
      try {
        // Generate new token if none exists
        let token = user.verificationToken;
        if (!token) {
          token = crypto.randomBytes(32).toString('hex');
          const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await prisma.user.update({
            where: { id: user.id },
            data: {
              verificationToken: token,
              verificationTokenExpiry,
            },
          });
          console.log(`🔄 Generated new token for: ${user.email}`);
        }

        // Send verification email
        console.log(`📤 Sending to: ${user.email}...`);
        const sent = await sendVerificationEmail({
          email: user.email,
          name: user.name,
          verificationToken: token,
        });

        if (sent) {
          console.log(`✅ SUCCESS: ${user.email}\n`);
          successCount++;
        } else {
          console.log(`❌ FAILED: ${user.email}\n`);
          failCount++;
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ERROR sending to ${user.email}:`, error);
        failCount++;
      }
    }

    console.log('\n=================================');
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log('=================================\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resendVerificationEmails();
