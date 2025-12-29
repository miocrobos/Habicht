/**
 * SWISS VOLLEY LEAGUE SCRAPER v13 - WORKING APPROACH
 * Uses the same method that worked in v10
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

async function main() {
  console.log('SWISS VOLLEY COMPLETE LEAGUE SCRAPER v13');
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
  
  // Helper to scrape current view
  const scrapeTeams = async (key: keyof Omit<ClubLeagues, 'name'>, label: string) => {
    console.log(`\n=== ${label} ===`);
    const bodyText = await page.locator('body').innerText();
    const teams = extractTeamsFromText(bodyText);
    console.log(`Found ${teams.length} teams: ${teams.join(', ')}`);
    
    for (const team of teams) {
      const club = getOrCreateClub(team);
      (club as any)[key] = true;
    }
    
    return teams.length;
  };
  
  // Navigate to Game Center
  console.log('Navigating to Game Center...');
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // === WOMEN ===
  
  // Women NLA (default)
  await scrapeTeams('wNLA', 'WOMEN NLA');
  
  // Women NLB - click Liga dropdown and select NLB
  let ligaButton = page.locator('button:has-text("Liga:")').first();
  await ligaButton.click();
  await page.waitForTimeout(1000);
  await page.locator('[role="option"]:has-text("NLB")').first().click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await scrapeTeams('wNLB', 'WOMEN NLB');
  
  // Women 1. Liga - need to get the liga button again after page updates
  ligaButton = page.locator('button:has-text("Liga:")').first();
  await ligaButton.click();
  await page.waitForTimeout(1000);
  // The option is labeled "1L" not "1. Liga"
  const liga1Option = page.locator('[role="option"]:has-text("1L")').first();
  await liga1Option.click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await scrapeTeams('w1L', 'WOMEN 1L');
  
  // === MEN ===
  // Need to find the correct gender toggle
  
  // First, let's look at the filter-button elements
  console.log('\n\nSwitching to Men...');
  
  // The button has class "filter-button" - let's click the Männer one
  const menButton = page.locator('.filter-button:has-text("Männer")').first();
  if (await menButton.count() > 0) {
    await menButton.click();
    await page.waitForTimeout(2000);
    console.log('Clicked Männer button');
  } else {
    console.log('Could not find Männer filter button, trying text selector');
    await page.locator('text="Männer"').first().click();
    await page.waitForTimeout(2000);
  }
  
  // Back to NLA for Men
  let ligaButton2 = page.locator('button:has-text("Liga:")').first();
  await ligaButton2.click();
  await page.waitForTimeout(1000);
  await page.locator('text="NLA"').first().click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await scrapeTeams('mNLA', 'MEN NLA');
  
  // Men NLB
  ligaButton2 = page.locator('button:has-text("Liga:")').first();
  await ligaButton2.click();
  await page.waitForTimeout(1000);
  await page.locator('[role="option"]:has-text("NLB")').first().click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
  await scrapeTeams('mNLB', 'MEN NLB');
  
  // Men 1L (1. Liga)
  ligaButton2 = page.locator('button:has-text("Liga:")').first();
  await ligaButton2.click();
  await page.waitForTimeout(1000);
  await page.locator('[role="option"]:has-text("1L")').first().click();
  await page.waitForTimeout(2000);
  await page.waitForLoadState('networkidle');
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
    if (leagues.length > 0) {
      console.log(`${club.name}: ${leagues.join(', ')}`);
    }
  }
  
  // Check key clubs
  console.log('\n--- Key clubs ---');
  const checkClub = (name: string) => {
    const club = clubs.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (club) {
      const leagues: string[] = [];
      if (club.wNLA) leagues.push('W-NLA');
      if (club.wNLB) leagues.push('W-NLB');
      if (club.w1L) leagues.push('W-1L');
      if (club.mNLA) leagues.push('M-NLA');
      if (club.mNLB) leagues.push('M-NLB');
      if (club.m1L) leagues.push('M-1L');
      console.log(`${club.name}: ${leagues.join(', ') || 'no leagues'}`);
    } else {
      console.log(`${name}: NOT FOUND (might be in lower leagues)`);
    }
  };
  
  checkClub('Volley Luzern');
  checkClub('VTV Horw');
  checkClub('Amriswil');
  checkClub('LINDAREN');
  checkClub('Chênois');
  checkClub('Schönenwerd');
}

main().catch(console.error);
