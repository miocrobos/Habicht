import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Updating New NLB Clubs with Full Information ===\n');

  // VBC Visp - found website
  const visp = await prisma.club.findFirst({ where: { name: 'VBC Visp' } });
  if (visp) {
    await prisma.club.update({
      where: { id: visp.id },
      data: {
        website: 'https://www.vbc-visp.ch',
        email: 'vbcvisp@gmail.com',
      }
    });
    console.log('✓ Updated VBC Visp');
  }

  // VBC Glaronia - found website and contact
  const glaronia = await prisma.club.findFirst({ where: { name: 'VBC Glaronia' } });
  if (glaronia) {
    await prisma.club.update({
      where: { id: glaronia.id },
      data: {
        website: 'https://www.vbcglaronia.ch',
        email: 'sekretariat@vbcglaronia.ch',
        facebook: 'https://www.facebook.com/vbcglaronia',
        instagram: 'https://www.instagram.com/glaroniavolleyball/',
        youtube: 'https://www.youtube.com/@vbcglaronia4940',
      }
    });
    console.log('✓ Updated VBC Glaronia');
  }

  // Lutry-Lavaux Volleyball
  const lutry = await prisma.club.findFirst({ where: { name: 'Lutry-Lavaux Volleyball' } });
  if (lutry) {
    await prisma.club.update({
      where: { id: lutry.id },
      data: {
        website: 'https://www.lutry-lavaux-volleyball.ch',
      }
    });
    console.log('✓ Updated Lutry-Lavaux Volleyball');
  }

  // VBC Aeschi - found website and contact
  const aeschi = await prisma.club.findFirst({ where: { name: 'VBC Aeschi' } });
  if (aeschi) {
    await prisma.club.update({
      where: { id: aeschi.id },
      data: {
        website: 'https://www.vbcaeschi.ch',
        email: 'mail@vbcaeschi.ch',
        facebook: 'https://www.facebook.com/vbcaeschi',
        instagram: 'https://www.instagram.com/vbc_aeschi',
        // Fix canton: Aeschi is in Bern (BE), not Solothurn (SO)
        canton: 'BE',
        town: 'Aeschi bei Spiez',
      }
    });
    console.log('✓ Updated VBC Aeschi');
  }

  // Volleyball Papiermühle
  const papier = await prisma.club.findFirst({ where: { name: 'Volleyball Papiermühle' } });
  if (papier) {
    await prisma.club.update({
      where: { id: papier.id },
      data: {
        website: 'https://www.papimuehle.ch',
      }
    });
    console.log('✓ Updated Volleyball Papiermühle');
  }

  // Show updated clubs
  console.log('\n=== Updated Club Details ===\n');
  const updatedClubs = await prisma.club.findMany({
    where: {
      name: {
        in: ['VBC Visp', 'VBC Glaronia', 'Lutry-Lavaux Volleyball', 'VBC Aeschi', 'Volleyball Papiermühle']
      }
    },
    select: {
      name: true,
      canton: true,
      town: true,
      website: true,
      email: true,
      facebook: true,
      instagram: true,
      hasNLBMen: true,
      hasNLBWomen: true,
    }
  });

  for (const club of updatedClubs) {
    console.log(`${club.name}:`);
    console.log(`  Canton: ${club.canton}, Town: ${club.town}`);
    console.log(`  Website: ${club.website || 'none'}`);
    console.log(`  Email: ${club.email || 'none'}`);
    console.log(`  Social: FB=${club.facebook ? 'yes' : 'no'}, IG=${club.instagram ? 'yes' : 'no'}`);
    console.log(`  NLB: Men=${club.hasNLBMen}, Women=${club.hasNLBWomen}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main();
