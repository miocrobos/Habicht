/**
 * Check current NLA clubs in database vs scraped data
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('=== CHECKING DATABASE vs SCRAPED DATA ===\n');
  
  // Get clubs marked as NLA in database
  const nlaClubs = await prisma.club.findMany({
    where: {
      OR: [
        { hasNLAMen: true },
        { hasNLAWomen: true }
      ]
    },
    select: {
      name: true,
      hasNLAMen: true,
      hasNLAWomen: true,
      hasNLBMen: true,
      hasNLBWomen: true
    }
  });
  
  console.log('CLUBS MARKED AS NLA IN DATABASE:');
  console.log('================================');
  nlaClubs.forEach(c => {
    const leagues = [];
    if (c.hasNLAMen) leagues.push('Men NLA');
    if (c.hasNLAWomen) leagues.push('Women NLA');
    console.log(`  ${c.name}: ${leagues.join(', ')}`);
  });
  console.log(`\nTotal: ${nlaClubs.length} clubs marked as NLA\n`);
  
  // Load scraped data
  const scrapedPath = path.join(__dirname, '../data/club-leagues-thorough.json');
  const scrapedData = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
  
  // Find NLA clubs in scraped data
  console.log('\nNLA CLUBS IN SCRAPED DATA:');
  console.log('==========================');
  
  const scrapedNLA: { name: string; men: boolean; women: boolean }[] = [];
  
  for (const club of scrapedData) {
    const hasNLAMen = club.leagues?.some((l: any) => 
      l.league === 'NLA' && l.gender === 'men'
    );
    const hasNLAWomen = club.leagues?.some((l: any) => 
      l.league === 'NLA' && l.gender === 'women'
    );
    
    if (hasNLAMen || hasNLAWomen) {
      scrapedNLA.push({ name: club.name, men: hasNLAMen, women: hasNLAWomen });
      const leagues = [];
      if (hasNLAMen) leagues.push('Men NLA');
      if (hasNLAWomen) leagues.push('Women NLA');
      console.log(`  ${club.name}: ${leagues.join(', ')}`);
    }
  }
  console.log(`\nTotal: ${scrapedNLA.length} clubs with NLA in scraped data\n`);
  
  // Compare
  console.log('\n=== COMPARISON ===');
  
  const dbNames = new Set(nlaClubs.map(c => c.name.toLowerCase()));
  const scrapedNames = new Set(scrapedNLA.map(c => c.name.toLowerCase()));
  
  console.log('\nIn DB but NOT in scraped (possible false positives):');
  nlaClubs.forEach(c => {
    if (!scrapedNames.has(c.name.toLowerCase())) {
      console.log(`  ⚠️  ${c.name}`);
    }
  });
  
  console.log('\nIn scraped but NOT in DB (missing from database):');
  scrapedNLA.forEach(c => {
    if (!dbNames.has(c.name.toLowerCase())) {
      console.log(`  ➕ ${c.name}`);
    }
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
