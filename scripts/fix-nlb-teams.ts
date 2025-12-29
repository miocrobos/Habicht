import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fix incorrectly set Lancy (was matched to Papiermühle)
  await prisma.club.updateMany({ 
    where: { name: { contains: 'Lancy', mode: 'insensitive' } },
    data: { hasNLBMen: false }
  });
  console.log('Fixed Lancy (incorrectly matched)');

  // Set clubs found with different names
  const fixes = [
    { search: 'Volley Guggis Oberdiessbach', field: 'hasNLBWomen' },
    { search: 'Eaglets Volley Aarau', field: 'hasNLBWomen' },
    { search: 'Viteos NUC', field: 'hasNLBWomen' },
  ];

  for (const fix of fixes) {
    const club = await prisma.club.findFirst({ 
      where: { name: { contains: fix.search, mode: 'insensitive' } } 
    });
    if (club) {
      await prisma.club.update({ 
        where: { id: club.id }, 
        data: { [fix.field]: true } 
      });
      console.log('✓ Set:', club.name, '->', fix.field);
    }
  }

  // Add missing clubs
  const missingClubs = [
    { name: 'VBC Visp', canton: 'VS', town: 'Visp', hasNLBWomen: true },
    { name: 'VBC Glaronia', canton: 'GL', town: 'Glarus', hasNLBWomen: true },
    { name: 'Lutry-Lavaux Volleyball', canton: 'VD', town: 'Lutry', hasNLBMen: true },
    { name: 'VBC Aeschi', canton: 'SO', town: 'Aeschi', hasNLBMen: true },
    { name: 'Volleyball Papiermühle', canton: 'BE', town: 'Bern', hasNLBMen: true },
  ];

  console.log('\n=== Adding Missing Clubs ===');
  for (const club of missingClubs) {
    // Check if exists
    const existing = await prisma.club.findFirst({ 
      where: { name: { equals: club.name, mode: 'insensitive' } } 
    });
    
    if (existing) {
      console.log('Already exists:', club.name);
      await prisma.club.update({
        where: { id: existing.id },
        data: { hasNLBMen: club.hasNLBMen || false, hasNLBWomen: club.hasNLBWomen || false }
      });
    } else {
      await prisma.club.create({
        data: {
          name: club.name,
          canton: club.canton as any as import('@prisma/client').Canton,
          town: club.town,
          hasNLBMen: club.hasNLBMen || false,
          hasNLBWomen: club.hasNLBWomen || false,
        }
      });
      console.log('✓ Created:', club.name);
    }
  }

  // Show final counts
  const menCount = await prisma.club.count({ where: { hasNLBMen: true } });
  const womenCount = await prisma.club.count({ where: { hasNLBWomen: true } });
  
  console.log('\n=== FINAL NLB COUNTS ===');
  console.log('NLB Men:', menCount, '(expected: 12)');
  console.log('NLB Women:', womenCount, '(expected: 13)');
  
  // List all NLB teams
  console.log('\n=== NLB Men Teams ===');
  const nlbMenClubs = await prisma.club.findMany({ 
    where: { hasNLBMen: true }, 
    select: { name: true },
    orderBy: { name: 'asc' }
  });
  nlbMenClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
  
  console.log('\n=== NLB Women Teams ===');
  const nlbWomenClubs = await prisma.club.findMany({ 
    where: { hasNLBWomen: true }, 
    select: { name: true },
    orderBy: { name: 'asc' }
  });
  nlbWomenClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
  
  await prisma.$disconnect();
}

main();
