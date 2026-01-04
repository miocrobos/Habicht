const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePassword() {
  const hash = await bcrypt.hash('Yochukwu1!', 10);
  const result = await prisma.user.update({
    where: { id: 'cmjx559jn00004j7jk6j3g4ak' },
    data: { password: hash }
  });
  console.log('Password updated for:', result.email);
  await prisma.$disconnect();
}

updatePassword().catch(e => {
  console.error(e);
  process.exit(1);
});
