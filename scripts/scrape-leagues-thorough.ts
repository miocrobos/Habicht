/**
 * Thorough League Scraper - Deep-dives into club websites
 * Follows links to team pages and uses Swiss/German terminology
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ClubWebsite {
  name: string;
  website: string;
}

interface LeagueInfo {
  league: string;
  gender: 'men' | 'women' | 'unknown';
  category: 'senior' | 'youth';
  raw: string;
}

interface ClubLeagues {
  name: string;
  website: string;
  leagues: LeagueInfo[];
  pagesChecked: string[];
  success: boolean;
  error?: string;
}

// Swiss/German keywords for team pages
const TEAM_PAGE_KEYWORDS = [
  'mannschaft', 'mannschaften', 'team', 'teams',
  'spielbetrieb', 'meisterschaft', 'liga', 'ligen',
  'herren', 'damen', 'frauen', 'männer',
  'junioren', 'juniorinnen', 'nachwuchs',
  'u13', 'u15', 'u17', 'u19', 'u21', 'u23',
  'aktive', 'senioren', 'elite'
];

// League patterns to search for
const LEAGUE_PATTERNS = [
  // National leagues
  /\b(NLA|NLB)\b/gi,
  // Regional leagues (1L to 5L)
  /\b([1-5])\s*\.?\s*(Liga|L)\b/gi,
  /\b([1-5]L)\b/gi,
  // Youth leagues
  /\b(U\s*-?\s*(13|14|15|16|17|18|19|21|23))\b/gi,
  // Combined patterns
  /\b(Herren|Männer|Damen|Frauen)\s+(NLA|NLB|[1-5]L?|[1-5]\.\s*Liga)\b/gi,
  /\b(NLA|NLB|[1-5]L?|[1-5]\.\s*Liga)\s+(Herren|Männer|Damen|Frauen)\b/gi,
  // Meisterschaft patterns
  /\bMeisterschaft\s*(NLA|NLB|[1-5]L?)\b/gi,
  // Team name patterns like "1. Mannschaft (2L)"
  /\b([1-4])\.\s*Mannschaft\s*[\(\[](NLA|NLB|[1-5]L?)[\)\]]/gi
];

// Gender indicators
const WOMEN_INDICATORS = ['damen', 'frauen', 'women', 'female', 'mädchen', 'girls', 'juniorinnen', 'f-', '-f'];
const MEN_INDICATORS = ['herren', 'männer', 'men', 'male', 'knaben', 'boys', 'junioren', 'm-', '-m'];

function normalizeLeague(raw: string): string {
  const upper = raw.toUpperCase().replace(/\s+/g, '');
  
  // Handle NLA/NLB
  if (upper.includes('NLA')) return 'NLA';
  if (upper.includes('NLB')) return 'NLB';
  
  // Handle numbered leagues (1L, 2L, etc.)
  const match = upper.match(/([1-5])\s*\.?\s*L(?:IGA)?/);
  if (match) return `${match[1]}L`;
  
  // Handle youth
  const youthMatch = upper.match(/U\s*-?\s*(13|14|15|16|17|18|19|21|23)/);
  if (youthMatch) return `U${youthMatch[1]}`;
  
  return raw.trim();
}

function detectGender(context: string): 'men' | 'women' | 'unknown' {
  const lower = context.toLowerCase();
  
  for (const indicator of WOMEN_INDICATORS) {
    if (lower.includes(indicator)) return 'women';
  }
  
  for (const indicator of MEN_INDICATORS) {
    if (lower.includes(indicator)) return 'men';
  }
  
  return 'unknown';
}

function detectCategory(league: string): 'senior' | 'youth' {
  if (league.startsWith('U')) return 'youth';
  return 'senior';
}

function extractLeagues(text: string): LeagueInfo[] {
  const leagues: LeagueInfo[] = [];
  const seen = new Set<string>();
  
  for (const pattern of LEAGUE_PATTERNS) {
    // Reset regex
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[0];
      const normalized = normalizeLeague(raw);
      
      // Get surrounding context for gender detection (100 chars each side)
      const start = Math.max(0, match.index - 100);
      const end = Math.min(text.length, match.index + raw.length + 100);
      const context = text.substring(start, end);
      
      const key = `${normalized}-${detectGender(context)}`;
      if (!seen.has(key) && normalized.length > 0) {
        seen.add(key);
        leagues.push({
          league: normalized,
          gender: detectGender(context),
          category: detectCategory(normalized),
          raw: raw.trim()
        });
      }
    }
  }
  
  return leagues;
}

async function findTeamLinks(page: Page, baseUrl: string): Promise<string[]> {
  const links: string[] = [];
  
  try {
    // Get all links on the page
    const allLinks = await page.$$eval('a[href]', (anchors) => {
      return anchors.map(a => ({
        href: a.getAttribute('href') || '',
        text: (a.textContent || '').toLowerCase().trim()
      }));
    });
    
    for (const link of allLinks) {
      const hrefLower = link.href.toLowerCase();
      const textLower = link.text;
      
      // Check if link text or href contains team-related keywords
      const isTeamLink = TEAM_PAGE_KEYWORDS.some(keyword => 
        hrefLower.includes(keyword) || textLower.includes(keyword)
      );
      
      if (isTeamLink && link.href) {
        try {
          // Resolve relative URLs
          const fullUrl = new URL(link.href, baseUrl).href;
          // Only include same-domain links
          if (fullUrl.startsWith(new URL(baseUrl).origin)) {
            links.push(fullUrl);
          }
        } catch {
          // Invalid URL, skip
        }
      }
    }
  } catch (error) {
    // Page might not be accessible
  }
  
  // Remove duplicates
  return [...new Set(links)];
}

async function scrapeClub(browser: Browser, club: ClubWebsite): Promise<ClubLeagues> {
  const result: ClubLeagues = {
    name: club.name,
    website: club.website,
    leagues: [],
    pagesChecked: [],
    success: false
  };
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'de-CH'
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  try {
    // First, visit the main page
    console.log(`  📄 Checking main page: ${club.website}`);
    await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2000);
    
    result.pagesChecked.push(club.website);
    
    // Get main page content
    let mainContent = await page.evaluate(() => document.body?.innerText || '');
    let mainLeagues = extractLeagues(mainContent);
    result.leagues.push(...mainLeagues);
    
    // Find team-related links
    const teamLinks = await findTeamLinks(page, club.website);
    console.log(`  🔗 Found ${teamLinks.length} team-related links`);
    
    // Visit up to 5 team-related pages
    const linksToVisit = teamLinks.slice(0, 5);
    
    for (const link of linksToVisit) {
      if (result.pagesChecked.includes(link)) continue;
      
      try {
        console.log(`    → Checking: ${link.substring(0, 60)}...`);
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1500);
        
        result.pagesChecked.push(link);
        
        const content = await page.evaluate(() => document.body?.innerText || '');
        const pageLeagues = extractLeagues(content);
        
        // Add new leagues not already found
        for (const league of pageLeagues) {
          const exists = result.leagues.some(
            l => l.league === league.league && l.gender === league.gender
          );
          if (!exists) {
            result.leagues.push(league);
          }
        }
        
        // Also check for nested team links
        if (result.pagesChecked.length < 8) {
          const nestedLinks = await findTeamLinks(page, link);
          for (const nested of nestedLinks.slice(0, 2)) {
            if (!linksToVisit.includes(nested) && !result.pagesChecked.includes(nested)) {
              linksToVisit.push(nested);
            }
          }
        }
      } catch (error) {
        // Skip failed pages
      }
    }
    
    result.success = true;
    console.log(`  ✅ Found ${result.leagues.length} leagues across ${result.pagesChecked.length} pages`);
    
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ Error: ${result.error.substring(0, 50)}`);
  } finally {
    await context.close();
  }
  
  return result;
}

async function main() {
  console.log('🏐 Thorough League Scraper');
  console.log('==========================\n');
  
  // Parse command line args for start index
  const startIndex = parseInt(process.argv[2] || '0', 10);
  
  // Load club websites
  const websitesPath = path.join(__dirname, '../data/club-websites.json');
  const clubsData = JSON.parse(fs.readFileSync(websitesPath, 'utf-8'));
  
  // Handle both object and array formats
  let clubs: ClubWebsite[];
  if (Array.isArray(clubsData)) {
    clubs = clubsData.filter((c: any) => c.website);
  } else {
    // It's an object with IDs as keys
    clubs = Object.values(clubsData).filter((c: any) => c.website) as ClubWebsite[];
  }
  
  console.log(`📊 Found ${clubs.length} clubs with websites`);
  console.log(`📍 Starting from index ${startIndex}\n`);
  
  const browser = await chromium.launch({ headless: true });
  
  // Load existing results if resuming
  const outputPath = path.join(__dirname, '../data/club-leagues-thorough.json');
  let results: ClubLeagues[] = [];
  if (startIndex > 0 && fs.existsSync(outputPath)) {
    results = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    // Trim to only keep results up to startIndex
    results = results.slice(0, startIndex);
    console.log(`📂 Loaded ${results.length} existing results\n`);
  }
  
  // Process clubs one at a time for thoroughness
  for (let i = startIndex; i < clubs.length; i++) {
    const club = clubs[i];
    console.log(`\n[${i + 1}/${clubs.length}] ${club.name}`);
    
    const result = await scrapeClub(browser, club);
    results.push(result);
    
    // Save progress every 10 clubs
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`\n💾 Progress saved (${i + 1} clubs processed)\n`);
    }
  }
  
  await browser.close();
  
  // Final save
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('==========');
  console.log(`Total clubs: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`With leagues found: ${results.filter(r => r.leagues.length > 0).length}`);
  
  const leagueCounts: Record<string, number> = {};
  for (const result of results) {
    for (const league of result.leagues) {
      leagueCounts[league.league] = (leagueCounts[league.league] || 0) + 1;
    }
  }
  
  console.log('\nLeague distribution:');
  Object.entries(leagueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([league, count]) => {
      console.log(`  ${league}: ${count} clubs`);
    });
  
  console.log(`\n✅ Results saved to ${outputPath}`);
}

main().catch(console.error);
