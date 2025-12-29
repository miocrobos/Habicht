/**
 * COMPLETE SWISS VOLLEY LEAGUE SCRAPER v2
 * 
 * Scrapes ALL leagues from NLA down to U18 for both Men and Women
 * Uses interactive navigation on the main game-center page (v10 method)
 * 
 * Leagues covered:
 * - Senior (Meisterschaft): NLA, NLB, 1. Liga, 2. Liga, 3. Liga
 * - Youth (Nachwuchs): U23, U20, U18
 * 
 * For both Men (M) and Women (W)
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ClubLeagues {
  name: string;
  // Women Senior
  wNLA: boolean;
  wNLB: boolean;
  w1L: boolean;
  w2L: boolean;
  w3L: boolean;
  // Men Senior
  mNLA: boolean;
  mNLB: boolean;
  m1L: boolean;
  m2L: boolean;
  m3L: boolean;
  // Women Youth
  wU23: boolean;
  wU20: boolean;
  wU18: boolean;
  // Men Youth
  mU23: boolean;
  mU20: boolean;
  mU18: boolean;
}

interface TeamInfo {
  teamName: string;
  clubName: string;
  league: string;
  gender: 'men' | 'women';
  category: 'senior' | 'youth';
}

type LeagueKey = keyof Omit<ClubLeagues, 'name'>;

// Extract club name from team name (remove suffixes like I, II, III, 1, 2, D1, D2, etc.)
// Also ignores postal codes
function extractClubName(teamName: string): string {
  return teamName
    // Remove Roman numerals and numbers at the end
    .replace(/\s+(I{1,3}|IV|V|VI|VII|[1-9])$/i, '')
    // Remove letter designations at the end
    .replace(/\s+[A-D]$/i, '')
    // Remove D1, D2 style designations
    .replace(/\s+D[1-5]$/i, '')
    // Remove postal codes (4 digits) - disregard when matching
    .replace(/\s+\d{4}\s*$/g, '')
    .replace(/^\d{4}\s+/g, '')
    .trim();
}

// Extract teams from rendered page text (v10 method)
function extractTeamsFromText(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  let inTeamsSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Start of teams section
    if (line === 'Teams ausblenden' || line === 'Teams einblenden') {
      inTeamsSection = true;
      continue;
    }
    
    // End markers
    if (inTeamsSection && (
      line === 'Spielplan' || 
      line === 'Rangliste' || 
      line.startsWith('Zu den') ||
      line.startsWith('Zur ') ||
      line.match(/^\d{2}\.\d{2}\.\d{2}/) || // Date pattern DD.MM.YY
      line.match(/^\d{1,2}\.\s+\w+\s+\d{4}/) || // Date pattern like "3. Januar 2026"
      line.match(/^\d{2}:\d{2}$/) // Time pattern
    )) {
      break;
    }
    
    // Collect team names
    if (inTeamsSection && line.length > 2) {
      // Skip navigation/UI elements
      if (!['Teams', 'Teams ausblenden', 'Teams einblenden', 'Rangliste', 'Spielplan'].includes(line)) {
        teams.push(line);
      }
    }
  }
  
  return teams;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(70));
  console.log('COMPLETE SWISS VOLLEY LEAGUE SCRAPER v2');
  console.log('Scraping ALL leagues: NLA → 3L + U23 → U18 for Men and Women');
  console.log('Using interactive navigation (v10 method)');
  console.log('═'.repeat(70));

  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // Store clubs data
  const clubsData: Map<string, ClubLeagues> = new Map();
  const allTeams: TeamInfo[] = [];
  
  // Helper to get or create club entry
  const getOrCreateClub = (teamName: string): ClubLeagues => {
    const clubName = extractClubName(teamName);
    
    if (!clubsData.has(clubName)) {
      clubsData.set(clubName, {
        name: clubName,
        // Women Senior
        wNLA: false, wNLB: false, w1L: false, w2L: false, w3L: false,
        // Men Senior
        mNLA: false, mNLB: false, m1L: false, m2L: false, m3L: false,
        // Women Youth
        wU23: false, wU20: false, wU18: false,
        // Men Youth
        mU23: false, mU20: false, mU18: false,
      });
    }
    
    return clubsData.get(clubName)!;
  };

  // Statistics
  const stats = {
    successful: 0,
    failed: 0,
    teamsFound: 0,
  };

  // Scrape current view
  const scrapeCurrentView = async (key: LeagueKey, label: string, gender: 'men' | 'women', category: 'senior' | 'youth', league: string): Promise<number> => {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📋 ${label}`);
    
    try {
      // Wait for page to stabilize
      await delay(1500);
      
      // Get body text
      const bodyText = await page.locator('body').innerText();
      
      // Try to expand teams if collapsed
      const expandButton = page.locator('text="Teams einblenden"');
      if (await expandButton.count() > 0) {
        await expandButton.click();
        await delay(1000);
      }
      
      // Extract teams
      const finalText = await page.locator('body').innerText();
      const teams = extractTeamsFromText(finalText);
      
      if (teams.length > 0) {
        console.log(`   ✅ Found ${teams.length} teams:`);
        
        for (const teamName of teams) {
          const club = getOrCreateClub(teamName);
          (club as any)[key] = true;
          
          allTeams.push({
            teamName,
            clubName: extractClubName(teamName),
            league,
            gender,
            category,
          });
          
          console.log(`      - ${teamName} → ${extractClubName(teamName)}`);
        }
        
        stats.successful++;
        stats.teamsFound += teams.length;
        return teams.length;
      } else {
        console.log(`   ⚠️  No teams found in section`);
        stats.failed++;
        return 0;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      stats.failed++;
      return 0;
    }
  };

  // Click dropdown and select option
  const selectDropdownOption = async (dropdownText: string, optionText: string): Promise<boolean> => {
    try {
      // Find and click the dropdown button
      const dropdownButton = page.locator(`button:has-text("${dropdownText}")`).first();
      if (await dropdownButton.count() === 0) {
        console.log(`      Could not find dropdown: ${dropdownText}`);
        return false;
      }
      
      await dropdownButton.click();
      await delay(500);
      
      // Find and click the option
      const option = page.locator(`text="${optionText}"`).first();
      if (await option.count() === 0) {
        console.log(`      Could not find option: ${optionText}`);
        // Close dropdown by pressing Escape
        await page.keyboard.press('Escape');
        return false;
      }
      
      await option.click();
      await delay(1500);
      return true;
    } catch (error) {
      console.log(`      Error selecting ${optionText}: ${error}`);
      return false;
    }
  };

  // Switch gender
  const switchGender = async (gender: 'Frauen' | 'Männer'): Promise<boolean> => {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🔄 Switching to ${gender}...`);
    
    try {
      // Try filter button approach
      const filterButton = page.locator(`.filter-button:has-text("${gender}")`).first();
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await delay(2000);
        console.log(`   ✅ Switched to ${gender}`);
        return true;
      }
      
      // Try regular button approach
      const button = page.locator(`button:has-text("${gender}")`).first();
      if (await button.count() > 0) {
        await button.click();
        await delay(2000);
        console.log(`   ✅ Switched to ${gender}`);
        return true;
      }
      
      // Try text click approach
      const textEl = page.locator(`text="${gender}"`).first();
      if (await textEl.count() > 0) {
        await textEl.click();
        await delay(2000);
        console.log(`   ✅ Switched to ${gender}`);
        return true;
      }
      
      console.log(`   ❌ Could not switch to ${gender}`);
      return false;
    } catch (error) {
      console.log(`   ❌ Error switching gender: ${error}`);
      return false;
    }
  };

  // Switch to Nachwuchs (youth) section
  const switchToNachwuchs = async (): Promise<boolean> => {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🔄 Switching to Nachwuchs (Youth)...`);
    
    try {
      // Try filter button approach
      const filterButton = page.locator(`.filter-button:has-text("Nachwuchs")`).first();
      if (await filterButton.count() > 0) {
        await filterButton.click();
        await delay(2000);
        console.log(`   ✅ Switched to Nachwuchs`);
        return true;
      }
      
      // Try regular text click
      const textEl = page.locator(`text="Nachwuchs"`).first();
      if (await textEl.count() > 0) {
        await textEl.click();
        await delay(2000);
        console.log(`   ✅ Switched to Nachwuchs`);
        return true;
      }
      
      console.log(`   ❌ Could not switch to Nachwuchs`);
      return false;
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      return false;
    }
  };

  // Switch to Meisterschaft (senior) section
  const switchToMeisterschaft = async (): Promise<boolean> => {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🔄 Switching to Meisterschaft (Senior)...`);
    
    try {
      const textEl = page.locator(`text="Meisterschaft"`).first();
      if (await textEl.count() > 0) {
        await textEl.click();
        await delay(2000);
        console.log(`   ✅ Switched to Meisterschaft`);
        return true;
      }
      
      console.log(`   ❌ Could not switch to Meisterschaft`);
      return false;
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      return false;
    }
  };

  // ============================================================
  // START SCRAPING
  // ============================================================
  
  console.log('\n📡 Navigating to Game Center...');
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await delay(3000);
  
  // Save initial screenshot for debugging
  await page.screenshot({ path: path.join(__dirname, '..', 'data', 'gc-initial.png'), fullPage: true });
  
  // ============================================================
  // PART 1: WOMEN SENIOR (MEISTERSCHAFT)
  // ============================================================
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ PART 1: WOMEN SENIOR LEAGUES (Meisterschaft)');
  console.log('█'.repeat(70));
  
  // Women NLA (should be default)
  await scrapeCurrentView('wNLA', 'Women NLA', 'women', 'senior', 'NLA');
  
  // Women NLB
  if (await selectDropdownOption('Liga:', 'NLB')) {
    await scrapeCurrentView('wNLB', 'Women NLB', 'women', 'senior', 'NLB');
  }
  
  // Women 1. Liga
  if (await selectDropdownOption('Liga:', '1. Liga')) {
    await scrapeCurrentView('w1L', 'Women 1. Liga', 'women', 'senior', '1. Liga');
  }
  
  // Women 2. Liga
  if (await selectDropdownOption('Liga:', '2. Liga')) {
    await scrapeCurrentView('w2L', 'Women 2. Liga', 'women', 'senior', '2. Liga');
  }
  
  // Women 3. Liga
  if (await selectDropdownOption('Liga:', '3. Liga')) {
    await scrapeCurrentView('w3L', 'Women 3. Liga', 'women', 'senior', '3. Liga');
  }

  // ============================================================
  // PART 2: MEN SENIOR (MEISTERSCHAFT)
  // ============================================================
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ PART 2: MEN SENIOR LEAGUES (Meisterschaft)');
  console.log('█'.repeat(70));
  
  await switchGender('Männer');
  
  // Men NLA
  if (await selectDropdownOption('Liga:', 'NLA')) {
    await scrapeCurrentView('mNLA', 'Men NLA', 'men', 'senior', 'NLA');
  }
  
  // Men NLB
  if (await selectDropdownOption('Liga:', 'NLB')) {
    await scrapeCurrentView('mNLB', 'Men NLB', 'men', 'senior', 'NLB');
  }
  
  // Men 1. Liga
  if (await selectDropdownOption('Liga:', '1. Liga')) {
    await scrapeCurrentView('m1L', 'Men 1. Liga', 'men', 'senior', '1. Liga');
  }
  
  // Men 2. Liga
  if (await selectDropdownOption('Liga:', '2. Liga')) {
    await scrapeCurrentView('m2L', 'Men 2. Liga', 'men', 'senior', '2. Liga');
  }
  
  // Men 3. Liga
  if (await selectDropdownOption('Liga:', '3. Liga')) {
    await scrapeCurrentView('m3L', 'Men 3. Liga', 'men', 'senior', '3. Liga');
  }

  // ============================================================
  // PART 3: WOMEN YOUTH (NACHWUCHS)
  // ============================================================
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ PART 3: WOMEN YOUTH LEAGUES (Nachwuchs)');
  console.log('█'.repeat(70));
  
  // Switch back to Women
  await switchGender('Frauen');
  await delay(1000);
  
  // Switch to Nachwuchs
  if (await switchToNachwuchs()) {
    // Women U23
    if (await selectDropdownOption('Liga:', 'U23')) {
      await scrapeCurrentView('wU23', 'Women U23', 'women', 'youth', 'U23');
    }
    
    // Women U20
    if (await selectDropdownOption('Liga:', 'U20')) {
      await scrapeCurrentView('wU20', 'Women U20', 'women', 'youth', 'U20');
    }
    
    // Women U18
    if (await selectDropdownOption('Liga:', 'U18')) {
      await scrapeCurrentView('wU18', 'Women U18', 'women', 'youth', 'U18');
    }
  }

  // ============================================================
  // PART 4: MEN YOUTH (NACHWUCHS)
  // ============================================================
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ PART 4: MEN YOUTH LEAGUES (Nachwuchs)');
  console.log('█'.repeat(70));
  
  await switchGender('Männer');
  
  // Make sure we're on Nachwuchs
  await switchToNachwuchs();
  
  // Men U23
  if (await selectDropdownOption('Liga:', 'U23')) {
    await scrapeCurrentView('mU23', 'Men U23', 'men', 'youth', 'U23');
  }
  
  // Men U20
  if (await selectDropdownOption('Liga:', 'U20')) {
    await scrapeCurrentView('mU20', 'Men U20', 'men', 'youth', 'U20');
  }
  
  // Men U18
  if (await selectDropdownOption('Liga:', 'U18')) {
    await scrapeCurrentView('mU18', 'Men U18', 'men', 'youth', 'U18');
  }

  // Save final screenshot
  await page.screenshot({ path: path.join(__dirname, '..', 'data', 'gc-final.png'), fullPage: true });
  
  await browser.close();

  // ============================================================
  // RESULTS
  // ============================================================
  console.log('\n\n' + '═'.repeat(70));
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(70));
  
  const clubs = Array.from(clubsData.values());
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Leagues successfully scraped: ${stats.successful}`);
  console.log(`   Leagues with no data: ${stats.failed}`);
  console.log(`   Total teams found: ${stats.teamsFound}`);
  console.log(`   Unique clubs identified: ${clubs.length}`);
  
  // Count clubs by league type
  let wSeniorClubs = 0, mSeniorClubs = 0, wYouthClubs = 0, mYouthClubs = 0;
  for (const club of clubs) {
    if (club.wNLA || club.wNLB || club.w1L || club.w2L || club.w3L) wSeniorClubs++;
    if (club.mNLA || club.mNLB || club.m1L || club.m2L || club.m3L) mSeniorClubs++;
    if (club.wU23 || club.wU20 || club.wU18) wYouthClubs++;
    if (club.mU23 || club.mU20 || club.mU18) mYouthClubs++;
  }
  
  console.log(`\n   By category:`);
  console.log(`   - Women Senior: ${wSeniorClubs} clubs`);
  console.log(`   - Men Senior: ${mSeniorClubs} clubs`);
  console.log(`   - Women Youth: ${wYouthClubs} clubs`);
  console.log(`   - Men Youth: ${mYouthClubs} clubs`);
  
  // Show clubs with their leagues
  console.log(`\n📋 All clubs with leagues:`);
  const sortedClubs = clubs.sort((a, b) => a.name.localeCompare(b.name));
  
  for (const club of sortedClubs) {
    const leagues: string[] = [];
    
    // Senior Women
    if (club.wNLA) leagues.push('W-NLA');
    if (club.wNLB) leagues.push('W-NLB');
    if (club.w1L) leagues.push('W-1L');
    if (club.w2L) leagues.push('W-2L');
    if (club.w3L) leagues.push('W-3L');
    
    // Senior Men
    if (club.mNLA) leagues.push('M-NLA');
    if (club.mNLB) leagues.push('M-NLB');
    if (club.m1L) leagues.push('M-1L');
    if (club.m2L) leagues.push('M-2L');
    if (club.m3L) leagues.push('M-3L');
    
    // Youth Women
    if (club.wU23) leagues.push('W-U23');
    if (club.wU20) leagues.push('W-U20');
    if (club.wU18) leagues.push('W-U18');
    
    // Youth Men
    if (club.mU23) leagues.push('M-U23');
    if (club.mU20) leagues.push('M-U20');
    if (club.mU18) leagues.push('M-U18');
    
    if (leagues.length > 0) {
      console.log(`   ${club.name}: ${leagues.join(', ')}`);
    }
  }
  
  // Check specific clubs
  console.log(`\n🔍 Checking specific clubs:`);
  const checkClubs = ['Volley Luzern', 'VTV Horw', 'Volero', 'Pfeffingen', 'Lausanne', 'Genève', 'NUC', 'Amriswil'];
  for (const name of checkClubs) {
    const found = clubs.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      const leagues: string[] = [];
      if (found.wNLA) leagues.push('W-NLA');
      if (found.wNLB) leagues.push('W-NLB');
      if (found.w1L) leagues.push('W-1L');
      if (found.mNLA) leagues.push('M-NLA');
      if (found.mNLB) leagues.push('M-NLB');
      if (found.m1L) leagues.push('M-1L');
      console.log(`   ✅ ${found.name}: ${leagues.join(', ') || 'lower leagues only'}`);
    } else {
      console.log(`   ❌ ${name}: NOT FOUND`);
    }
  }
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'data');
  
  const output = {
    scrapedAt: new Date().toISOString(),
    source: 'https://www.volleyball.ch/de/game-center',
    leagues: {
      senior: ['NLA', 'NLB', '1. Liga', '2. Liga', '3. Liga'],
      youth: ['U23', 'U20', 'U18']
    },
    genders: ['Women', 'Men'],
    statistics: {
      totalClubs: clubs.length,
      totalTeams: allTeams.length,
      womenSenior: wSeniorClubs,
      menSenior: mSeniorClubs,
      womenYouth: wYouthClubs,
      menYouth: mYouthClubs
    },
    clubs: sortedClubs
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'swiss-volley-leagues-complete.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'swiss-volley-all-teams.json'),
    JSON.stringify(allTeams, null, 2),
    'utf-8'
  );
  
  console.log(`\n💾 Saved to:`);
  console.log(`   data/swiss-volley-leagues-complete.json (${clubs.length} clubs)`);
  console.log(`   data/swiss-volley-all-teams.json (${allTeams.length} teams)`);
  
  console.log('\n' + '═'.repeat(70));
  console.log('DONE');
  console.log('═'.repeat(70));
}

main().catch(console.error);
