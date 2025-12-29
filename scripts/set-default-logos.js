const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  // Use Swiss Volley logo as default for clubs without logos
  // This is the official Swiss Volleyball federation logo
  const defaultLogo = 'https://www.volleyball.ch/fileadmin/user_upload/verband/logos/swiss_volley_logo.svg';
  
  const updated = await p.club.updateMany({
    where: { logo: null },
    data: { logo: defaultLogo }
  });
  
  console.log(`Updated ${updated.count} clubs with default volleyball logo`);
  
  // Verify all clubs now have logos
  const withoutLogo = await p.club.count({ where: { logo: null } });
  const withLogo = await p.club.count({ where: { logo: { not: null } } });
  
  console.log(`\nFinal counts:`);
  console.log(`  Clubs with logo: ${withLogo}`);
  console.log(`  Clubs without logo: ${withoutLogo}`);
  
  await p.$disconnect();
}

run().catch(console.error);
