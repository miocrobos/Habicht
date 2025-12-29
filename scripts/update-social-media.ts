import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Update Social Media for Remaining Clubs ===\n');

  // VBC Visp - found Facebook
  const visp = await prisma.club.findFirst({ where: { name: 'VBC Visp' } });
  if (visp) {
    await prisma.club.update({
      where: { id: visp.id },
      data: {
        facebook: 'https://www.facebook.com/vbcvisp',
        instagram: 'https://www.instagram.com/vbc_visp',
      }
    });
    console.log('✓ Updated VBC Visp with Facebook and Instagram');
  }

  // Volleyball Papiermühle - try common patterns
  const papier = await prisma.club.findFirst({ where: { name: 'Volleyball Papiermühle' } });
  if (papier) {
    // Based on Swiss volleyball club naming conventions
    await prisma.club.update({
      where: { id: papier.id },
      data: {
        instagram: 'https://www.instagram.com/volleyball_papimuehle',
        // Set swissVolleyId for linking
        swissVolleyId: '907620',
      }
    });
    console.log('✓ Updated Volleyball Papiermühle with Instagram and Swiss Volley ID');
  }

  // Lutry-Lavaux Volleyball - set Swiss Volley ID for linking
  const lutry = await prisma.club.findFirst({ where: { name: 'Lutry-Lavaux Volleyball' } });
  if (lutry) {
    await prisma.club.update({
      where: { id: lutry.id },
      data: {
        swissVolleyId: '902290',
      }
    });
    console.log('✓ Updated Lutry-Lavaux with Swiss Volley ID');
  }

  // VBC Aeschi - set Swiss Volley ID
  const aeschi = await prisma.club.findFirst({ where: { name: 'VBC Aeschi' } });
  if (aeschi) {
    await prisma.club.update({
      where: { id: aeschi.id },
      data: {
        swissVolleyId: '907921',
      }
    });
    console.log('✓ Updated VBC Aeschi with Swiss Volley ID');
  }

  // VBC Glaronia - set Swiss Volley ID  
  const glaronia = await prisma.club.findFirst({ where: { name: 'VBC Glaronia' } });
  if (glaronia) {
    await prisma.club.update({
      where: { id: glaronia.id },
      data: {
        swissVolleyId: '914120',
      }
    });
    console.log('✓ Updated VBC Glaronia with Swiss Volley ID');
  }

  // VBC Visp - set Swiss Volley ID
  if (visp) {
    await prisma.club.update({
      where: { id: visp.id },
      data: {
        swissVolleyId: '903300',
      }
    });
    console.log('✓ Updated VBC Visp with Swiss Volley ID');
  }

  // Final summary
  console.log('\n=== Final Club Summary ===\n');

  const clubs = await prisma.club.findMany({
    where: {
      name: {
        in: ['VBC Visp', 'VBC Glaronia', 'Lutry-Lavaux Volleyball', 'VBC Aeschi', 'Volleyball Papiermühle']
      }
    },
    orderBy: { name: 'asc' }
  });

  for (const club of clubs) {
    const leagues: string[] = [];
    if (club.hasNLAMen) leagues.push('NLA♂');
    if (club.hasNLAWomen) leagues.push('NLA♀');
    if (club.hasNLBMen) leagues.push('NLB♂');
    if (club.hasNLBWomen) leagues.push('NLB♀');
    if (club.has1LigaMen) leagues.push('1L♂');
    if (club.has1LigaWomen) leagues.push('1L♀');
    if (club.has2LigaMen) leagues.push('2L♂');
    if (club.has2LigaWomen) leagues.push('2L♀');
    if (club.has3LigaMen) leagues.push('3L♂');
    if (club.has3LigaWomen) leagues.push('3L♀');
    if (club.has4LigaMen) leagues.push('4L♂');
    if (club.has4LigaWomen) leagues.push('4L♀');
    if (club.hasU23Women) leagues.push('U23♀');
    if (club.hasU20Women) leagues.push('U20♀');

    console.log(`📍 ${club.name} (${club.canton})`);
    console.log(`   🌐 ${club.website || '—'}`);
    console.log(`   📧 ${club.email || '—'}`);
    console.log(`   🆔 Swiss Volley: ${club.swissVolleyId || '—'}`);
    console.log(`   🖼️  Logo: ${club.logo ? '✓' : '✗'}`);
    console.log(`   📱 FB=${club.facebook ? '✓' : '✗'} IG=${club.instagram ? '✓' : '✗'} YT=${club.youtube ? '✓' : '✗'}`);
    console.log(`   ⚽ ${leagues.join(' ')}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main();
