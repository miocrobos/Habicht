/**
 * Consolidate all Swiss Volleyball data
 * Combines data from:
 * 1. Game Center (NLA/NLB specific teams)
 * 2. Verein Suchen (all 282 clubs with offerings)
 * 3. League statistics from dropdown
 */

import * as fs from 'fs';

interface ClubData {
  name: string;
  postalCode?: string;
  city?: string;
  email?: string;
  website?: string;
  offerings: {
    womenSenior: boolean;
    menSenior: boolean;
    womenYouth: boolean;
    menYouth: boolean;
    kidsVolley: boolean;
    beach: boolean;
  };
  specificLeagues?: {
    womenNLA?: boolean;
    womenNLB?: boolean;
    menNLA?: boolean;
    menNLB?: boolean;
  };
}

function consolidateData(): void {
  console.log('Consolidating Swiss Volleyball Data...\n');
  
  // Load Verein Suchen clubs (282 clubs)
  const vereinSuchenData = JSON.parse(
    fs.readFileSync('data/swiss-volley-clubs-complete.json', 'utf-8')
  );
  
  // Load Game Center NLA/NLB data
  let gameCenterData: any = { clubs: [] };
  try {
    gameCenterData = JSON.parse(
      fs.readFileSync('data/swiss-volleyball-clubs.json', 'utf-8')
    );
  } catch (e) {
    console.log('Game Center data not found, will use only Verein Suchen data');
  }
  
  // Create consolidated club map
  const clubMap = new Map<string, ClubData>();
  
  // Add Verein Suchen clubs
  for (const club of vereinSuchenData.clubs) {
    const key = club.name.toLowerCase().trim();
    clubMap.set(key, {
      name: club.name,
      postalCode: club.postalCode,
      city: club.city,
      email: club.email,
      website: undefined,
      offerings: {
        womenSenior: club.hasWomenSenior || false,
        menSenior: club.hasMenSenior || false,
        womenYouth: club.hasWomenYouth || false,
        menYouth: club.hasMenYouth || false,
        kidsVolley: club.hasKidsVolley || false,
        beach: (club.hasBeachWomen || club.hasBeachMen) || false,
      }
    });
  }
  
  // Add NLA/NLB specific data from Game Center
  if (gameCenterData.clubs) {
    for (const club of gameCenterData.clubs) {
      const key = club.name.toLowerCase().trim();
      
      // Try to find matching club
      let existing = clubMap.get(key);
      
      // If not found by exact name, try partial match
      if (!existing) {
        for (const [existingKey, existingClub] of clubMap) {
          if (existingKey.includes(key) || key.includes(existingKey)) {
            existing = existingClub;
            break;
          }
        }
      }
      
      // Game Center uses boolean flags: hasNLAWomen, hasNLBWomen, hasNLAMen, hasNLBMen
      const specificLeagues = {
        womenNLA: club.hasNLAWomen === true,
        womenNLB: club.hasNLBWomen === true,
        menNLA: club.hasNLAMen === true,
        menNLB: club.hasNLBMen === true,
      };
      
      if (existing) {
        existing.specificLeagues = specificLeagues;
        // Update town/city if available from Game Center
        if (club.town && !existing.city) {
          existing.city = club.town;
        }
      } else {
        // Add new club from Game Center
        clubMap.set(key, {
          name: club.name,
          city: club.town,
          offerings: {
            womenSenior: club.hasNLAWomen || club.hasNLBWomen || club.has1LigaWomen || false,
            menSenior: club.hasNLAMen || club.hasNLBMen || club.has1LigaMen || false,
            womenYouth: club.hasU23Women || club.hasU20Women || club.hasU18Women || false,
            menYouth: club.hasU23Men || club.hasU20Men || club.hasU18Men || false,
            kidsVolley: false,
            beach: false,
          },
          specificLeagues
        });
      }
    }
  }
  
  // Convert to array
  const allClubs = Array.from(clubMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Calculate statistics
  const stats = {
    totalClubs: allClubs.length,
    womenSenior: allClubs.filter(c => c.offerings.womenSenior).length,
    menSenior: allClubs.filter(c => c.offerings.menSenior).length,
    womenYouth: allClubs.filter(c => c.offerings.womenYouth).length,
    menYouth: allClubs.filter(c => c.offerings.menYouth).length,
    kidsVolley: allClubs.filter(c => c.offerings.kidsVolley).length,
    beach: allClubs.filter(c => c.offerings.beach).length,
    womenNLA: allClubs.filter(c => c.specificLeagues?.womenNLA).length,
    womenNLB: allClubs.filter(c => c.specificLeagues?.womenNLB).length,
    menNLA: allClubs.filter(c => c.specificLeagues?.menNLA).length,
    menNLB: allClubs.filter(c => c.specificLeagues?.menNLB).length,
  };
  
  // League statistics from the Angebote dropdown (manually extracted)
  const leagueStatistics = {
    womenSenior: {
      NLA: 9, NLB: 9, '1L': 37, '2L': 83, '3L': 133, '4L': 146, '5L': 105, Senioren: 9
    },
    menSenior: {
      NLA: 6, NLB: 8, '1L': 33, '2L': 73, '3L': 86, '4L': 72, '5L': 18
    },
    womenYouth: {
      U13: 2, U14: 87, U15: 13, U16: 114, U17: 10, U18: 139, U19: 1, U20: 115, U23: 110
    },
    menYouth: {
      U14: 25, U15: 3, U16: 47, U17: 2, U18: 57, U20: 44, U23: 69
    },
    kidsVolley: 125,
    beachWomen: 33,
    beachMen: 25,
    beachYouthWomen: 21,
    beachYouthMen: 17,
    otherAdult: 97,
    otherYouth: 35
  };
  
  // Output
  const output = {
    generatedAt: new Date().toISOString(),
    sources: [
      'https://www.volleyball.ch/de/verband/services/verein-suchen',
      'https://www.volleyball.ch/de/game-center'
    ],
    summary: {
      totalClubs: stats.totalClubs,
      clubsWithWomenSeniorTeams: stats.womenSenior,
      clubsWithMenSeniorTeams: stats.menSenior,
      clubsWithWomenYouthTeams: stats.womenYouth,
      clubsWithMenYouthTeams: stats.menYouth,
      clubsWithKidsVolley: stats.kidsVolley,
      clubsWithBeach: stats.beach,
      clubsWithWomenNLA: stats.womenNLA,
      clubsWithWomenNLB: stats.womenNLB,
      clubsWithMenNLA: stats.menNLA,
      clubsWithMenNLB: stats.menNLB,
    },
    leagueStatistics,
    notes: [
      'Club offerings show ranges (e.g., NLA-5L) not specific leagues per club',
      'NLA/NLB specific data available only for clubs found in Game Center',
      'Lower leagues (1L-5L) are managed by regional federations',
      'Youth leagues are U13-U23',
      'Some clubs may not appear if they opted out of the search',
      'Data may be incomplete during season changeover',
      'Total of 299 clubs expected, 282 successfully scraped'
    ],
    clubs: allClubs
  };
  
  const outputPath = 'data/swiss-volleyball-consolidated.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log('='.repeat(60));
  console.log('CONSOLIDATED DATA SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal clubs: ${stats.totalClubs}`);
  console.log('\nBy category (clubs with teams in that category):');
  console.log(`  Women Senior (NLA-5L): ${stats.womenSenior}`);
  console.log(`  Men Senior (NLA-5L): ${stats.menSenior}`);
  console.log(`  Women Youth (U13-U23): ${stats.womenYouth}`);
  console.log(`  Men Youth (U13-U23): ${stats.menYouth}`);
  console.log(`  Kids Volley: ${stats.kidsVolley}`);
  console.log(`  Beach: ${stats.beach}`);
  console.log('\nNLA/NLB specific (from Game Center):');
  console.log(`  Women NLA: ${stats.womenNLA}`);
  console.log(`  Women NLB: ${stats.womenNLB}`);
  console.log(`  Men NLA: ${stats.menNLA}`);
  console.log(`  Men NLB: ${stats.menNLB}`);
  console.log('\nLeague statistics (club count from Angebote dropdown):');
  console.log('  Women Senior:', leagueStatistics.womenSenior);
  console.log('  Men Senior:', leagueStatistics.menSenior);
  console.log(`\n✅ Data saved to: ${outputPath}`);
}

// Run
consolidateData();
