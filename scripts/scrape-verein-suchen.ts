/**
 * SWISS VOLLEY CLUB SCRAPER - From Verein Suchen
 * 
 * Scrapes ALL clubs from https://www.volleyball.ch/de/verband/services/verein-suchen
 * Extracts club offerings including:
 * - Volleyball Frauen (NLA – 5L)
 * - Volleyball Männer (NLA – 5L)
 * - Volleyball Juniorinnen (U23 – U13)
 * - Volleyball Junioren (U23 – U13)
 * 
 * This is the authoritative source for Swiss volleyball clubs
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ClubData {
  name: string;
  postalCode?: string;
  city?: string;
  email?: string;
  website?: string;
  // Offerings
  hasWomenSenior: boolean;      // Volleyball Frauen (NLA – 5L)
  hasMenSenior: boolean;        // Volleyball Männer (NLA – 5L)
  hasWomenYouth: boolean;       // Volleyball Juniorinnen (U23 – U13)
  hasMenYouth: boolean;         // Volleyball Junioren (U23 – U13)
  hasKidsVolley: boolean;       // Kids Volley
  hasBeachWomen: boolean;       // Beachvolleyball Frauen
  hasBeachMen: boolean;         // Beachvolleyball Männer
  hasBeachYouthWomen: boolean;  // Beachvolleyball Juniorinnen
  hasBeachYouthMen: boolean;    // Beachvolleyball Junioren
  hasOtherAdult: boolean;       // Weitere Angebote Erwachsene
  hasOtherYouth: boolean;       // Weitere Angebote Nachwuchs
  rawOfferings: string[];       // All offerings as scraped
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(70));
  console.log('SWISS VOLLEY CLUB SCRAPER');
  console.log('Source: https://www.volleyball.ch/de/verband/services/verein-suchen');
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
  page.setDefaultTimeout(60000);

  const allClubs: ClubData[] = [];
  
  console.log('\n📡 Navigating to Verein suchen page...');
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { 
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await delay(3000);

  // Get total clubs count
  const headerText = await page.locator('body').innerText();
  const clubCountMatch = headerText.match(/(\d+)\s+Vereine gefunden/);
  const totalClubs = clubCountMatch ? parseInt(clubCountMatch[1]) : 0;
  console.log(`\n📊 Found ${totalClubs} clubs to scrape\n`);

  // Function to extract clubs from current page
  const extractClubsFromPage = async (): Promise<ClubData[]> => {
    const clubs: ClubData[] = [];
    
    // Get the page text content
    const bodyText = await page.locator('body').innerText();
    
    // Split into lines and parse
    const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
    
    let currentClub: Partial<ClubData> | null = null;
    let inAngebotSection = false;
    let offerings: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip navigation and header content
      if (line === 'Details' || line === 'Karte' || line === 'Suche' || 
          line === 'Angebot wählen' || line.includes('Vereine gefunden') ||
          line.startsWith('Swiss Volley') || line === '›' ||
          line === 'Informationen für:' || line === 'FR' ||
          line.includes('Saisonwechsels') || line.includes('VolleyManager') ||
          line.includes('Die Angaben zu den Vereinen') ||
          line === 'Verein suchen' || line === 'Verband' || line === 'Services' ||
          line === 'Teams' || line === 'Spieler:innen' || line === 'Trainer:innen' ||
          line === 'Schiedsrichter:innen' || line === 'Vereine' || line === 'Eltern' ||
          line === 'Medien' || line === 'Game Center' || line === 'News' ||
          line === 'Leistungssport' || line === 'Breitensport' || line === 'Ausbildung' ||
          line === 'Wissen' || line === 'Angebot') {
        continue;
      }
      
      // Pagination numbers at the end
      if (line.match(/^[\d\s]+$/) && line.length < 20) {
        continue;
      }
      
      // Check for "Angebot" section start
      if (line === 'Angebot') {
        inAngebotSection = true;
        offerings = [];
        continue;
      }
      
      // Check for "Vereinswebseite" - marks end of a club entry
      if (line === 'Vereinswebseite' || line.startsWith('Kontakt:')) {
        if (line.startsWith('Kontakt:')) {
          if (currentClub) {
            currentClub.email = line.replace('Kontakt:', '').trim();
          }
        }
        continue;
      }
      
      // Check if this is a postal code + city line (e.g., "5000 Aarau")
      const postalMatch = line.match(/^(\d{4})\s+(.+)$/);
      if (postalMatch && currentClub) {
        currentClub.postalCode = postalMatch[1];
        currentClub.city = postalMatch[2];
        continue;
      }
      
      // Check for offering lines
      if (inAngebotSection) {
        if (line.includes('Volleyball Frauen') || 
            line.includes('Volleyball Männer') ||
            line.includes('Volleyball Juniorinnen') ||
            line.includes('Volleyball Junioren') ||
            line.includes('Kids Volley') ||
            line.includes('Beachvolleyball') ||
            line.includes('Weitere Angebote')) {
          offerings.push(line);
          continue;
        }
        
        // If we hit something that doesn't look like an offering, it might be a new club name
        if (!line.includes('(') && line.length > 2 && !line.match(/^\d/) && 
            line !== 'Angebot' && line !== 'Vereinswebseite') {
          // Save previous club if exists
          if (currentClub && currentClub.name) {
            currentClub.rawOfferings = [...offerings];
            currentClub.hasWomenSenior = offerings.some(o => o.includes('Volleyball Frauen'));
            currentClub.hasMenSenior = offerings.some(o => o.includes('Volleyball Männer'));
            currentClub.hasWomenYouth = offerings.some(o => o.includes('Volleyball Juniorinnen'));
            currentClub.hasMenYouth = offerings.some(o => o.includes('Volleyball Junioren'));
            currentClub.hasKidsVolley = offerings.some(o => o.includes('Kids Volley'));
            currentClub.hasBeachWomen = offerings.some(o => o.includes('Beachvolleyball Frauen'));
            currentClub.hasBeachMen = offerings.some(o => o.includes('Beachvolleyball Männer'));
            currentClub.hasBeachYouthWomen = offerings.some(o => o.includes('Beachvolleyball Juniorinnen'));
            currentClub.hasBeachYouthMen = offerings.some(o => o.includes('Beachvolleyball Junioren'));
            currentClub.hasOtherAdult = offerings.some(o => o.includes('Weitere Angebote Erwachsene'));
            currentClub.hasOtherYouth = offerings.some(o => o.includes('Weitere Angebote Nachwuchs'));
            
            clubs.push(currentClub as ClubData);
          }
          
          // Start new club
          currentClub = { 
            name: line,
            hasWomenSenior: false,
            hasMenSenior: false,
            hasWomenYouth: false,
            hasMenYouth: false,
            hasKidsVolley: false,
            hasBeachWomen: false,
            hasBeachMen: false,
            hasBeachYouthWomen: false,
            hasBeachYouthMen: false,
            hasOtherAdult: false,
            hasOtherYouth: false,
            rawOfferings: []
          };
          inAngebotSection = false;
          offerings = [];
        }
      } else {
        // Not in Angebot section - this might be a club name
        if (!line.includes('(') && line.length > 2 && !line.match(/^\d/) &&
            line !== 'Angebot' && line !== 'Vereinswebseite' && 
            !line.includes('Kontakt:')) {
          // Save previous club if exists
          if (currentClub && currentClub.name && offerings.length > 0) {
            currentClub.rawOfferings = [...offerings];
            currentClub.hasWomenSenior = offerings.some(o => o.includes('Volleyball Frauen'));
            currentClub.hasMenSenior = offerings.some(o => o.includes('Volleyball Männer'));
            currentClub.hasWomenYouth = offerings.some(o => o.includes('Volleyball Juniorinnen'));
            currentClub.hasMenYouth = offerings.some(o => o.includes('Volleyball Junioren'));
            currentClub.hasKidsVolley = offerings.some(o => o.includes('Kids Volley'));
            currentClub.hasBeachWomen = offerings.some(o => o.includes('Beachvolleyball Frauen'));
            currentClub.hasBeachMen = offerings.some(o => o.includes('Beachvolleyball Männer'));
            currentClub.hasBeachYouthWomen = offerings.some(o => o.includes('Beachvolleyball Juniorinnen'));
            currentClub.hasBeachYouthMen = offerings.some(o => o.includes('Beachvolleyball Junioren'));
            currentClub.hasOtherAdult = offerings.some(o => o.includes('Weitere Angebote Erwachsene'));
            currentClub.hasOtherYouth = offerings.some(o => o.includes('Weitere Angebote Nachwuchs'));
            
            clubs.push(currentClub as ClubData);
          }
          
          // Start new club
          currentClub = { 
            name: line,
            hasWomenSenior: false,
            hasMenSenior: false,
            hasWomenYouth: false,
            hasMenYouth: false,
            hasKidsVolley: false,
            hasBeachWomen: false,
            hasBeachMen: false,
            hasBeachYouthWomen: false,
            hasBeachYouthMen: false,
            hasOtherAdult: false,
            hasOtherYouth: false,
            rawOfferings: []
          };
          offerings = [];
        }
      }
    }
    
    // Don't forget the last club
    if (currentClub && currentClub.name && offerings.length > 0) {
      currentClub.rawOfferings = [...offerings];
      currentClub.hasWomenSenior = offerings.some(o => o.includes('Volleyball Frauen'));
      currentClub.hasMenSenior = offerings.some(o => o.includes('Volleyball Männer'));
      currentClub.hasWomenYouth = offerings.some(o => o.includes('Volleyball Juniorinnen'));
      currentClub.hasMenYouth = offerings.some(o => o.includes('Volleyball Junioren'));
      currentClub.hasKidsVolley = offerings.some(o => o.includes('Kids Volley'));
      currentClub.hasBeachWomen = offerings.some(o => o.includes('Beachvolleyball Frauen'));
      currentClub.hasBeachMen = offerings.some(o => o.includes('Beachvolleyball Männer'));
      currentClub.hasBeachYouthWomen = offerings.some(o => o.includes('Beachvolleyball Juniorinnen'));
      currentClub.hasBeachYouthMen = offerings.some(o => o.includes('Beachvolleyball Junioren'));
      currentClub.hasOtherAdult = offerings.some(o => o.includes('Weitere Angebote Erwachsene'));
      currentClub.hasOtherYouth = offerings.some(o => o.includes('Weitere Angebote Nachwuchs'));
      
      clubs.push(currentClub as ClubData);
    }
    
    return clubs;
  };

  // Try a different approach - use structured selectors
  const extractClubsStructured = async (): Promise<ClubData[]> => {
    const clubs: ClubData[] = [];
    
    // Try to find club cards/entries
    // The page seems to have a list structure, let's try to find individual club entries
    
    // Get all text content in sections
    const pageContent = await page.evaluate(() => {
      const clubs: any[] = [];
      
      // Try to find elements that contain club information
      // Look for elements with club-like patterns
      const allElements = document.querySelectorAll('div, section, article');
      
      allElements.forEach(el => {
        const text = el.textContent || '';
        // Check if this element contains a club entry (has "Angebot" and offerings)
        if (text.includes('Angebot') && 
            (text.includes('Volleyball Frauen') || text.includes('Volleyball Männer'))) {
          // Try to extract structured data
          const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
          // Store for processing
        }
      });
      
      // Alternative: get all anchor tags that might be club links
      const links = document.querySelectorAll('a[href*="vereinswebseite"], a[href*="club"], a[target="_blank"]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        const parent = link.closest('div');
        if (parent) {
          clubs.push({
            website: href,
            parentText: parent.textContent?.substring(0, 500)
          });
        }
      });
      
      return clubs;
    });
    
    console.log(`Found ${pageContent.length} potential club sections`);
    
    return clubs;
  };

  // Scrape page by page
  let pageNum = 1;
  let hasMorePages = true;
  
  while (hasMorePages) {
    console.log(`\n📄 Scraping page ${pageNum}...`);
    
    // Extract clubs from current page
    const pageClubs = await extractClubsFromPage();
    console.log(`   Found ${pageClubs.length} clubs on this page`);
    
    for (const club of pageClubs) {
      // Check if club already exists (avoid duplicates)
      if (!allClubs.find(c => c.name === club.name)) {
        allClubs.push(club);
      }
    }
    
    // Try to go to next page
    try {
      // Look for pagination - find next page number
      const nextPageButton = page.locator(`a:has-text("${pageNum + 1}")`).first();
      
      if (await nextPageButton.count() > 0) {
        console.log(`   Navigating to page ${pageNum + 1}...`);
        await nextPageButton.click();
        await delay(2000);
        await page.waitForLoadState('networkidle');
        pageNum++;
      } else {
        // Try clicking a "next" arrow or button
        const nextArrow = page.locator('button:has-text("»"), a:has-text("»"), .pagination-next').first();
        if (await nextArrow.count() > 0) {
          await nextArrow.click();
          await delay(2000);
          await page.waitForLoadState('networkidle');
          pageNum++;
        } else {
          hasMorePages = false;
        }
      }
    } catch (error) {
      console.log(`   No more pages or error: ${error}`);
      hasMorePages = false;
    }
    
    // Safety limit - need more pages to get all 299 clubs
    if (pageNum > 35) {
      console.log('   Reached page limit (35)');
      hasMorePages = false;
    }
  }

  // Save screenshot for debugging
  await page.screenshot({ path: path.join(__dirname, '..', 'data', 'verein-suchen-final.png'), fullPage: true });
  
  // Save raw text for debugging
  const finalText = await page.locator('body').innerText();
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'verein-suchen-scraped.txt'), finalText, 'utf-8');

  await browser.close();

  // ============================================================
  // RESULTS
  // ============================================================
  console.log('\n\n' + '═'.repeat(70));
  console.log('RESULTS SUMMARY');
  console.log('═'.repeat(70));
  
  console.log(`\n📊 Statistics:`);
  console.log(`   Total clubs scraped: ${allClubs.length}`);
  console.log(`   Clubs with Women Senior: ${allClubs.filter(c => c.hasWomenSenior).length}`);
  console.log(`   Clubs with Men Senior: ${allClubs.filter(c => c.hasMenSenior).length}`);
  console.log(`   Clubs with Women Youth: ${allClubs.filter(c => c.hasWomenYouth).length}`);
  console.log(`   Clubs with Men Youth: ${allClubs.filter(c => c.hasMenYouth).length}`);
  console.log(`   Clubs with Kids Volley: ${allClubs.filter(c => c.hasKidsVolley).length}`);
  
  // Show sample clubs
  console.log(`\n📋 Sample clubs (first 10):`);
  for (const club of allClubs.slice(0, 10)) {
    const offerings: string[] = [];
    if (club.hasWomenSenior) offerings.push('W-Senior');
    if (club.hasMenSenior) offerings.push('M-Senior');
    if (club.hasWomenYouth) offerings.push('W-Youth');
    if (club.hasMenYouth) offerings.push('M-Youth');
    console.log(`   ${club.name}: ${offerings.join(', ') || 'No offerings'}`);
  }
  
  // Check specific clubs
  console.log(`\n🔍 Checking specific clubs:`);
  const checkClubs = ['Volley Luzern', 'VTV Horw', 'BTV Aarau', 'Chênois', 'Amriswil'];
  for (const name of checkClubs) {
    const found = allClubs.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      console.log(`   ✅ ${found.name}: W=${found.hasWomenSenior}, M=${found.hasMenSenior}`);
    } else {
      console.log(`   ❌ ${name}: NOT FOUND`);
    }
  }
  
  // Save results
  const outputDir = path.join(__dirname, '..', 'data');
  
  const output = {
    scrapedAt: new Date().toISOString(),
    source: 'https://www.volleyball.ch/de/verband/services/verein-suchen',
    totalClubs: allClubs.length,
    statistics: {
      womenSenior: allClubs.filter(c => c.hasWomenSenior).length,
      menSenior: allClubs.filter(c => c.hasMenSenior).length,
      womenYouth: allClubs.filter(c => c.hasWomenYouth).length,
      menYouth: allClubs.filter(c => c.hasMenYouth).length,
      kidsVolley: allClubs.filter(c => c.hasKidsVolley).length,
    },
    clubs: allClubs.sort((a, b) => a.name.localeCompare(b.name))
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'swiss-volley-clubs-verein-suchen.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );
  
  console.log(`\n💾 Saved to:`);
  console.log(`   data/swiss-volley-clubs-verein-suchen.json (${allClubs.length} clubs)`);
  
  console.log('\n' + '═'.repeat(70));
  console.log('DONE');
  console.log('═'.repeat(70));
}

main().catch(console.error);
