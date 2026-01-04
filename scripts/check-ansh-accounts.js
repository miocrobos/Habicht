const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAnshAccounts() {
  // Find all players with Ansh in name
  const players = await prisma.player.findMany({
    where: { firstName: { contains: 'Ansh' } },
    include: { user: true }
  });
  
  console.log('Players with Ansh:', players.map(p => ({
    playerId: p.id,
    name: p.firstName + ' ' + p.lastName,
    userId: p.userId,
    userEmail: p.user?.email,
    userRole: p.user?.role
  })));

  // Find all recruiters with Ansh in name
  const recruiters = await prisma.recruiter.findMany({
    where: { firstName: { contains: 'Ansh' } },
    include: { user: true }
  });

  console.log('Recruiters with Ansh:', recruiters.map(r => ({
    recruiterId: r.id,
    name: r.firstName + ' ' + r.lastName,
    userId: r.userId,
    userEmail: r.user?.email,
    userRole: r.user?.role
  })));

  // Find all HYBRID users
  const hybrids = await prisma.user.findMany({
    where: { role: 'HYBRID' },
    include: { player: true, recruiter: true }
  });

  console.log('All HYBRID users:', hybrids.map(h => ({
    userId: h.id,
    email: h.email,
    role: h.role,
    hasPlayer: !!h.player,
    playerName: h.player ? h.player.firstName + ' ' + h.player.lastName : null,
    hasRecruiter: !!h.recruiter,
    recruiterName: h.recruiter ? h.recruiter.firstName + ' ' + h.recruiter.lastName : null
  })));

  await prisma.$disconnect();
}

checkAnshAccounts().catch(e => {
  console.error(e);
  process.exit(1);
});
