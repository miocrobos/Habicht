import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First reset all NLB flags
  await prisma.club.updateMany({ data: { hasNLBMen: false, hasNLBWomen: false } });
  console.log('Reset all NLB flags');

  // NLB Women teams (13 teams)
  const nlbWomen = [
    'BTV Aarau',
    'Volley Aadorf',
    'Bellinzona Volley',
    'VBC Visp',
    'Volley Oberdiessbach',
    'NNV Eaglets Volley Aarau',
    'VBC Kanti Baden',
    'VBC Servette Star-Onex',
    'Lausanne UC',
    'Volley Luzern',
    'VBC Glaronia',
    'VBC NUC',
    'Volley Köniz'
  ];

  // NLB Men teams (12 teams - excluding national team)
  const nlbMen = [
    'BTV Aarau',
    'TSV Jona',
    'VBC Sursee',
    'Lutry-Lavaux',
    'Volley Amriswil',
    'VBC Uni Bern',
    'Volleyball Papiermühle',
    'Lausanne UC',
    'VBC Servette Star-Onex',
    'City Volley Basel',
    'VBC Aeschi',
    'VBC Voléro Zürich'
  ];

  console.log('\n=== Setting NLB Women ===');
  let womenSet = 0;
  for (const name of nlbWomen) {
    // Try exact match first
    let club = await prisma.club.findFirst({ 
      where: { name: { equals: name, mode: 'insensitive' } } 
    });
    
    if (!club) {
      // Try contains match
      club = await prisma.club.findFirst({ 
        where: { name: { contains: name, mode: 'insensitive' } } 
      });
    }
    
    if (!club) {
      // Try with first two words
      const words = name.split(' ').slice(0, 2).join(' ');
      club = await prisma.club.findFirst({ 
        where: { name: { contains: words, mode: 'insensitive' } } 
      });
    }
    
    if (club) {
      await prisma.club.update({ 
        where: { id: club.id }, 
        data: { hasNLBWomen: true } 
      });
      console.log('✓ Set:', club.name);
      womenSet++;
    } else {
      console.log('✗ NOT FOUND:', name);
    }
  }

  console.log('\n=== Setting NLB Men ===');
  let menSet = 0;
  for (const name of nlbMen) {
    // Try exact match first
    let club = await prisma.club.findFirst({ 
      where: { name: { equals: name, mode: 'insensitive' } } 
    });
    
    if (!club) {
      // Try contains match
      club = await prisma.club.findFirst({ 
        where: { name: { contains: name, mode: 'insensitive' } } 
      });
    }
    
    if (!club) {
      // Try with first word only for short names
      const firstWord = name.split(' ')[0];
      if (firstWord.length >= 4) {
        club = await prisma.club.findFirst({ 
          where: { name: { contains: firstWord, mode: 'insensitive' } } 
        });
      }
    }
    
    if (club) {
      await prisma.club.update({ 
        where: { id: club.id }, 
        data: { hasNLBMen: true } 
      });
      console.log('✓ Set:', club.name);
      menSet++;
    } else {
      console.log('✗ NOT FOUND:', name);
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
    select: { name: true } 
  });
  nlbMenClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
  
  console.log('\n=== NLB Women Teams ===');
  const nlbWomenClubs = await prisma.club.findMany({ 
    where: { hasNLBWomen: true }, 
    select: { name: true } 
  });
  nlbWomenClubs.forEach((c, i) => console.log(`${i + 1}. ${c.name}`));
  
  await prisma.$disconnect();
}

main();
