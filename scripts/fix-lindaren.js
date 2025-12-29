const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  // Lindaren Volley is the sponsor name for Volley Amriswil's elite team
  // They should share the same logo
  
  const amriswil = await p.club.findFirst({ 
    where: { name: 'Volley Amriswil' }, 
    select: { logo: true } 
  });
  
  if (amriswil && amriswil.logo) {
    await p.club.updateMany({
      where: { name: 'Lindaren Volley' },
      data: { logo: amriswil.logo }
    });
    console.log('Updated Lindaren Volley with Volley Amriswil logo');
  }
  
  // Final count
  const remaining = await p.club.findMany({
    where: { logo: null },
    select: { name: true },
    orderBy: { name: 'asc' }
  });
  
  console.log(`\nClubs still without logos (${remaining.length}):`);
  remaining.forEach(c => console.log(`  - ${c.name}`));
  
  await p.$disconnect();
}

run().catch(console.error);
