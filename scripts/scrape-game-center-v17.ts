/**
 * SWISS VOLLEY LEAGUE SCRAPER v17 - EXTRACT FROM RANKING TABLE
 * Uses the ranking table which has the actual teams per league
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ClubLeagues {
  name: string;
  wNLA: boolean; wNLB: boolean; w1L: boolean;
  mNLA: boolean; mNLB: boolean; m1L: boolean;
}

function extractClubName(teamName: string): string {
  return teamName
    .replace(/\s+(I{1,3}|IV|V|VI|[1-6])$/, '')
    .replace(/\s+[A-Z]$/, '')
    .trim();
}

function extractTeamsFromRankingTable(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  // Find the ranking table - look for "Informationen zum Modus" and then the column headers
  let inRankingTable = false;
  let pastHeaders = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Start of ranking table section
    if (line === 'Informationen zum Modus') {
      inRankingTable = true;
      continue;
    }
    
    // Skip headers row: Phase: Qualifikation, #, Team, Sp., Pu., etc.
    if (inRankingTable && line === 'BQ') {
      pastHeaders = true;
      continue;
    }
    
    // End of table - footer elements
    if (pastHeaders && (
      line === 'Premium Partner' ||
      line.includes('Partner') ||
      line === 'Impressum' ||
      line.startsWith('Gruppe')  // For leagues with groups
    )) {
      break;
    }
    
    if (pastHeaders) {
      // Rows are: rank, team name, games, points, etc.
      // Team names are strings that don't look like numbers
      if (!line.match(/^[\d.:]+$/) && line.length > 2) {
        // Skip stats like "30 : 11"
        if (!line.includes(' : ')) {
          teams.push(line);
        }
      }
    }
  }
  
  return teams;
}

async function main() {
  console.log('SWISS VOLLEY COMPLETE LEAGUE SCRAPER v17');
  console.log('=========================================\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  const clubsData: Map<string, ClubLeagues> = new Map();
  
  const getOrCreateClub = (name: string): ClubLeagues => {
    const clubName = extractClubName(name);
    if (!clubsData.has(clubName)) {
      clubsData.set(clubName, {
        name: clubName,
        wNLA: false, wNLB: false, w1L: false,
        mNLA: false, mNLB: false, m1L: false,
      });
    }
    return clubsData.get(clubName)!;
  };
  
  const scrapeTeams = async (key: keyof Omit<ClubLeagues, 'name'>, label: string) => {
    console.log(`\n=== ${label} ===`);
    
    const bodyText = await page.locator('body').innerText();
    const teams = extractTeamsFromRankingTable(bodyText);
    console.log(`Found ${teams.length} teams: ${teams.join(', ')}`);
    
    for (const team of teams) {
      const club = getOrCreateClub(team);
      (club as any)[key] = true;
    }
    
    return teams.length;
  };
  
  const selectLeague = async (league: 'NLA' | 'NLB' | '1L') => {
    const ligaButton = page.locator('button:has-text("Liga:")').first();
    await ligaButton.click();
    await page.waitForTimeout(1000);
    await page.locator(`[role="option"]:has-text("${league}")`).first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
  };
  
  // ===== WOMEN =====
  console.log('\n========== WOMEN ==========');
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Women NLA (default)
  await scrapeTeams('wNLA', 'WOMEN NLA');
  
  // Women NLB
  await selectLeague('NLB');
  await scrapeTeams('wNLB', 'WOMEN NLB');
  
  // Women 1L
  await selectLeague('1L');
  await scrapeTeams('w1L', 'WOMEN 1L');
  
  // ===== MEN =====
  console.log('\n========== MEN ==========');
  
  // Fresh navigation, then switch to Men
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Click Men button
  const menButton = page.locator('.filter-button:has-text("Männer")').first();
  await menButton.click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  console.log('Switched to Men');
  
  // Men NLA (default after switch)
  await scrapeTeams('mNLA', 'MEN NLA');
  
  // Men NLB
  await selectLeague('NLB');
  await scrapeTeams('mNLB', 'MEN NLB');
  
  // Men 1L
  await selectLeague('1L');
  await scrapeTeams('m1L', 'MEN 1L');
  
  await browser.close();
  
  // Results
  console.log('\n\n=========================================');
  console.log('RESULTS');
  console.log('=========================================\n');
  
  const clubs = Array.from(clubsData.values()).sort((a, b) => a.name.localeCompare(b.name));
  console.log(`Total clubs found: ${clubs.length}`);
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'data', 'swiss-volley-leagues-final.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    scrapedAt: new Date().toISOString(),
    source: 'https://www.volleyball.ch/de/game-center',
    leagues: ['NLA', 'NLB', '1. Liga'],
    genders: ['Women', 'Men'],
    totalClubs: clubs.length,
    clubs
  }, null, 2), 'utf-8');
  console.log(`Saved to ${outputPath}\n`);
  
  // Show all clubs
  console.log('--- All clubs with leagues ---');
  for (const club of clubs) {
    const leagues: string[] = [];
    if (club.wNLA) leagues.push('W-NLA');
    if (club.wNLB) leagues.push('W-NLB');
    if (club.w1L) leagues.push('W-1L');
    if (club.mNLA) leagues.push('M-NLA');
    if (club.mNLB) leagues.push('M-NLB');
    if (club.m1L) leagues.push('M-1L');
    const highlight = club.name.includes('Luzern') || club.name.toLowerCase().includes('horw') ? ' ⭐' : '';
    console.log(`${club.name}: ${leagues.join(', ')}${highlight}`);
  }
  
  // Specific checks
  const luzern = clubs.find(c => c.name.includes('Luzern'));
  if (luzern) {
    console.log('\n=== VOLLEY LUZERN CHECK ===');
    console.log(JSON.stringify(luzern, null, 2));
  }
  
  const horw = clubs.find(c => c.name.toLowerCase().includes('horw'));
  if (horw) {
    console.log('\n=== VTV HORW CHECK ===');
    console.log(JSON.stringify(horw, null, 2));
  } else {
    console.log('\n=== VTV HORW ===');
    console.log('Not found in NLA/NLB/1L - checking lower leagues may be needed');
  }
}

main().catch(console.error);
