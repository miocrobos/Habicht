/**
 * COMPREHENSIVE SWISS VOLLEY SCRAPER
 * 
 * Combines Game Center (for specific leagues NLA/NLB) with Verein suchen (for all clubs)
 * 
 * Strategy:
 * 1. Game Center: Get NLA and NLB teams (national level)
 * 2. Verein suchen: Get all clubs and their general offerings
 * 3. For lower leagues, we note that the club has teams but can't determine exact level
 * 
 * Note: Lower leagues (1L, 2L, 3L, 4L, 5L) are managed by regional associations,
 * so they may not appear in the national Game Center view.
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ClubData {
  name: string;
  postalCode?: string;
  city?: string;
  contact?: string;
  website?: string;
  // National leagues (from Game Center)
  wNLA: boolean;
  wNLB: boolean;
  mNLA: boolean;
  mNLB: boolean;
  // Regional/lower leagues (from Verein suchen - we know they have teams but not exact level)
  hasWomenSenior: boolean;  // Has any women's senior team (NLA-5L)
  hasMenSenior: boolean;    // Has any men's senior team (NLA-5L)
  hasWomenYouth: boolean;   // Has women's youth team (U23-U13)
  hasMenYouth: boolean;     // Has men's youth team (U23-U13)
  hasKidsVolley: boolean;
  hasBeachWomen: boolean;
  hasBeachMen: boolean;
  hasBeachYouthWomen: boolean;
  hasBeachYouthMen: boolean;
  hasOtherAdult: boolean;
  hasOtherYouth: boolean;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract teams from Game Center page text
function extractTeamsFromText(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  let inTeamsSection = false;
  
  for (const line of lines) {
    if (line === 'Teams ausblenden' || line === 'Teams einblenden') {
      inTeamsSection = true;
      continue;
    }
    
    if (inTeamsSection && (
      line === 'Spielplan' || 
      line === 'Rangliste' || 
      line.startsWith('Zu den') ||
      line.startsWith('Zur ') ||
      line.match(/^\d{2}\.\d{2}\.\d{2}/) ||
      line.match(/^\d{1,2}\.\s+\w+\s+\d{4}/)
    )) {
      break;
    }
    
    if (inTeamsSection && line.length > 2) {
      if (!['Teams', 'Teams ausblenden', 'Teams einblenden', 'Rangliste', 'Spielplan'].includes(line)) {
        teams.push(line);
      }
    }
  }
  
  return teams;
}

// Extract club name from team name
function extractClubName(teamName: string): string {
  return teamName
    .replace(/\s+(I{1,3}|IV|V|VI|VII|[1-9])$/i, '')
    .replace(/\s+[A-D]$/i, '')
    .replace(/\s+D[1-5]$/i, '')
    .replace(/\s+\d{4}\s*$/g, '')
    .replace(/^\d{4}\s+/g, '')
    .trim();
}

async function main() {
  console.log('═'.repeat(70));
  console.log('COMPREHENSIVE SWISS VOLLEY CLUB SCRAPER');
  console.log('Combining Game Center + Verein suchen data');
  console.log('═'.repeat(70));

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  const clubsData: Map<string, ClubData> = new Map();
  
  const getOrCreateClub = (name: string): ClubData => {
    const clubName = extractClubName(name);
    if (!clubsData.has(clubName)) {
      clubsData.set(clubName, {
        name: clubName,
        wNLA: false, wNLB: false, mNLA: false, mNLB: false,
        hasWomenSenior: false, hasMenSenior: false,
        hasWomenYouth: false, hasMenYouth: false,
        hasKidsVolley: false,
        hasBeachWomen: false, hasBeachMen: false,
        hasBeachYouthWomen: false, hasBeachYouthMen: false,
        hasOtherAdult: false, hasOtherYouth: false,
      });
    }
    return clubsData.get(clubName)!;
  };

  // ============================================================
  // PART 1: GAME CENTER - Get NLA/NLB teams
  // ============================================================
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ PART 1: GAME CENTER - National Leagues (NLA/NLB)');
  console.log('█'.repeat(70));

  try {
    console.log('\n📡 Navigating to Game Center...');
    await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
    await delay(3000);

    // Helper functions
    const scrapeCurrentView = async (key: 'wNLA' | 'wNLB' | 'mNLA' | 'mNLB', label: string) => {
      console.log(`\n   📋 ${label}`);
      await delay(1500);
      
      const expandButton = page.locator('text="Teams einblenden"');
      if (await expandButton.count() > 0) {
        await expandButton.click();
        await delay(1000);
      }
      
      const bodyText = await page.locator('body').innerText();
      const teams = extractTeamsFromText(bodyText);
      
      if (teams.length > 0) {
        console.log(`      ✅ Found ${teams.length} teams`);
        for (const team of teams) {
          const club = getOrCreateClub(team);
          club[key] = true;
          // Also mark as having senior team
          if (key.startsWith('w')) club.hasWomenSenior = true;
          if (key.startsWith('m')) club.hasMenSenior = true;
        }
      } else {
        console.log(`      ⚠️ No teams found`);
      }
      return teams.length;
    };

    const selectDropdownOption = async (dropdownText: string, optionText: string): Promise<boolean> => {
      try {
        const dropdownButton = page.locator(`button:has-text("${dropdownText}")`).first();
        if (await dropdownButton.count() === 0) return false;
        
        await dropdownButton.click();
        await delay(500);
        
        const option = page.locator(`text="${optionText}"`).first();
        if (await option.count() === 0) {
          await page.keyboard.press('Escape');
          return false;
        }
        
        await option.click();
        await delay(1500);
        return true;
      } catch {
        return false;
      }
    };

    const switchGender = async (gender: 'Frauen' | 'Männer'): Promise<boolean> => {
      try {
        const filterButton = page.locator(`.filter-button:has-text("${gender}")`).first();
        if (await filterButton.count() > 0) {
          await filterButton.click();
          await delay(2000);
          return true;
        }
        
        const textEl = page.locator(`text="${gender}"`).first();
        if (await textEl.count() > 0) {
          await textEl.click();
          await delay(2000);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    // Women NLA (default view)
    await scrapeCurrentView('wNLA', 'Women NLA');
    
    // Women NLB
    if (await selectDropdownOption('Liga:', 'NLB')) {
      await scrapeCurrentView('wNLB', 'Women NLB');
    }
    
    // Switch to Men
    await switchGender('Männer');
    
    // Men NLA
    if (await selectDropdownOption('Liga:', 'NLA')) {
      await scrapeCurrentView('mNLA', 'Men NLA');
    }
    
    // Men NLB
    if (await selectDropdownOption('Liga:', 'NLB')) {
      await scrapeCurrentView('mNLB', 'Men NLB');
    }

  } catch (error) {
    console.log(`\n   ❌ Game Center error: ${error}`);
  }

  // ============================================================
  // PART 2: VEREIN SUCHEN - Get all clubs
  // ============================================================
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ PART 2: VEREIN SUCHEN - All Clubs');
  console.log('█'.repeat(70));

  try {
    console.log('\n📡 Navigating to Verein suchen...');
    await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { 
      waitUntil: 'networkidle' 
    });
    await delay(5000);
    
    // Scroll to load all clubs
    console.log('   Scrolling to load all clubs...');
    
    let previousClubCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 50;
    
    while (scrollAttempts < maxScrollAttempts) {
      await page.evaluate(() => window.scrollBy(0, 2000));
      await delay(500);
      
      const bodyText = await page.locator('body').innerText();
      const currentMatch = bodyText.match(/(\d+)\s+Vereine gefunden/);
      const totalClubs = currentMatch ? parseInt(currentMatch[1]) : 0;
      
      // Count visible clubs in the page
      const clubCards = await page.locator('[class*="club"], [class*="verein"], article').count();
      
      if (clubCards > previousClubCount) {
        previousClubCount = clubCards;
        scrollAttempts = 0; // Reset if we're still loading
      } else {
        scrollAttempts++;
      }
      
      if (scrollAttempts > 10 && previousClubCount > 0) break;
    }
    
    console.log(`   Loaded approximately ${previousClubCount} club cards`);
    
    // Extract club data
    console.log('   Extracting club data...');
    
    const bodyText = await page.locator('body').innerText();
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
    
    // Parse club entries
    let currentClub: ClubData | null = null;
    let inAngebotSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip headers and navigation
      if (line.includes('Verein suchen') || line.includes('Swiss Volley') ||
          line.includes('Treffer') || line.match(/^\d+$/) ||
          line === 'Details' || line === 'Karte' || line === 'Angebot') {
        continue;
      }
      
      // Detect club name (followed by postal code pattern or "Angebot")
      if (line.length > 2 && line.length < 80 && /^[A-ZÄÖÜ]/.test(line)) {
        const nextLine = lines[i + 1] || '';
        const nextNextLine = lines[i + 2] || '';
        
        // Check if this looks like a club name
        if (nextLine.match(/^\d{4}\s/) || nextLine === 'Angebot' ||
            (nextLine.startsWith('Kontakt:') || nextNextLine === 'Angebot')) {
          currentClub = getOrCreateClub(line);
          inAngebotSection = false;
          continue;
        }
      }
      
      // Detect Angebot section
      if (line === 'Angebot') {
        inAngebotSection = true;
        continue;
      }
      
      // Detect end of Angebot section
      if (line === 'Vereinswebseite' || line.match(/^\d{4}\s/) || 
          (line.length > 2 && /^[A-ZÄÖÜ]/.test(line) && lines[i + 1]?.match(/^\d{4}\s/))) {
        inAngebotSection = false;
        if (line === 'Vereinswebseite') continue;
      }
      
      // Parse offerings
      if (currentClub && inAngebotSection) {
        if (line.includes('Volleyball Frauen (NLA')) {
          currentClub.hasWomenSenior = true;
        }
        if (line.includes('Volleyball Männer (NLA')) {
          currentClub.hasMenSenior = true;
        }
        if (line.includes('Volleyball Juniorinnen')) {
          currentClub.hasWomenYouth = true;
        }
        if (line.includes('Volleyball Junioren')) {
          currentClub.hasMenYouth = true;
        }
        if (line.includes('Kids Volley')) {
          currentClub.hasKidsVolley = true;
        }
        if (line.includes('Beachvolleyball Frauen')) {
          currentClub.hasBeachWomen = true;
        }
        if (line.includes('Beachvolleyball Männer')) {
          currentClub.hasBeachMen = true;
        }
        if (line.includes('Beachvolleyball Juniorinnen')) {
          currentClub.hasBeachYouthWomen = true;
        }
        if (line.includes('Beachvolleyball Junioren')) {
          currentClub.hasBeachYouthMen = true;
        }
        if (line.includes('Weitere Angebote Erwachsene')) {
          currentClub.hasOtherAdult = true;
        }
        if (line.includes('Weitere Angebote Nachwuchs')) {
          currentClub.hasOtherYouth = true;
        }
      }
      
      // Extract postal code and city
      if (currentClub && line.match(/^\d{4}\s+\w/)) {
        const match = line.match(/^(\d{4})\s+(.+)$/);
        if (match) {
          currentClub.postalCode = match[1];
          currentClub.city = match[2];
        }
      }
      
      // Extract contact
      if (currentClub && line.startsWith('Kontakt:')) {
        currentClub.contact = line.replace('Kontakt:', '').trim();
      }
    }
    
  } catch (error) {
    console.log(`\n   ❌ Verein suchen error: ${error}`);
  }

  await browser.close();

  // ============================================================
  // RESULTS
  // ============================================================
  console.log('\n\n' + '═'.repeat(70));
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(70));
  
  const clubs = Array.from(clubsData.values());
  
  // Count statistics
  let nlaClubs = 0, nlbClubs = 0, seniorWomen = 0, seniorMen = 0, youthClubs = 0;
  for (const club of clubs) {
    if (club.wNLA || club.mNLA) nlaClubs++;
    if (club.wNLB || club.mNLB) nlbClubs++;
    if (club.hasWomenSenior) seniorWomen++;
    if (club.hasMenSenior) seniorMen++;
    if (club.hasWomenYouth || club.hasMenYouth) youthClubs++;
  }
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Total clubs: ${clubs.length}`);
  console.log(`   NLA clubs: ${nlaClubs}`);
  console.log(`   NLB clubs: ${nlbClubs}`);
  console.log(`   Clubs with women's senior teams: ${seniorWomen}`);
  console.log(`   Clubs with men's senior teams: ${seniorMen}`);
  console.log(`   Clubs with youth programs: ${youthClubs}`);
  
  // Show sample of clubs with NLA/NLB
  console.log(`\n📋 NLA/NLB Clubs:`);
  const topClubs = clubs.filter(c => c.wNLA || c.mNLA || c.wNLB || c.mNLB);
  for (const club of topClubs.sort((a, b) => a.name.localeCompare(b.name))) {
    const leagues: string[] = [];
    if (club.wNLA) leagues.push('W-NLA');
    if (club.wNLB) leagues.push('W-NLB');
    if (club.mNLA) leagues.push('M-NLA');
    if (club.mNLB) leagues.push('M-NLB');
    console.log(`   ${club.name}: ${leagues.join(', ')}`);
  }
  
  // Check specific clubs
  console.log(`\n🔍 Checking specific clubs:`);
  const checkClubs = ['Volley Luzern', 'VTV Horw', 'Voléro', 'Pfeffingen', 'NUC', 'Amriswil'];
  for (const name of checkClubs) {
    const found = clubs.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      const info: string[] = [];
      if (found.wNLA) info.push('W-NLA');
      if (found.wNLB) info.push('W-NLB');
      if (found.mNLA) info.push('M-NLA');
      if (found.mNLB) info.push('M-NLB');
      if (found.hasWomenSenior && !found.wNLA && !found.wNLB) info.push('W-Senior(lower)');
      if (found.hasMenSenior && !found.mNLA && !found.mNLB) info.push('M-Senior(lower)');
      if (found.hasWomenYouth) info.push('W-Youth');
      if (found.hasMenYouth) info.push('M-Youth');
      console.log(`   ✅ ${found.name}: ${info.join(', ') || 'no volleyball offerings'}`);
    } else {
      console.log(`   ❌ ${name}: NOT FOUND`);
    }
  }
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'data');
  
  const output = {
    scrapedAt: new Date().toISOString(),
    sources: [
      'https://www.volleyball.ch/de/game-center (NLA/NLB)',
      'https://www.volleyball.ch/de/verband/services/verein-suchen (all clubs)'
    ],
    note: 'NLA/NLB are exact. Lower leagues (1L-5L) are indicated as hasWomenSenior/hasMenSenior without specific level.',
    statistics: {
      totalClubs: clubs.length,
      nlaClubs,
      nlbClubs,
      seniorWomen,
      seniorMen,
      youthClubs
    },
    clubs: clubs.sort((a, b) => a.name.localeCompare(b.name))
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'swiss-volley-complete-clubs.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );
  
  console.log(`\n💾 Saved to: data/swiss-volley-complete-clubs.json`);
  
  console.log('\n' + '═'.repeat(70));
  console.log('DONE');
  console.log('═'.repeat(70));
}

main().catch(console.error);
