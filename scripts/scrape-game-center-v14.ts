/**
 * SWISS VOLLEY LEAGUE SCRAPER v14 - ROBUST VERSION
 * With improved error handling and page navigation
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

function extractTeamsFromText(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  let inTeamsSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'Teams ausblenden' || line === 'Teams einblenden') {
      inTeamsSection = true;
      continue;
    }
    
    if (inTeamsSection && (
      line === 'Spielplan' || 
      line === 'Rangliste' || 
      line.startsWith('Zu den') ||
      line.match(/^\d{2}\.\d{2}\.\d{2}/)
    )) {
      break;
    }
    
    if (inTeamsSection && line.length > 2) {
      if (!['Teams', 'Teams ausblenden', 'Teams einblenden'].includes(line)) {
        teams.push(line);
      }
    }
  }
  
  return teams;
}

async function scrapeLeague(page: Page, gender: 'Frauen' | 'Männer', league: 'NLA' | 'NLB' | '1L'): Promise<string[]> {
  console.log(`\n=== ${gender === 'Frauen' ? 'WOMEN' : 'MEN'} ${league} ===`);
  
  try {
    // Navigate fresh to avoid stale state
    await page.goto(`https://www.volleyball.ch/de/game-center`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Select gender if Men
    if (gender === 'Männer') {
      const genderButton = page.locator('.filter-button:has-text("Männer")').first();
      await genderButton.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
    }
    
    // Select league if not NLA (default)
    if (league !== 'NLA') {
      const ligaButton = page.locator('button:has-text("Liga:")').first();
      await ligaButton.click();
      await page.waitForTimeout(1000);
      
      const leagueOption = page.locator(`[role="option"]:has-text("${league}")`).first();
      await leagueOption.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle');
    }
    
    // Extract teams
    const bodyText = await page.locator('body').innerText();
    const teams = extractTeamsFromText(bodyText);
    console.log(`Found ${teams.length} teams: ${teams.join(', ')}`);
    
    return teams;
  } catch (err) {
    console.log(`Error scraping ${gender} ${league}: ${err}`);
    return [];
  }
}

async function main() {
  console.log('SWISS VOLLEY COMPLETE LEAGUE SCRAPER v14');
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
  
  // Scrape each league with fresh page navigation
  const leagues: Array<{gender: 'Frauen' | 'Männer', league: 'NLA' | 'NLB' | '1L', key: keyof Omit<ClubLeagues, 'name'>}> = [
    { gender: 'Frauen', league: 'NLA', key: 'wNLA' },
    { gender: 'Frauen', league: 'NLB', key: 'wNLB' },
    { gender: 'Frauen', league: '1L', key: 'w1L' },
    { gender: 'Männer', league: 'NLA', key: 'mNLA' },
    { gender: 'Männer', league: 'NLB', key: 'mNLB' },
    { gender: 'Männer', league: '1L', key: 'm1L' },
  ];
  
  for (const { gender, league, key } of leagues) {
    const teams = await scrapeLeague(page, gender, league);
    for (const team of teams) {
      const club = getOrCreateClub(team);
      (club as any)[key] = true;
    }
  }
  
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
  
  // Show all clubs with Volley Luzern highlighted
  console.log('--- All clubs with leagues ---');
  for (const club of clubs) {
    const leagues: string[] = [];
    if (club.wNLA) leagues.push('W-NLA');
    if (club.wNLB) leagues.push('W-NLB');
    if (club.w1L) leagues.push('W-1L');
    if (club.mNLA) leagues.push('M-NLA');
    if (club.mNLB) leagues.push('M-NLB');
    if (club.m1L) leagues.push('M-1L');
    const highlight = club.name.includes('Luzern') || club.name.includes('VTV Horw') ? ' ⭐' : '';
    console.log(`${club.name}: ${leagues.join(', ')}${highlight}`);
  }
  
  // Specific check for Volley Luzern
  const luzern = clubs.find(c => c.name.includes('Luzern'));
  if (luzern) {
    console.log('\n=== VOLLEY LUZERN CHECK ===');
    console.log(JSON.stringify(luzern, null, 2));
  }
  
  // Check for VTV Horw
  const horw = clubs.find(c => c.name.toLowerCase().includes('horw'));
  if (horw) {
    console.log('\n=== VTV HORW CHECK ===');
    console.log(JSON.stringify(horw, null, 2));
  } else {
    console.log('\n=== VTV HORW ===');
    console.log('Not found in NLA/NLB/1L - may be in lower leagues');
  }
}

main().catch(console.error);
