const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllPasswords() {
  const newPassword = 'Yochukwu1!';
  const hash = await bcrypt.hash(newPassword, 10);
  
  const result = await prisma.user.updateMany({
    data: { password: hash }
  });
  
  console.log(`Password updated for ${result.count} users to: ${newPassword}`);
  await prisma.$disconnect();
}

updateAllPasswords().catch(e => {
  console.error(e);
  process.exit(1);
});
