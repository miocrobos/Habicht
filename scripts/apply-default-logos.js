const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Default volleyball logo from volleyball.ch (SwissVolley generic logo)
const DEFAULT_LOGO = 'https://volleymanager.volleyball.ch/_Resources/Persistent/352fb66c916c019156a9f636ea598b522887d83a/29369_VBC%20Swiss.png';

async function run() {
  // Get clubs without logos
  const clubsWithoutLogo = await p.club.findMany({
    where: { logo: null },
    select: { id: true, name: true }
  });
  
  console.log(`Applying default volleyball logo to ${clubsWithoutLogo.length} clubs:\n`);
  
  for (const club of clubsWithoutLogo) {
    await p.club.update({
      where: { id: club.id },
      data: { logo: DEFAULT_LOGO }
    });
    console.log(`  ✅ ${club.name}`);
  }
  
  // Verify all clubs now have logos
  const remaining = await p.club.count({ where: { logo: null } });
  const total = await p.club.count();
  const withLogo = await p.club.count({ where: { logo: { not: null } } });
  
  console.log(`\n📊 Final Count:`);
  console.log(`   Total clubs: ${total}`);
  console.log(`   Clubs with logo: ${withLogo}`);
  console.log(`   Clubs without logo: ${remaining}`);
  
  await p.$disconnect();
}

run().catch(console.error);
