/**
 * SWISS VOLLEY VEREIN SUCHEN LEAGUE SCRAPER
 * 
 * Uses the Angebote dropdown on https://www.volleyball.ch/de/verband/services/verein-suchen
 * to get clubs by specific league level (NLA, NLB, 1L, 2L, 3L, U23, U20, U18, etc.)
 * 
 * This is the authoritative source for Swiss volleyball club league data.
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
  w4L: boolean;
  w5L: boolean;
  // Men Senior
  mNLA: boolean;
  mNLB: boolean;
  m1L: boolean;
  m2L: boolean;
  m3L: boolean;
  m4L: boolean;
  m5L: boolean;
  // Women Youth
  wU23: boolean;
  wU20: boolean;
  wU18: boolean;
  wU16: boolean;
  wU15: boolean;
  wU14: boolean;
  wU13: boolean;
  // Men Youth
  mU23: boolean;
  mU20: boolean;
  mU18: boolean;
  mU16: boolean;
  mU15: boolean;
  mU14: boolean;
  mU13: boolean;
}

type LeagueKey = keyof Omit<ClubLeagues, 'name'>;

// League configurations - maps dropdown option text to our data structure
interface LeagueConfig {
  dropdownText: string;  // Text as it appears in the dropdown
  key: LeagueKey;
  gender: 'women' | 'men';
  category: 'senior' | 'youth';
  displayName: string;
}

// Define all leagues to scrape based on the Angebote dropdown options
const LEAGUES: LeagueConfig[] = [
  // Women Senior
  { dropdownText: 'Frauen NLA', key: 'wNLA', gender: 'women', category: 'senior', displayName: 'Women NLA' },
  { dropdownText: 'Frauen NLB', key: 'wNLB', gender: 'women', category: 'senior', displayName: 'Women NLB' },
  { dropdownText: 'Frauen 1. Liga', key: 'w1L', gender: 'women', category: 'senior', displayName: 'Women 1. Liga' },
  { dropdownText: 'Frauen 2. Liga', key: 'w2L', gender: 'women', category: 'senior', displayName: 'Women 2. Liga' },
  { dropdownText: 'Frauen 3. Liga', key: 'w3L', gender: 'women', category: 'senior', displayName: 'Women 3. Liga' },
  { dropdownText: 'Frauen 4. Liga', key: 'w4L', gender: 'women', category: 'senior', displayName: 'Women 4. Liga' },
  { dropdownText: 'Frauen 5. Liga', key: 'w5L', gender: 'women', category: 'senior', displayName: 'Women 5. Liga' },
  
  // Men Senior
  { dropdownText: 'Männer NLA', key: 'mNLA', gender: 'men', category: 'senior', displayName: 'Men NLA' },
  { dropdownText: 'Männer NLB', key: 'mNLB', gender: 'men', category: 'senior', displayName: 'Men NLB' },
  { dropdownText: 'Männer 1. Liga', key: 'm1L', gender: 'men', category: 'senior', displayName: 'Men 1. Liga' },
  { dropdownText: 'Männer 2. Liga', key: 'm2L', gender: 'men', category: 'senior', displayName: 'Men 2. Liga' },
  { dropdownText: 'Männer 3. Liga', key: 'm3L', gender: 'men', category: 'senior', displayName: 'Men 3. Liga' },
  { dropdownText: 'Männer 4. Liga', key: 'm4L', gender: 'men', category: 'senior', displayName: 'Men 4. Liga' },
  { dropdownText: 'Männer 5. Liga', key: 'm5L', gender: 'men', category: 'senior', displayName: 'Men 5. Liga' },
  
  // Women Youth
  { dropdownText: 'Frauen U23', key: 'wU23', gender: 'women', category: 'youth', displayName: 'Women U23' },
  { dropdownText: 'Frauen U20', key: 'wU20', gender: 'women', category: 'youth', displayName: 'Women U20' },
  { dropdownText: 'Frauen U18', key: 'wU18', gender: 'women', category: 'youth', displayName: 'Women U18' },
  { dropdownText: 'Frauen U16', key: 'wU16', gender: 'women', category: 'youth', displayName: 'Women U16' },
  { dropdownText: 'Frauen U15', key: 'wU15', gender: 'women', category: 'youth', displayName: 'Women U15' },
  { dropdownText: 'Frauen U14', key: 'wU14', gender: 'women', category: 'youth', displayName: 'Women U14' },
  { dropdownText: 'Frauen U13', key: 'wU13', gender: 'women', category: 'youth', displayName: 'Women U13' },
  
  // Men Youth
  { dropdownText: 'Männer U23', key: 'mU23', gender: 'men', category: 'youth', displayName: 'Men U23' },
  { dropdownText: 'Männer U20', key: 'mU20', gender: 'men', category: 'youth', displayName: 'Men U20' },
  { dropdownText: 'Männer U18', key: 'mU18', gender: 'men', category: 'youth', displayName: 'Men U18' },
  { dropdownText: 'Männer U16', key: 'mU16', gender: 'men', category: 'youth', displayName: 'Men U16' },
  { dropdownText: 'Männer U15', key: 'mU15', gender: 'men', category: 'youth', displayName: 'Men U15' },
  { dropdownText: 'Männer U14', key: 'mU14', gender: 'men', category: 'youth', displayName: 'Men U14' },
  { dropdownText: 'Männer U13', key: 'mU13', gender: 'men', category: 'youth', displayName: 'Men U13' },
];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract club names from the current page view
async function extractClubNames(page: Page): Promise<string[]> {
  const clubs: string[] = [];
  
  // Wait for results to load
  await delay(1500);
  
  // Get all club name elements
  const clubElements = await page.locator('.club-name, .verein-name, h3, h4, [class*="club"], [class*="verein"]').all();
  
  for (const el of clubElements) {
    const text = await el.textContent();
    if (text && text.trim().length > 2 && text.trim().length < 100) {
      const name = text.trim();
      // Filter out non-club text
      if (!name.includes('Verein suchen') && 
          !name.includes('Angebote') && 
          !name.includes('Region') &&
          !name.includes('Suchen') &&
          !name.match(/^\d+$/) &&
          !name.includes('Treffer')) {
        clubs.push(name);
      }
    }
  }
  
  // Also try to extract from the body text after the filter
  const bodyText = await page.locator('body').innerText();
  const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
  
  // Find club names in the results section
  let inResultsSection = false;
  for (const line of lines) {
    if (line.includes('Treffer') && line.match(/\d+/)) {
      inResultsSection = true;
      continue;
    }
    
    if (inResultsSection) {
      // Club names are typically short, start with capital, and don't contain certain keywords
      if (line.length > 3 && line.length < 80 && 
          /^[A-ZÄÖÜ]/.test(line) &&
          !line.includes('Angebote') &&
          !line.includes('Region') &&
          !line.includes('www.') &&
          !line.includes('@') &&
          !line.match(/^\d{4}/) && // Not starting with postal code
          !line.includes('Verein suchen')) {
        if (!clubs.includes(line)) {
          clubs.push(line);
        }
      }
    }
  }
  
  return [...new Set(clubs)];
}

async function main() {
  console.log('═'.repeat(70));
  console.log('SWISS VOLLEY VEREIN SUCHEN LEAGUE SCRAPER');
  console.log('Using Angebote dropdown to get clubs by league');
  console.log('URL: https://www.volleyball.ch/de/verband/services/verein-suchen');
  console.log('═'.repeat(70));
  console.log(`\nTotal leagues to scrape: ${LEAGUES.length}`);

  const browser = await chromium.launch({ 
    headless: false,  // Set to true for production
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
  
  // Helper to get or create club entry
  const getOrCreateClub = (name: string): ClubLeagues => {
    if (!clubsData.has(name)) {
      clubsData.set(name, {
        name,
        // Women Senior
        wNLA: false, wNLB: false, w1L: false, w2L: false, w3L: false, w4L: false, w5L: false,
        // Men Senior
        mNLA: false, mNLB: false, m1L: false, m2L: false, m3L: false, m4L: false, m5L: false,
        // Women Youth
        wU23: false, wU20: false, wU18: false, wU16: false, wU15: false, wU14: false, wU13: false,
        // Men Youth
        mU23: false, mU20: false, mU18: false, mU16: false, mU15: false, mU14: false, mU13: false,
      });
    }
    return clubsData.get(name)!;
  };

  // Statistics
  const stats = {
    successful: 0,
    failed: 0,
    teamsFound: 0,
  };

  // Navigate to the page
  console.log('\n📡 Navigating to Verein suchen...');
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { 
    waitUntil: 'networkidle' 
  });
  await delay(3000);
  
  // First, let's explore the dropdown to see what options are available
  console.log('\n🔍 Exploring Angebote dropdown options...');
  
  // Find and click the Angebote dropdown
  const angeboteDropdown = page.locator('select, [class*="dropdown"], [class*="select"]').filter({ hasText: /Angebote|Alle Angebote/i }).first();
  
  // Try different selectors for the dropdown
  let dropdownFound = false;
  let dropdownOptions: string[] = [];
  
  // Try select element first
  const selectElement = page.locator('select').first();
  if (await selectElement.count() > 0) {
    console.log('   Found select element');
    
    // Get all options from the select
    dropdownOptions = await page.evaluate(() => {
      const selects = document.querySelectorAll('select');
      const options: string[] = [];
      selects.forEach(select => {
        select.querySelectorAll('option').forEach(opt => {
          if (opt.textContent) options.push(opt.textContent.trim());
        });
      });
      return options;
    });
    
    console.log(`   Found ${dropdownOptions.length} options in select elements`);
    dropdownFound = true;
  }
  
  // Save the options we found
  console.log('\n   Available dropdown options:');
  for (const opt of dropdownOptions.slice(0, 30)) {
    console.log(`      - ${opt}`);
  }
  if (dropdownOptions.length > 30) {
    console.log(`      ... and ${dropdownOptions.length - 30} more`);
  }
  
  // Take a screenshot
  await page.screenshot({ 
    path: path.join(__dirname, '..', 'data', 'verein-suchen-initial.png'), 
    fullPage: true 
  });
  
  // Now iterate through each league and get clubs
  console.log('\n\n' + '█'.repeat(70));
  console.log('█ SCRAPING CLUBS BY LEAGUE');
  console.log('█'.repeat(70));
  
  for (const league of LEAGUES) {
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📋 ${league.displayName} (${league.dropdownText})`);
    
    try {
      // Navigate fresh each time to avoid state issues
      await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { 
        waitUntil: 'networkidle' 
      });
      await delay(2000);
      
      // Find the Angebote select element
      const selects = await page.locator('select').all();
      let targetSelect = null;
      
      for (const sel of selects) {
        const options = await sel.locator('option').allTextContents();
        // Check if this select has our league option
        if (options.some(opt => opt.includes(league.dropdownText) || opt.includes('Angebote'))) {
          targetSelect = sel;
          break;
        }
      }
      
      if (!targetSelect) {
        console.log(`   ⚠️  Could not find Angebote dropdown`);
        stats.failed++;
        continue;
      }
      
      // Select the league option
      await targetSelect.selectOption({ label: league.dropdownText });
      await delay(2000);
      
      // Click the search/filter button if needed
      const searchButton = page.locator('button:has-text("Suchen"), button:has-text("Filtern"), input[type="submit"]').first();
      if (await searchButton.count() > 0) {
        await searchButton.click();
        await delay(2000);
      }
      
      // Extract clubs from the results
      const clubs = await extractClubNames(page);
      
      if (clubs.length > 0) {
        console.log(`   ✅ Found ${clubs.length} clubs:`);
        
        for (const clubName of clubs) {
          const club = getOrCreateClub(clubName);
          (club as any)[league.key] = true;
          console.log(`      - ${clubName}`);
        }
        
        stats.successful++;
        stats.teamsFound += clubs.length;
      } else {
        console.log(`   ⚠️  No clubs found for this league`);
        stats.failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      stats.failed++;
    }
  }

  // Save final screenshot
  await page.screenshot({ 
    path: path.join(__dirname, '..', 'data', 'verein-suchen-final.png'), 
    fullPage: true 
  });
  
  await browser.close();

  // ============================================================
  // RESULTS
  // ============================================================
  console.log('\n\n' + '═'.repeat(70));
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(70));
  
  const clubs = Array.from(clubsData.values());
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Leagues successfully scraped: ${stats.successful}/${LEAGUES.length}`);
  console.log(`   Leagues with no data: ${stats.failed}`);
  console.log(`   Total club-league assignments: ${stats.teamsFound}`);
  console.log(`   Unique clubs identified: ${clubs.length}`);
  
  // Show clubs with their leagues
  console.log(`\n📋 Sample clubs with leagues:`);
  const sortedClubs = clubs.sort((a, b) => a.name.localeCompare(b.name));
  
  for (const club of sortedClubs.slice(0, 30)) {
    const leagues: string[] = [];
    
    // Senior Women
    if (club.wNLA) leagues.push('W-NLA');
    if (club.wNLB) leagues.push('W-NLB');
    if (club.w1L) leagues.push('W-1L');
    if (club.w2L) leagues.push('W-2L');
    if (club.w3L) leagues.push('W-3L');
    if (club.w4L) leagues.push('W-4L');
    if (club.w5L) leagues.push('W-5L');
    
    // Senior Men
    if (club.mNLA) leagues.push('M-NLA');
    if (club.mNLB) leagues.push('M-NLB');
    if (club.m1L) leagues.push('M-1L');
    if (club.m2L) leagues.push('M-2L');
    if (club.m3L) leagues.push('M-3L');
    if (club.m4L) leagues.push('M-4L');
    if (club.m5L) leagues.push('M-5L');
    
    // Youth (summarized)
    const youthLeagues: string[] = [];
    if (club.wU23 || club.wU20 || club.wU18 || club.wU16 || club.wU15 || club.wU14 || club.wU13) {
      youthLeagues.push('W-Youth');
    }
    if (club.mU23 || club.mU20 || club.mU18 || club.mU16 || club.mU15 || club.mU14 || club.mU13) {
      youthLeagues.push('M-Youth');
    }
    leagues.push(...youthLeagues);
    
    if (leagues.length > 0) {
      console.log(`   ${club.name}: ${leagues.join(', ')}`);
    }
  }
  
  if (sortedClubs.length > 30) {
    console.log(`   ... and ${sortedClubs.length - 30} more clubs`);
  }
  
  // Check specific clubs
  console.log(`\n🔍 Checking specific clubs:`);
  const checkClubs = ['Volley Luzern', 'VTV Horw', 'Voléro', 'Pfeffingen', 'Lausanne', 'Genève', 'NUC', 'Amriswil'];
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
      console.log(`   ✅ ${found.name}: ${leagues.join(', ') || 'lower leagues/youth'}`);
    } else {
      console.log(`   ❌ ${name}: NOT FOUND`);
    }
  }
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'data');
  
  const output = {
    scrapedAt: new Date().toISOString(),
    source: 'https://www.volleyball.ch/de/verband/services/verein-suchen',
    method: 'Angebote dropdown filter',
    statistics: {
      totalClubs: clubs.length,
      leaguesScraped: stats.successful,
      leaguesFailed: stats.failed
    },
    clubs: sortedClubs
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'swiss-volley-leagues-from-verein-suchen.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );
  
  console.log(`\n💾 Saved to:`);
  console.log(`   data/swiss-volley-leagues-from-verein-suchen.json (${clubs.length} clubs)`);
  
  console.log('\n' + '═'.repeat(70));
  console.log('DONE');
  console.log('═'.repeat(70));
}

main().catch(console.error);
