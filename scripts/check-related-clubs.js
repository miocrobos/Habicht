const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function run() {
  // Check for related clubs
  const searches = [
    { q: 'Amriswil', for: 'Lindaren Volley' },
    { q: 'Horgen', for: 'Turnverein Horgen' },
    { q: 'Avully', for: 'VBC Avully' },
    { q: 'Dietwil', for: 'VBC Dietwil' },
    { q: 'Muri', for: 'VBC Muri-Gümligen' },
    { q: 'Sixieme', for: 'VBC Sixieme 7' },
    { q: 'Bern', for: 'Volley Bern' }
  ];
  for (const s of searches) {
    const clubs = await p.club.findMany({ 
      where: { name: { contains: s.q } },
      select: { name: true, logo: true }
    });
    console.log(s.for + ' -> Related clubs:');
    clubs.forEach(c => console.log('  ' + c.name + (c.logo ? ' (has logo)' : ' (no logo)')));
    console.log('');
  }
  await p.$disconnect();
}
run().catch(console.error);
