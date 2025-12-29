const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Default volleyball logo
const DEFAULT_LOGO = 'https://volleymanager.volleyball.ch/_Resources/Persistent/352fb66c916c019156a9f636ea598b522887d83a/29369_VBC%20Swiss.png';

// Clubs with broken logos
const BROKEN_LOGOS = [
  'VBC Aeschi',
  'VBC Visp',
  'Volleyball-Club Volketswil',
  'Pallavolo-Novaggio-Bedigliora',
  'TV Magden',
  'STV Buttisholz',
  'Volley GraPa'
];

async function run() {
  console.log('🔧 Fixing broken logos...\n');
  
  for (const name of BROKEN_LOGOS) {
    await p.club.updateMany({
      where: { name },
      data: { logo: DEFAULT_LOGO }
    });
    console.log(`  ✅ Fixed ${name}`);
  }
  
  console.log('\n📊 Done! All broken logos replaced with default.');
  
  await p.$disconnect();
}

run().catch(console.error);
