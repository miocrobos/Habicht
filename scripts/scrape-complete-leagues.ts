/**
 * COMPLETE SWISS VOLLEY LEAGUE SCRAPER
 * 
 * Scrapes ALL leagues from NLA down to U18 for both Men and Women
 * Using direct URL parameters and v10 text extraction method
 * 
 * Leagues covered:
 * - Senior (Meisterschaft): NLA, NLB, 1L, 2L, 3L
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

// All league configurations
interface LeagueConfig {
  key: keyof Omit<ClubLeagues, 'name'>;
  gender: 'male' | 'female';
  league: string;
  category: 'senior' | 'youth';
  displayName: string;
}

// Define ALL leagues to scrape
const LEAGUES: LeagueConfig[] = [
  // Women Senior (Meisterschaft)
  { key: 'wNLA', gender: 'female', league: 'NLA', category: 'senior', displayName: 'Women NLA' },
  { key: 'wNLB', gender: 'female', league: 'NLB', category: 'senior', displayName: 'Women NLB' },
  { key: 'w1L', gender: 'female', league: '1L', category: 'senior', displayName: 'Women 1. Liga' },
  { key: 'w2L', gender: 'female', league: '2L', category: 'senior', displayName: 'Women 2. Liga' },
  { key: 'w3L', gender: 'female', league: '3L', category: 'senior', displayName: 'Women 3. Liga' },
  
  // Men Senior (Meisterschaft)
  { key: 'mNLA', gender: 'male', league: 'NLA', category: 'senior', displayName: 'Men NLA' },
  { key: 'mNLB', gender: 'male', league: 'NLB', category: 'senior', displayName: 'Men NLB' },
  { key: 'm1L', gender: 'male', league: '1L', category: 'senior', displayName: 'Men 1. Liga' },
  { key: 'm2L', gender: 'male', league: '2L', category: 'senior', displayName: 'Men 2. Liga' },
  { key: 'm3L', gender: 'male', league: '3L', category: 'senior', displayName: 'Men 3. Liga' },
  
  // Women Youth (Nachwuchs)
  { key: 'wU23', gender: 'female', league: 'U23', category: 'youth', displayName: 'Women U23' },
  { key: 'wU20', gender: 'female', league: 'U20', category: 'youth', displayName: 'Women U20' },
  { key: 'wU18', gender: 'female', league: 'U18', category: 'youth', displayName: 'Women U18' },
  
  // Men Youth (Nachwuchs)
  { key: 'mU23', gender: 'male', league: 'U23', category: 'youth', displayName: 'Men U23' },
  { key: 'mU20', gender: 'male', league: 'U20', category: 'youth', displayName: 'Men U20' },
  { key: 'mU18', gender: 'male', league: 'U18', category: 'youth', displayName: 'Men U18' },
];

// Build URL for a specific league
function buildLeagueUrl(config: LeagueConfig): string {
  const baseUrl = 'https://www.volleyball.ch/de/game-center';
  const season = '2024-2025';
  const genderParam = config.gender;
  
  // For youth leagues, the URL structure might be different
  if (config.category === 'youth') {
    return `${baseUrl}?sports=indoor&gender=${genderParam}&region=swissvolley&season=${season}&leagues=${config.league}`;
  }
  
  return `${baseUrl}?sports=indoor&gender=${genderParam}&region=swissvolley&season=${season}&leagues=${config.league}`;
}

// Extract club name from team name (remove suffixes like I, II, III, 1, 2, D1, D2, etc.)
function extractClubName(teamName: string): string {
  return teamName
    // Remove Roman numerals and numbers at the end
    .replace(/\s+(I{1,3}|IV|V|VI|VII|[1-9])$/i, '')
    // Remove letter designations at the end
    .replace(/\s+[A-D]$/i, '')
    // Remove D1, D2 style designations
    .replace(/\s+D[1-5]$/i, '')
    // Remove postal codes (4 digits)
    .replace(/\s+\d{4}\s*$/g, '')
    // Remove leading/trailing postal codes
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
      line.match(/^\d{2}\.\d{2}\.\d{2}/) || // Date pattern
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

// Alternative: Extract teams from ranking table
function extractTeamsFromRanking(text: string): string[] {
  const teams: string[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // Look for ranking patterns: position followed by team name
  // Pattern: "1 Team Name 10 5 3 2 15:9 15"
  for (const line of lines) {
    // Match lines that start with a rank number
    const rankMatch = line.match(/^(\d{1,2})\s+([A-ZÄÖÜa-zäöüéèêàâùûîôç'\-\s]+)/);
    if (rankMatch) {
      const potentialTeam = rankMatch[2].trim();
      // Make sure it's a valid team name (not just numbers or stats)
      if (potentialTeam.length > 3 && !potentialTeam.match(/^\d/)) {
        // Clean up the team name - remove any trailing numbers (stats)
        const cleanName = potentialTeam.replace(/\s+\d+.*$/, '').trim();
        if (cleanName.length > 3) {
          teams.push(cleanName);
        }
      }
    }
  }
  
  return [...new Set(teams)];
}

// Comprehensive team extraction
async function extractTeamsFromPage(page: Page): Promise<string[]> {
  const bodyText = await page.locator('body').innerText();
  
  // Try the teams section method first
  let teams = extractTeamsFromText(bodyText);
  
  // If no teams found, try the ranking table method
  if (teams.length === 0) {
    teams = extractTeamsFromRanking(bodyText);
  }
  
  // If still no teams, try extracting from links
  if (teams.length === 0) {
    teams = await page.evaluate(() => {
      const teamNames: string[] = [];
      // Look for team links
      document.querySelectorAll('a[href*="/game-center/club/"], a[href*="/teams/"]').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 2 && text.length < 60) {
          teamNames.push(text);
        }
      });
      return [...new Set(teamNames)];
    });
  }
  
  // Final fallback: Look for table rows with team-like content
  if (teams.length === 0) {
    teams = await page.evaluate(() => {
      const teamNames: string[] = [];
      document.querySelectorAll('table tr td:first-child, table tr td:nth-child(2)').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 3 && text.length < 60 &&
            /^[A-ZÄÖÜ]/.test(text) && 
            !text.match(/^\d/) &&
            !text.includes('Spielplan') &&
            !text.includes('Rangliste')) {
          teamNames.push(text);
        }
      });
      return [...new Set(teamNames)];
    });
  }
  
  return [...new Set(teams)];
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(70));
  console.log('COMPLETE SWISS VOLLEY LEAGUE SCRAPER');
  console.log('Scraping ALL leagues: NLA → U18 for Men and Women');
  console.log('═'.repeat(70));
  console.log(`\nTotal leagues to scrape: ${LEAGUES.length}`);
  console.log('');

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

  // Scrape each league
  for (const league of LEAGUES) {
    const url = buildLeagueUrl(league);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📋 ${league.displayName}`);
    console.log(`   URL: ${url}`);
    
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for content to load
      await delay(2000);
      
      // Try to click "Teams einblenden" if available
      try {
        const teamsButton = page.locator('text="Teams einblenden"');
        if (await teamsButton.count() > 0) {
          await teamsButton.click();
          await delay(1000);
        }
      } catch (e) {
        // Button not found, continue
      }
      
      // Extract teams
      const teams = await extractTeamsFromPage(page);
      
      if (teams.length > 0) {
        console.log(`   ✅ Found ${teams.length} teams:`);
        
        for (const teamName of teams) {
          const club = getOrCreateClub(teamName);
          (club as any)[league.key] = true;
          
          allTeams.push({
            teamName,
            clubName: extractClubName(teamName),
            league: league.league,
            gender: league.gender === 'female' ? 'women' : 'men',
            category: league.category,
          });
          
          console.log(`      - ${teamName} → ${extractClubName(teamName)}`);
        }
        
        stats.successful++;
        stats.teamsFound += teams.length;
      } else {
        console.log(`   ⚠️  No teams found (league may not exist or page structure different)`);
        stats.failed++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      stats.failed++;
    }
    
    // Small delay between requests
    await delay(500);
  }

  await browser.close();

  // Results summary
  console.log('\n' + '═'.repeat(70));
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(70));
  
  const clubs = Array.from(clubsData.values());
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Leagues successfully scraped: ${stats.successful}/${LEAGUES.length}`);
  console.log(`   Leagues with no data: ${stats.failed}`);
  console.log(`   Total teams found: ${stats.teamsFound}`);
  console.log(`   Unique clubs identified: ${clubs.length}`);
  
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
  
  const checkClubs = ['Volley Luzern', 'VTV Horw', 'Volero', 'Pfeffingen', 'Lausanne', 'Genève'];
  for (const name of checkClubs) {
    const found = clubs.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      const leagues: string[] = [];
      if (found.wNLA) leagues.push('W-NLA');
      if (found.wNLB) leagues.push('W-NLB');
      if (found.mNLA) leagues.push('M-NLA');
      if (found.mNLB) leagues.push('M-NLB');
      console.log(`   ✅ ${found.name}: ${leagues.join(', ') || 'lower leagues only'}`);
    } else {
      console.log(`   ❌ ${name}: NOT FOUND`);
    }
  }
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'data');
  
  fs.writeFileSync(
    path.join(outputDir, 'swiss-volley-leagues-complete.json'),
    JSON.stringify(clubs, null, 2),
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
