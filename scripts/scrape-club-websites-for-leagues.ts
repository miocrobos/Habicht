/**
 * Plan B: Scrape club websites for league participation
 * 
 * Uses existing club-websites.json (254 clubs with websites)
 * Scrapes each site for team/league information
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const WEBSITES_FILE = path.join(DATA_DIR, 'club-websites.json');
const OUTPUT_FILE = path.join(DATA_DIR, 'club-leagues-scraped.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'scrape-progress.json');

interface ClubWebsite {
  id: string;
  name: string;
  website: string;
  logo: string | null;
}

interface ClubLeagueResult {
  id: string;
  name: string;
  website: string;
  womenLeagues: string[];
  menLeagues: string[];
  youthLeagues: string[];
  allLeagues: string[];
  pagesScraped: string[];
  textSample?: string;
  error?: string;
}

// League detection patterns - expanded for Swiss volleyball (DE/FR/IT)
// Maps to standard Swiss league codes: NLA, NLB, 1L, 2L, 3L, 4L, 5L
const LEAGUE_PATTERNS: Record<string, { pattern: RegExp; normalized: string }> = {
  // NLA - German, French, Italian (many variations)
  nla_de: { pattern: /\bNLA\b|\bNationalliga\s*A\b|\bNat\.?\s*Liga\s*A\b/gi, normalized: 'NLA' },
  nla_fr: { pattern: /\bLigue\s*Nationale\s*A\b|\bLNA\b|\bLig\.?\s*Nat\.?\s*A\b/gi, normalized: 'NLA' },
  nla_it: { pattern: /\bLega\s*Nazionale\s*A\b/gi, normalized: 'NLA' },
  nla_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*1\s*[\(\[]?\s*NLA\s*[\)\]]?/gi, normalized: 'NLA' },
  
  // NLB - German, French, Italian (many variations)
  nlb_de: { pattern: /\bNLB\b|\bNationalliga\s*B\b|\bNat\.?\s*Liga\s*B\b/gi, normalized: 'NLB' },
  nlb_fr: { pattern: /\bLigue\s*Nationale\s*B\b|\bLNB\b|\bLig\.?\s*Nat\.?\s*B\b/gi, normalized: 'NLB' },
  nlb_it: { pattern: /\bLega\s*Nazionale\s*B\b/gi, normalized: 'NLB' },
  nlb_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*\d?\s*[\(\[]?\s*NLB\s*[\)\]]?/gi, normalized: 'NLB' },
  
  // 1. Liga - German, French, Italian (expanded patterns)
  liga1_de: { pattern: /\b1\.?\s*Liga\b|\bLiga\s*1\b|\bErste\s*Liga\b|\b1\.\s*Liga\b/gi, normalized: '1L' },
  liga1_fr: { pattern: /\b1[èe]?re?\s*Ligue\b|\bLigue\s*1\b|\bPremière\s*Ligue\b|\b1ère\s*ligue\b/gi, normalized: '1L' },
  liga1_it: { pattern: /\bPrima\s*Lega\b|\b1[°ª]?\s*Lega\b|\bLega\s*1\b|\bSerie\s*1\b/gi, normalized: '1L' },
  liga1_short: { pattern: /\b1L\b|\b1\.\s*L\b/gi, normalized: '1L' },
  liga1_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*\d?\s*[\(\[]?\s*1\.?\s*(?:Liga|Ligue|Lega)\s*[\)\]]?/gi, normalized: '1L' },
  
  // 2. Liga - German, French, Italian (expanded patterns)
  liga2_de: { pattern: /\b2\.?\s*Liga\b|\bLiga\s*2\b|\bZweite\s*Liga\b|\b2\.\s*Liga\b/gi, normalized: '2L' },
  liga2_fr: { pattern: /\b2[èe]?me?\s*Ligue\b|\bLigue\s*2\b|\bDeuxième\s*Ligue\b|\b2ème\s*ligue\b/gi, normalized: '2L' },
  liga2_it: { pattern: /\bSeconda\s*Lega\b|\b2[°ª]?\s*Lega\b|\bLega\s*2\b|\bSerie\s*2\b/gi, normalized: '2L' },
  liga2_short: { pattern: /\b2L\b|\b2\.\s*L\b/gi, normalized: '2L' },
  liga2_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*\d?\s*[\(\[]?\s*2\.?\s*(?:Liga|Ligue|Lega)\s*[\)\]]?/gi, normalized: '2L' },
  
  // 3. Liga - German, French, Italian (expanded patterns)
  liga3_de: { pattern: /\b3\.?\s*Liga\b|\bLiga\s*3\b|\bDritte\s*Liga\b|\b3\.\s*Liga\b/gi, normalized: '3L' },
  liga3_fr: { pattern: /\b3[èe]?me?\s*Ligue\b|\bLigue\s*3\b|\bTroisième\s*Ligue\b|\b3ème\s*ligue\b/gi, normalized: '3L' },
  liga3_it: { pattern: /\bTerza\s*Lega\b|\b3[°ª]?\s*Lega\b|\bLega\s*3\b|\bSerie\s*3\b/gi, normalized: '3L' },
  liga3_short: { pattern: /\b3L\b|\b3\.\s*L\b/gi, normalized: '3L' },
  liga3_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*\d?\s*[\(\[]?\s*3\.?\s*(?:Liga|Ligue|Lega)\s*[\)\]]?/gi, normalized: '3L' },
  
  // 4. Liga - German, French, Italian (expanded patterns)
  liga4_de: { pattern: /\b4\.?\s*Liga\b|\bLiga\s*4\b|\bVierte\s*Liga\b|\b4\.\s*Liga\b/gi, normalized: '4L' },
  liga4_fr: { pattern: /\b4[èe]?me?\s*Ligue\b|\bLigue\s*4\b|\bQuatrième\s*Ligue\b|\b4ème\s*ligue\b/gi, normalized: '4L' },
  liga4_it: { pattern: /\bQuarta\s*Lega\b|\b4[°ª]?\s*Lega\b|\bLega\s*4\b|\bSerie\s*4\b/gi, normalized: '4L' },
  liga4_short: { pattern: /\b4L\b|\b4\.\s*L\b/gi, normalized: '4L' },
  liga4_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*\d?\s*[\(\[]?\s*4\.?\s*(?:Liga|Ligue|Lega)\s*[\)\]]?/gi, normalized: '4L' },
  
  // 5. Liga - German, French, Italian (hobby level, expanded patterns)
  liga5_de: { pattern: /\b5\.?\s*Liga\b|\bLiga\s*5\b|\bFünfte\s*Liga\b|\b5\.\s*Liga\b/gi, normalized: '5L' },
  liga5_fr: { pattern: /\b5[èe]?me?\s*Ligue\b|\bLigue\s*5\b|\bCinquième\s*Ligue\b|\b5ème\s*ligue\b/gi, normalized: '5L' },
  liga5_it: { pattern: /\bQuinta\s*Lega\b|\b5[°ª]?\s*Lega\b|\bLega\s*5\b|\bSerie\s*5\b/gi, normalized: '5L' },
  liga5_short: { pattern: /\b5L\b|\b5\.\s*L\b/gi, normalized: '5L' },
  liga5_team: { pattern: /\b(?:Herren|Damen|Frauen|Hommes|Femmes)\s*\d?\s*[\(\[]?\s*5\.?\s*(?:Liga|Ligue|Lega)\s*[\)\]]?/gi, normalized: '5L' },
  
  // Youth patterns - U13 to U23 (multilingual, more variations)
  u13: { pattern: /\bU[\-\s]?13\b|\bUnter[\-\s]?13\b|\bMoins\s*de\s*13\b|\bM13\b|\bJg\.?\s*\d{4}\b/gi, normalized: 'U13' },
  u14: { pattern: /\bU[\-\s]?14\b|\bUnter[\-\s]?14\b|\bMoins\s*de\s*14\b|\bM14\b/gi, normalized: 'U14' },
  u15: { pattern: /\bU[\-\s]?15\b|\bUnter[\-\s]?15\b|\bMoins\s*de\s*15\b|\bM15\b/gi, normalized: 'U15' },
  u16: { pattern: /\bU[\-\s]?16\b|\bUnter[\-\s]?16\b|\bMoins\s*de\s*16\b|\bM16\b/gi, normalized: 'U16' },
  u17: { pattern: /\bU[\-\s]?17\b|\bUnter[\-\s]?17\b|\bMoins\s*de\s*17\b|\bM17\b/gi, normalized: 'U17' },
  u18: { pattern: /\bU[\-\s]?18\b|\bUnter[\-\s]?18\b|\bMoins\s*de\s*18\b|\bM18\b/gi, normalized: 'U18' },
  u19: { pattern: /\bU[\-\s]?19\b|\bUnter[\-\s]?19\b|\bMoins\s*de\s*19\b|\bM19\b/gi, normalized: 'U19' },
  u20: { pattern: /\bU[\-\s]?20\b|\bUnter[\-\s]?20\b|\bMoins\s*de\s*20\b|\bM20\b/gi, normalized: 'U20' },
  u21: { pattern: /\bU[\-\s]?21\b|\bUnter[\-\s]?21\b|\bMoins\s*de\s*21\b|\bM21\b/gi, normalized: 'U21' },
  u23: { pattern: /\bU[\-\s]?23\b|\bUnter[\-\s]?23\b|\bMoins\s*de\s*23\b|\bM23\b/gi, normalized: 'U23' },
  
  // Juniors / Cadets (FR/IT/DE terms for youth - expanded)
  juniors: { pattern: /\bJuniors?\b|\bJunioren\b|\bGiovani\b|\bJuniorinnen\b/gi, normalized: 'JUNIORS' },
  cadets: { pattern: /\bCadets?\b|\bCadettes?\b|\bKadetten\b|\bCadetti\b/gi, normalized: 'CADETS' },
  minimes: { pattern: /\bMinimes?\b|\bMini\s*Volley\b/gi, normalized: 'MINIMES' },
  nachwuchs: { pattern: /\bNachwuchs\b|\bNachwuchsteam\b/gi, normalized: 'NACHWUCHS' },
};

// Gender context patterns - German, French, Italian (expanded)
const WOMEN_CONTEXT = /(?:damen|frauen|women|girls?|weiblich|feminin|féminin|female|femmes?|donne|ragazze|signore|filles?|féminines?|[^a-z]f\b)/i;
const MEN_CONTEXT = /(?:herren|männer|men|jungs?|männlich|masculin|male|hommes?|uomini|ragazzi|signori|garçons?|masculins?|[^a-z]m\b|[^a-z]h\b)/i;

// Youth category indicators (multilingual)
const YOUTH_LEAGUES = ['U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21', 'U23', 'JUNIORS', 'CADETS', 'MINIMES'];

function extractLeagues(text: string): { women: string[], men: string[], youth: string[], all: string[] } {
  const women: Set<string> = new Set();
  const men: Set<string> = new Set();
  const youth: Set<string> = new Set();
  const all: Set<string> = new Set();
  
  // Split text into lines/sections for context analysis
  const lines = text.split(/[\n\r]+/);
  
  for (const line of lines) {
    const lineLower = line.toLowerCase();
    const hasWomenContext = WOMEN_CONTEXT.test(line);
    const hasMenContext = MEN_CONTEXT.test(line);
    
    // Check each pattern and use normalized league name
    for (const [key, { pattern, normalized }] of Object.entries(LEAGUE_PATTERNS)) {
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
      const matches = line.match(pattern);
      if (matches) {
        all.add(normalized);
        
        // Categorize by youth first, then gender
        if (YOUTH_LEAGUES.includes(normalized)) {
          youth.add(normalized);
          // Youth can still have gender context
          if (hasWomenContext) women.add(normalized);
          if (hasMenContext) men.add(normalized);
        } else {
          // Adult leagues
          if (hasWomenContext) women.add(normalized);
          else if (hasMenContext) men.add(normalized);
        }
      }
    }
  }
  
  return {
    women: [...women],
    men: [...men],
    youth: [...youth],
    all: [...all]
  };
}

async function findTeamPages(page: Page, baseUrl: string): Promise<string[]> {
  const teamPages: string[] = [];
  
  try {
    const links = await page.evaluate(() => {
      // EXPANDED multilingual keywords for teams/leagues pages (DE, FR, IT, EN)
      const keywords = [
        // German - teams
        'team', 'teams', 'mannschaft', 'mannschaften', 'kader', 'spielbetrieb', 
        'aktive', 'spieler', 'spielerinnen', 'herren', 'damen', 'frauen',
        'erste', 'zweite', 'dritte', 'juniors', 'junioren', 'nachwuchs',
        // German - leagues
        'ligen', 'liga', 'meisterschaft', 'nationalliga', 'nla', 'nlb',
        // French - teams  
        'equipe', 'équipe', 'equipes', 'équipes', 'effectif', 'effectifs',
        'joueurs', 'joueuses', 'hommes', 'femmes', 'seniors', 'juniors',
        'premiere', 'première', 'deuxieme', 'deuxième', 'troisieme', 'troisième',
        // French - leagues
        'ligue', 'ligues', 'championnat', 'championnats', 'nationale',
        // Italian - teams
        'squadra', 'squadre', 'giocatori', 'giocatrici', 'rosa', 'organico',
        'prima', 'seconda', 'terza', 'uomini', 'donne', 'maschile', 'femminile',
        // Italian - leagues
        'lega', 'leghe', 'campionato', 'campionati', 'nazionale',
        // English
        'squad', 'squads', 'roster', 'rosters', 'leagues', 'players', 'women', 'men',
        // General navigation terms
        'sport', 'volley', 'volleyball', 'indoor', 'verein', 'club', 'saison',
        'season', 'spielplan', 'calendrier', 'calendario', 'resultate', 'results',
        // Specific team identifiers
        'u13', 'u14', 'u15', 'u16', 'u17', 'u18', 'u19', 'u20', 'u21', 'u23',
        'm13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19', 'm20', 'm21', 'm23',
        '1l', '2l', '3l', '4l', '5l', '1.liga', '2.liga', '3.liga', '4.liga', '5.liga'
      ];
      
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      const found: string[] = [];
      
      for (const link of allLinks) {
        const href = (link.getAttribute('href') || '').toLowerCase();
        const text = (link.textContent || '').toLowerCase().trim();
        
        // Skip external links, anchors, and non-http links
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
        
        for (const keyword of keywords) {
          if (href.includes(keyword) || text.includes(keyword)) {
            const fullHref = link.getAttribute('href') || '';
            if (!found.includes(fullHref) && fullHref.length > 0) {
              found.push(fullHref);
            }
            break;
          }
        }
      }
      
      // Also get all navigation menu links
      const navLinks = Array.from(document.querySelectorAll('nav a[href], .nav a[href], .menu a[href], .navigation a[href], header a[href], [role="navigation"] a[href]'));
      for (const link of navLinks) {
        const fullHref = link.getAttribute('href') || '';
        if (!found.includes(fullHref) && fullHref.length > 0) {
          found.push(fullHref);
        }
      }
      
      return found;
    });
    
    // Convert relative URLs to absolute
    for (const link of links) {
      try {
        const url = new URL(link, baseUrl);
        if (url.hostname === new URL(baseUrl).hostname) {
          teamPages.push(url.href);
        }
      } catch {
        // Invalid URL, skip
      }
    }
  } catch (error) {
    console.log('  Error finding team pages');
  }
  
  // Return more pages (up to 15) for thorough scraping
  return [...new Set(teamPages)].slice(0, 15);
}

async function scrapeClub(page: Page, club: ClubWebsite): Promise<ClubLeagueResult> {
  const result: ClubLeagueResult = {
    id: club.id,
    name: club.name,
    website: club.website,
    womenLeagues: [],
    menLeagues: [],
    youthLeagues: [],
    allLeagues: [],
    pagesScraped: []
  };
  
  try {
    // Visit main page with DOM loaded first, then wait for dynamic content
    console.log(`  Loading ${club.website}...`);
    await page.goto(club.website, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000); // Wait for JS to load dynamic content
    
    // Extract text from various page elements for thorough analysis
    let allText = await page.evaluate(() => {
      const body = document.body?.innerText || '';
      
      // Also get text from specific elements that might contain league info
      const tables = Array.from(document.querySelectorAll('table')).map(t => t.innerText).join('\n');
      const lists = Array.from(document.querySelectorAll('ul, ol')).map(l => l.innerText).join('\n');
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.innerText).join('\n');
      const cards = Array.from(document.querySelectorAll('.card, .team, .mannschaft, .squad, [class*="team"], [class*="liga"], [class*="league"]')).map(c => c.innerText).join('\n');
      
      // Get alt text and title attributes (sometimes leagues are in images)
      const imgAlts = Array.from(document.querySelectorAll('img[alt]')).map(i => i.getAttribute('alt') || '').join('\n');
      const titles = Array.from(document.querySelectorAll('[title]')).map(e => e.getAttribute('title') || '').join('\n');
      
      return [body, tables, lists, headings, cards, imgAlts, titles].join('\n');
    });
    result.pagesScraped.push(club.website);
    
    // Find and visit team pages (now gets up to 15)
    const teamPages = await findTeamPages(page, club.website);
    console.log(`  Found ${teamPages.length} team pages`);
    
    // Track visited URLs to find second-level pages
    const secondLevelPages: string[] = [];
    
    for (const teamPage of teamPages) {
      if (result.pagesScraped.includes(teamPage)) continue;
      
      try {
        await page.goto(teamPage, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000); // Wait for dynamic content
        
        // Extract text thoroughly from this page too
        const pageText = await page.evaluate(() => {
          const body = document.body?.innerText || '';
          const tables = Array.from(document.querySelectorAll('table')).map(t => t.innerText).join('\n');
          const lists = Array.from(document.querySelectorAll('ul, ol')).map(l => l.innerText).join('\n');
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.innerText).join('\n');
          const cards = Array.from(document.querySelectorAll('.card, .team, .mannschaft, .squad, [class*="team"], [class*="liga"], [class*="league"]')).map(c => c.innerText).join('\n');
          return [body, tables, lists, headings, cards].join('\n');
        });
        allText += '\n' + pageText;
        result.pagesScraped.push(teamPage);
        
        // Find second-level links from team pages (for deeper scraping)
        const subLinks = await findTeamPages(page, teamPage);
        for (const subLink of subLinks.slice(0, 3)) {
          if (!result.pagesScraped.includes(subLink) && !secondLevelPages.includes(subLink)) {
            secondLevelPages.push(subLink);
          }
        }
      } catch {
        // Skip failed pages
      }
    }
    
    // Visit second-level pages (limit to 10 for performance)
    console.log(`  Found ${secondLevelPages.length} second-level pages`);
    for (const subPage of secondLevelPages.slice(0, 10)) {
      if (result.pagesScraped.includes(subPage)) continue;
      
      try {
        await page.goto(subPage, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const pageText = await page.evaluate(() => document.body?.innerText || '');
        allText += '\n' + pageText;
        result.pagesScraped.push(subPage);
      } catch {
        // Skip failed pages
      }
    }
    
    console.log(`  Total pages scraped: ${result.pagesScraped.length}`);
    
    // Extract leagues from combined text
    const leagues = extractLeagues(allText);
    result.womenLeagues = leagues.women;
    result.menLeagues = leagues.men;
    result.youthLeagues = leagues.youth;
    result.allLeagues = leagues.all;
    result.textSample = allText.substring(0, 500);
    
  } catch (error: any) {
    result.error = error.message || 'Unknown error';
    console.log(`  Error: ${result.error}`);
  }
  
  return result;
}

async function main() {
  console.log('=== Club Website League Scraper ===\n');
  
  // Load websites data
  if (!fs.existsSync(WEBSITES_FILE)) {
    console.error('club-websites.json not found!');
    process.exit(1);
  }
  
  const websitesData: Record<string, ClubWebsite> = JSON.parse(fs.readFileSync(WEBSITES_FILE, 'utf-8'));
  const clubs = Object.values(websitesData).filter(c => c.website);
  console.log(`Found ${clubs.length} clubs with websites\n`);
  
  // Load progress if exists
  let results: ClubLeagueResult[] = [];
  let processedIds = new Set<string>();
  
  if (fs.existsSync(PROGRESS_FILE)) {
    const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    results = progress.results || [];
    processedIds = new Set(results.map(r => r.id));
    console.log(`Resuming: ${processedIds.size} clubs already processed\n`);
  }
  
  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  // Limit for testing (remove or increase for full run)
  const MAX_CLUBS = 254; // Process all clubs
  let processed = 0;
  
  try {
    for (const club of clubs) {
      if (processedIds.has(club.id)) continue;
      if (processed >= MAX_CLUBS) break;
      
      console.log(`[${processed + 1}/${Math.min(MAX_CLUBS, clubs.length)}] ${club.name}`);
      
      const result = await scrapeClub(page, club);
      results.push(result);
      processedIds.add(club.id);
      processed++;
      
      if (result.allLeagues.length > 0) {
        console.log(`  ✓ Found: ${result.allLeagues.join(', ')}`);
      } else if (!result.error) {
        console.log(`  - No leagues found`);
      }
      
      // Save progress every 10 clubs
      if (processed % 10 === 0) {
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ results }, null, 2));
        console.log(`\n--- Saved progress: ${results.length} clubs ---\n`);
      }
      
      // Rate limit
      await page.waitForTimeout(1500);
    }
  } finally {
    await browser.close();
  }
  
  // Generate stats
  const stats = {
    totalScraped: results.length,
    withLeagues: results.filter(r => r.allLeagues.length > 0).length,
    withErrors: results.filter(r => r.error).length,
    womenNLA: results.filter(r => r.womenLeagues.includes('NLA')).length,
    womenNLB: results.filter(r => r.womenLeagues.includes('NLB')).length,
    menNLA: results.filter(r => r.menLeagues.includes('NLA')).length,
    menNLB: results.filter(r => r.menLeagues.includes('NLB')).length,
    uniqueLeagues: [...new Set(results.flatMap(r => r.allLeagues))],
  };
  
  // Save final output
  const output = {
    scrapedAt: new Date().toISOString(),
    statistics: stats,
    results
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  
  console.log('\n========================================');
  console.log('SCRAPING COMPLETE');
  console.log('========================================');
  console.log(`Total scraped: ${stats.totalScraped}`);
  console.log(`With leagues: ${stats.withLeagues}`);
  console.log(`Errors: ${stats.withErrors}`);
  console.log(`\nWomen: NLA=${stats.womenNLA}, NLB=${stats.womenNLB}`);
  console.log(`Men: NLA=${stats.menNLA}, NLB=${stats.menNLB}`);
  console.log(`\nUnique leagues found: ${stats.uniqueLeagues.join(', ')}`);
  console.log(`\nSaved to: ${OUTPUT_FILE}`);
  
  // Cleanup progress file
  if (fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
  }
}

main().catch(console.error);
