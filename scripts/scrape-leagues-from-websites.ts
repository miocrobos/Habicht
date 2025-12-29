/**
 * Scrape league participation from club websites
 * 
 * Uses existing club-websites.json to scrape league info from official club sites
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

interface ClubWebsite {
  id: string;
  name: string;
  website: string;
  logo: string | null;
}

interface LeagueData {
  womenNLA?: boolean;
  womenNLB?: boolean;
  women1L?: boolean;
  women2L?: boolean;
  women3L?: boolean;
  women4L?: boolean;
  women5L?: boolean;
  menNLA?: boolean;
  menNLB?: boolean;
  men1L?: boolean;
  men2L?: boolean;
  men3L?: boolean;
  men4L?: boolean;
  men5L?: boolean;
}

interface ScrapedClub {
  id: string;
  name: string;
  website: string;
  leagues: LeagueData;
  leaguesFound: string[];
  teamsPageUrl?: string;
  scrapedAt: string;
  error?: string;
}

// League patterns for detecting specific leagues
const LEAGUE_PATTERNS: { [key: string]: RegExp[] } = {
  // Women's leagues - looking for combinations of league + gender indicators
  womenNLA: [
    /NLA\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*NLA/i,
    /NLA-?F/i,
    /Frauen-?NLA/i,
    /1\.\s*Mannschaft.*NLA.*Damen/i,
    /NLA.*1\.\s*Mannschaft.*Damen/i
  ],
  womenNLB: [
    /NLB\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*NLB/i,
    /NLB-?F/i,
    /Frauen-?NLB/i
  ],
  women1L: [
    /1\.?\s*Liga\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*1\.?\s*Liga/i,
    /1L[- ]?(Damen|Frauen|F\b)/i,
    /(Damen|Frauen)\s*1L/i
  ],
  women2L: [
    /2\.?\s*Liga\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*2\.?\s*Liga/i,
    /2L[- ]?(Damen|Frauen|F\b)/i
  ],
  women3L: [
    /3\.?\s*Liga\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*3\.?\s*Liga/i,
    /3L[- ]?(Damen|Frauen|F\b)/i
  ],
  women4L: [
    /4\.?\s*Liga\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*4\.?\s*Liga/i,
    /4L[- ]?(Damen|Frauen|F\b)/i
  ],
  women5L: [
    /5\.?\s*Liga\s*(Damen|Frauen|Women|F\b)/i,
    /(Damen|Frauen|Women)\s*5\.?\s*Liga/i,
    /5L[- ]?(Damen|Frauen|F\b)/i
  ],
  
  // Men's leagues
  menNLA: [
    /NLA\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*NLA/i,
    /NLA-?[MH]/i,
    /Herren-?NLA/i,
    /1\.\s*Mannschaft.*NLA.*Herren/i
  ],
  menNLB: [
    /NLB\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*NLB/i,
    /NLB-?[MH]/i,
    /Herren-?NLB/i
  ],
  men1L: [
    /1\.?\s*Liga\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*1\.?\s*Liga/i,
    /1L[- ]?(Herren|Männer|M\b|H\b)/i
  ],
  men2L: [
    /2\.?\s*Liga\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*2\.?\s*Liga/i,
    /2L[- ]?(Herren|Männer|M\b|H\b)/i
  ],
  men3L: [
    /3\.?\s*Liga\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*3\.?\s*Liga/i,
    /3L[- ]?(Herren|Männer|M\b|H\b)/i
  ],
  men4L: [
    /4\.?\s*Liga\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*4\.?\s*Liga/i,
    /4L[- ]?(Herren|Männer|M\b|H\b)/i
  ],
  men5L: [
    /5\.?\s*Liga\s*(Herren|Männer|Men|M\b|H\b)/i,
    /(Herren|Männer|Men)\s*5\.?\s*Liga/i,
    /5L[- ]?(Herren|Männer|M\b|H\b)/i
  ]
};

// Generic league mentions (for leaguesFound array)
const GENERIC_LEAGUES = [
  { pattern: /\bNLA\b/gi, name: 'NLA' },
  { pattern: /\bNLB\b/gi, name: 'NLB' },
  { pattern: /1\.?\s*Liga\b/gi, name: '1L' },
  { pattern: /2\.?\s*Liga\b/gi, name: '2L' },
  { pattern: /3\.?\s*Liga\b/gi, name: '3L' },
  { pattern: /4\.?\s*Liga\b/gi, name: '4L' },
  { pattern: /5\.?\s*Liga\b/gi, name: '5L' }
];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function detectLeagues(text: string): { leagues: LeagueData; found: string[] } {
  const leagues: LeagueData = {};
  const found: Set<string> = new Set();
  
  // Detect specific leagues by gender
  for (const [key, patterns] of Object.entries(LEAGUE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        (leagues as any)[key] = true;
        break;
      }
    }
  }
  
  // Detect generic league mentions
  for (const { pattern, name } of GENERIC_LEAGUES) {
    if (pattern.test(text)) {
      found.add(name);
    }
  }
  
  return { leagues, found: Array.from(found) };
}

async function scrapeClubWebsite(page: any, url: string, clubName: string): Promise<{ text: string; teamsPage?: string }> {
  let fullText = '';
  let teamsPageUrl: string | undefined;
  
  try {
    // Visit main page
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(2000);
    
    fullText = await page.evaluate(() => document.body?.innerText || '');
    
    // Look for navigation links to teams/mannschaften pages
    const links = await page.$$('a');
    const teamsKeywords = ['team', 'mannschaft', 'ligen', 'liga', 'sport', 'spielbetrieb', 'aktive'];
    
    for (const link of links) {
      try {
        const text = (await link.innerText()).toLowerCase();
        const href = await link.getAttribute('href');
        
        if (href && teamsKeywords.some(kw => text.includes(kw))) {
          teamsPageUrl = new URL(href, url).toString();
          
          // Don't follow mailto or social media links
          if (!teamsPageUrl.includes('mailto:') && 
              !teamsPageUrl.includes('facebook.') &&
              !teamsPageUrl.includes('instagram.') &&
              !teamsPageUrl.includes('twitter.')) {
            
            console.log(`    Found teams page: ${teamsPageUrl}`);
            
            try {
              await page.goto(teamsPageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
              await delay(1500);
              const teamsText = await page.evaluate(() => document.body?.innerText || '');
              fullText += '\n\n' + teamsText;
              break;
            } catch (navError) {
              // Continue to next link
            }
          }
        }
      } catch (e) {
        // Skip this link
      }
    }
    
  } catch (error: any) {
    console.log(`    Error: ${error.message?.substring(0, 50)}`);
  }
  
  return { text: fullText, teamsPage: teamsPageUrl };
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const websitesFile = path.join(dataDir, 'club-websites.json');
  const outputFile = path.join(dataDir, 'clubs-with-leagues-scraped.json');
  const progressFile = path.join(dataDir, 'scrape-leagues-progress.json');
  
  // Load websites data
  if (!fs.existsSync(websitesFile)) {
    console.error('club-websites.json not found!');
    process.exit(1);
  }
  
  const websitesData: Record<string, ClubWebsite> = JSON.parse(fs.readFileSync(websitesFile, 'utf-8'));
  const clubs = Object.values(websitesData);
  console.log(`Loaded ${clubs.length} clubs with websites`);
  
  // Load progress if exists
  let processed: Set<string> = new Set();
  let results: ScrapedClub[] = [];
  
  if (fs.existsSync(progressFile)) {
    const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
    processed = new Set(progress.processed || []);
    results = progress.results || [];
    console.log(`Resuming from progress: ${processed.size} clubs processed`);
  }
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'de-CH'
  });
  
  const page = await context.newPage();
  
  try {
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i];
      
      if (processed.has(club.id)) {
        continue;
      }
      
      console.log(`\n[${processed.size + 1}/${clubs.length}] ${club.name}`);
      console.log(`  Website: ${club.website}`);
      
      const scrapedClub: ScrapedClub = {
        id: club.id,
        name: club.name,
        website: club.website,
        leagues: {},
        leaguesFound: [],
        scrapedAt: new Date().toISOString()
      };
      
      try {
        const { text, teamsPage } = await scrapeClubWebsite(page, club.website, club.name);
        const { leagues, found } = detectLeagues(text);
        
        scrapedClub.leagues = leagues;
        scrapedClub.leaguesFound = found;
        scrapedClub.teamsPageUrl = teamsPage;
        
        const leagueCount = Object.keys(leagues).filter(k => (leagues as any)[k]).length;
        console.log(`  Specific leagues: ${leagueCount > 0 ? Object.keys(leagues).filter(k => (leagues as any)[k]).join(', ') : 'none'}`);
        console.log(`  Generic: ${found.length > 0 ? found.join(', ') : 'none'}`);
        
      } catch (error: any) {
        scrapedClub.error = error.message;
        console.log(`  Error: ${error.message?.substring(0, 60)}`);
      }
      
      results.push(scrapedClub);
      processed.add(club.id);
      
      // Save progress every 20 clubs
      if (processed.size % 20 === 0) {
        fs.writeFileSync(progressFile, JSON.stringify({ processed: Array.from(processed), results }, null, 2));
        console.log(`\n--- Progress saved: ${processed.size}/${clubs.length} ---`);
      }
      
      // Rate limiting
      await delay(1500);
    }
    
  } finally {
    await browser.close();
  }
  
  // Calculate statistics
  const stats = {
    total: results.length,
    withLeagues: results.filter(r => r.leaguesFound.length > 0).length,
    womenNLA: results.filter(r => r.leagues.womenNLA).length,
    womenNLB: results.filter(r => r.leagues.womenNLB).length,
    women1L: results.filter(r => r.leagues.women1L).length,
    women2L: results.filter(r => r.leagues.women2L).length,
    women3L: results.filter(r => r.leagues.women3L).length,
    women4L: results.filter(r => r.leagues.women4L).length,
    women5L: results.filter(r => r.leagues.women5L).length,
    menNLA: results.filter(r => r.leagues.menNLA).length,
    menNLB: results.filter(r => r.leagues.menNLB).length,
    men1L: results.filter(r => r.leagues.men1L).length,
    men2L: results.filter(r => r.leagues.men2L).length,
    men3L: results.filter(r => r.leagues.men3L).length,
    men4L: results.filter(r => r.leagues.men4L).length,
    men5L: results.filter(r => r.leagues.men5L).length,
    errors: results.filter(r => r.error).length
  };
  
  // Save final output
  const output = {
    clubs: results,
    statistics: stats,
    scrapedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  
  console.log('\n========================================');
  console.log('SCRAPING COMPLETE');
  console.log('========================================');
  console.log(`Total: ${stats.total} | With leagues: ${stats.withLeagues} | Errors: ${stats.errors}`);
  console.log('\nWomen\'s Leagues:');
  console.log(`  NLA: ${stats.womenNLA}, NLB: ${stats.womenNLB}`);
  console.log(`  1L: ${stats.women1L}, 2L: ${stats.women2L}, 3L: ${stats.women3L}`);
  console.log(`  4L: ${stats.women4L}, 5L: ${stats.women5L}`);
  console.log('\nMen\'s Leagues:');
  console.log(`  NLA: ${stats.menNLA}, NLB: ${stats.menNLB}`);
  console.log(`  1L: ${stats.men1L}, 2L: ${stats.men2L}, 3L: ${stats.men3L}`);
  console.log(`  4L: ${stats.men4L}, 5L: ${stats.men5L}`);
  console.log(`\nOutput: ${outputFile}`);
  
  // Clean up progress file
  if (fs.existsSync(progressFile)) {
    fs.unlinkSync(progressFile);
  }
}

main().catch(console.error);
