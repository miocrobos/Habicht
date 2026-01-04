const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.findMany({
    where: { role: 'HYBRID' },
    include: {
      player: {
        select: { id: true, isPublic: true, isActive: true }
      },
      recruiter: {
        select: { id: true, isActive: true }
      }
    }
  });
  console.log('HYBRID users and their profile settings:');
  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
