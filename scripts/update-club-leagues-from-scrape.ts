/**
 * Update Club league boolean flags from scraped data
 * Only includes leagues U18 and above (no U13, U14, U15, U16, U17)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LeagueInfo {
  league: string;
  gender: 'men' | 'women' | 'unknown';
  category: 'senior' | 'youth';
  raw: string;
}

interface ScrapedClub {
  name: string;
  website: string;
  leagues: LeagueInfo[];
  pagesChecked: string[];
  success: boolean;
}

// Map scraped league names to database field names
function getLeagueFieldName(league: string, gender: 'men' | 'women'): string | null {
  const genderSuffix = gender === 'men' ? 'Men' : 'Women';
  
  switch (league.toUpperCase()) {
    case 'NLA':
      return `hasNLA${genderSuffix}`;
    case 'NLB':
      return `hasNLB${genderSuffix}`;
    case '1L':
    case '1. LIGA':
    case 'FIRST_LEAGUE':
      return `has1Liga${genderSuffix}`;
    case '2L':
    case '2. LIGA':
    case 'SECOND_LEAGUE':
      return `has2Liga${genderSuffix}`;
    case '3L':
    case '3. LIGA':
    case 'THIRD_LEAGUE':
      return `has3Liga${genderSuffix}`;
    case '4L':
    case '4. LIGA':
    case 'FOURTH_LEAGUE':
      return `has4Liga${genderSuffix}`;
    case '5L':
    case '5. LIGA':
    case 'FIFTH_LEAGUE':
      return `has5Liga${genderSuffix}`;
    case 'U23':
    case 'YOUTH_U23':
      return `hasU23${genderSuffix}`;
    case 'U20':
    case 'YOUTH_U20':
      return `hasU20${genderSuffix}`;
    case 'U18':
    case 'YOUTH_U18':
      return `hasU18${genderSuffix}`;
    default:
      // Skip U13, U14, U15, U16, U17, JUNIORS, NACHWUCHS, etc.
      return null;
  }
}

// Normalize club name for matching
function normalizeClubName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9äöüàéèêîôûç]/g, '')
    .replace(/vbc|volley|volleyball|club/g, '');
}

async function main() {
  console.log('🏐 Updating Club League Data from Scrape\n');
  
  // Load scraped data
  const scrapedPath = path.join(__dirname, '../data/club-leagues-thorough.json');
  const scrapedData: ScrapedClub[] = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
  
  console.log(`📊 Loaded ${scrapedData.length} scraped clubs\n`);
  
  // Get all clubs from database
  const dbClubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      hasNLAMen: true,
      hasNLAWomen: true,
      hasNLBMen: true,
      hasNLBWomen: true,
      has1LigaMen: true,
      has1LigaWomen: true,
      has2LigaMen: true,
      has2LigaWomen: true,
      has3LigaMen: true,
      has3LigaWomen: true,
      has4LigaMen: true,
      has4LigaWomen: true,
      has5LigaMen: true,
      has5LigaWomen: true,
      hasU23Men: true,
      hasU23Women: true,
      hasU20Men: true,
      hasU20Women: true,
      hasU18Men: true,
      hasU18Women: true,
    }
  });
  
  console.log(`📊 Found ${dbClubs.length} clubs in database\n`);
  
  // FIRST: Reset ALL clubs to have no leagues
  console.log('🔄 Resetting all club leagues to false...\n');
  await prisma.club.updateMany({
    data: {
      hasNLAMen: false,
      hasNLAWomen: false,
      hasNLBMen: false,
      hasNLBWomen: false,
      has1LigaMen: false,
      has1LigaWomen: false,
      has2LigaMen: false,
      has2LigaWomen: false,
      has3LigaMen: false,
      has3LigaWomen: false,
      has4LigaMen: false,
      has4LigaWomen: false,
      has5LigaMen: false,
      has5LigaWomen: false,
      hasU23Men: false,
      hasU23Women: false,
      hasU20Men: false,
      hasU20Women: false,
      hasU18Men: false,
      hasU18Women: false,
    }
  });
  console.log('✅ All club leagues reset\n');
  
  let updated = 0;
  let notFound = 0;
  
  for (const dbClub of dbClubs) {
    const normalizedDbName = normalizeClubName(dbClub.name);
    
    // Find matching scraped club
    const scrapedClub = scrapedData.find(sc => {
      const normalizedScName = normalizeClubName(sc.name);
      return normalizedScName === normalizedDbName ||
             normalizedScName.includes(normalizedDbName) ||
             normalizedDbName.includes(normalizedScName);
    });
    
    if (!scrapedClub || !scrapedClub.leagues || scrapedClub.leagues.length === 0) {
      notFound++;
      continue;
    }
    
    // Build update object - first reset all to false
    const updateData: Record<string, boolean> = {
      hasNLAMen: false,
      hasNLAWomen: false,
      hasNLBMen: false,
      hasNLBWomen: false,
      has1LigaMen: false,
      has1LigaWomen: false,
      has2LigaMen: false,
      has2LigaWomen: false,
      has3LigaMen: false,
      has3LigaWomen: false,
      has4LigaMen: false,
      has4LigaWomen: false,
      has5LigaMen: false,
      has5LigaWomen: false,
      hasU23Men: false,
      hasU23Women: false,
      hasU20Men: false,
      hasU20Women: false,
      hasU18Men: false,
      hasU18Women: false,
    };
    
    // Set leagues based on scraped data
    for (const league of scrapedClub.leagues) {
      // Skip if gender is unknown - we'll set both
      if (league.gender === 'unknown') {
        const menField = getLeagueFieldName(league.league, 'men');
        const womenField = getLeagueFieldName(league.league, 'women');
        if (menField) updateData[menField] = true;
        if (womenField) updateData[womenField] = true;
      } else {
        const field = getLeagueFieldName(league.league, league.gender);
        if (field) {
          updateData[field] = true;
        }
      }
    }
    
    // Check if any league is set
    const hasAnyLeague = Object.values(updateData).some(v => v === true);
    
    if (hasAnyLeague) {
      await prisma.club.update({
        where: { id: dbClub.id },
        data: updateData
      });
      
      const leaguesList = Object.entries(updateData)
        .filter(([_, v]) => v === true)
        .map(([k, _]) => k.replace('has', ''))
        .join(', ');
      
      console.log(`✅ ${dbClub.name}: ${leaguesList}`);
      updated++;
    }
  }
  
  console.log(`\n\n📊 SUMMARY`);
  console.log(`===========`);
  console.log(`Total clubs in DB: ${dbClubs.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`No scraped data found: ${notFound}`);
  console.log(`Unchanged: ${dbClubs.length - updated - notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
