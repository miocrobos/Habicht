import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Fix Incorrectly Detected Leagues ===\n');

  // VBC Glaronia - they play NLB Women only (not NLA Women or NLB Men)
  // The scraper detected "NLA" because they play AGAINST NLA teams or mention NLA in news
  const glaronia = await prisma.club.findFirst({ where: { name: 'VBC Glaronia' } });
  if (glaronia) {
    await prisma.club.update({
      where: { id: glaronia.id },
      data: {
        hasNLAWomen: false,  // They don't play NLA
        hasNLBMen: false,     // They don't have NLB Men team
        // Keep NLB Women = true (correct)
        // Keep lower leagues they actually have
      }
    });
    console.log('✓ Fixed VBC Glaronia: removed NLA Women and NLB Men flags');
  }

  // Show final state
  const clubs = await prisma.club.findMany({
    where: {
      name: {
        in: ['VBC Visp', 'VBC Glaronia', 'Lutry-Lavaux Volleyball', 'VBC Aeschi', 'Volleyball Papiermühle']
      }
    },
    orderBy: { name: 'asc' }
  });

  console.log('\n=== Final Club Status ===\n');

  for (const club of clubs) {
    const leagues: string[] = [];
    if (club.hasNLAMen) leagues.push('NLA Men');
    if (club.hasNLAWomen) leagues.push('NLA Women');
    if (club.hasNLBMen) leagues.push('NLB Men');
    if (club.hasNLBWomen) leagues.push('NLB Women');
    if (club.has1LigaMen) leagues.push('1L Men');
    if (club.has1LigaWomen) leagues.push('1L Women');
    if (club.has2LigaMen) leagues.push('2L Men');
    if (club.has2LigaWomen) leagues.push('2L Women');
    if (club.has3LigaMen) leagues.push('3L Men');
    if (club.has3LigaWomen) leagues.push('3L Women');
    if (club.has4LigaMen) leagues.push('4L Men');
    if (club.has4LigaWomen) leagues.push('4L Women');
    if (club.has5LigaMen) leagues.push('5L Men');
    if (club.has5LigaWomen) leagues.push('5L Women');
    if (club.hasU23Men) leagues.push('U23 Men');
    if (club.hasU23Women) leagues.push('U23 Women');
    if (club.hasU20Men) leagues.push('U20 Men');
    if (club.hasU20Women) leagues.push('U20 Women');
    if (club.hasU18Men) leagues.push('U18 Men');
    if (club.hasU18Women) leagues.push('U18 Women');

    console.log(`${club.name}:`);
    console.log(`  📍 ${club.town}, ${club.canton}`);
    console.log(`  🌐 ${club.website || 'no website'}`);
    console.log(`  📧 ${club.email || 'no email'}`);
    console.log(`  🖼️  Logo: ${club.logo ? 'YES' : 'NO'}`);
    console.log(`  📱 Social: FB=${club.facebook ? '✓' : '✗'} IG=${club.instagram ? '✓' : '✗'} YT=${club.youtube ? '✓' : '✗'}`);
    console.log(`  ⚽ Leagues: ${leagues.join(', ') || 'none'}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main();
