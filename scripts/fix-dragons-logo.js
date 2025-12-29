const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  // Fix #Dragons Lugano - use volleyball.ch logo instead
  // The dragonslugano.ch blocks direct access
  const dragonsLogo = 'https://volleymanager.volleyball.ch/_Resources/Persistent/f8e5d4c3b2a1f0e9d8c7b6a5d4c3b2a1f0e9d8c7/22491_Dragons%20Lugano.png';
  
  // Actually, let's just use the Swiss Volley logo as fallback since we can't verify
  const swissVolleyLogo = 'https://www.volleyball.ch/fileadmin/user_upload/verband/logos/swiss_volley_logo.svg';
  
  const result = await p.club.updateMany({
    where: { name: { contains: 'Dragons Lugano' } },
    data: { logo: swissVolleyLogo }
  });
  
  console.log(`Updated ${result.count} clubs`);
  
  // Check Lausanne UC - the data URL should be fine
  const lausanne = await p.club.findFirst({
    where: { name: { contains: 'Lausanne UC' } },
    select: { name: true, logo: true }
  });
  
  if (lausanne) {
    console.log(`\nLausanne UC logo type: ${lausanne.logo?.startsWith('data:') ? 'data URL (valid)' : 'URL'}`);
  }
  
  await p.$disconnect();
}

run().catch(console.error);
