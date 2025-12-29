/**
 * SWISS VOLLEY CLUB SCRAPER v2 - From Verein Suchen
 * 
 * Scrapes ALL clubs from https://www.volleyball.ch/de/verband/services/verein-suchen
 * Uses DOM-based extraction for more reliable parsing
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
  hasWomenSenior: boolean;
  hasMenSenior: boolean;
  hasWomenYouth: boolean;
  hasMenYouth: boolean;
  hasKidsVolley: boolean;
  hasBeachWomen: boolean;
  hasBeachMen: boolean;
  rawOfferings: string[];
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(70));
  console.log('SWISS VOLLEY CLUB SCRAPER v2');
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

  // Function to parse clubs from page text with improved logic
  const parseClubsFromText = (text: string): ClubData[] => {
    const clubs: ClubData[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    
    // Skip header content - find where club listings start
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === 'Karte' && lines[i-1] === 'Details') {
        startIndex = i + 1;
        break;
      }
    }
    
    // Process clubs - they follow a pattern:
    // Club Name
    // [Postal Code + City] (optional)
    // [Kontakt: email] (optional)
    // Angebot
    // [List of offerings]
    // [Vereinswebseite] (optional)
    
    let i = startIndex;
    while (i < lines.length) {
      const line = lines[i];
      
      // Skip pagination numbers at the end
      if (line.match(/^[\d\s]+$/) && line.length < 20) {
        i++;
        continue;
      }
      
      // Check if this looks like a club name
      // Club names: Don't start with "Volleyball", "Beachvolleyball", "Kids", "Weitere", "Angebot", numbers, etc.
      const isClubName = !line.startsWith('Volleyball ') && 
                         !line.startsWith('Beachvolleyball ') && 
                         !line.startsWith('Kids Volley') &&
                         !line.startsWith('Weitere Angebote') &&
                         !line.startsWith('Kontakt:') &&
                         line !== 'Angebot' &&
                         line !== 'Vereinswebseite' &&
                         !line.match(/^\d{4}\s+/) && // Not postal code line
                         !line.match(/^\d+$/) && // Not a number
                         line.length > 2 &&
                         line.length < 80;
      
      if (isClubName) {
        const club: ClubData = {
          name: line,
          hasWomenSenior: false,
          hasMenSenior: false,
          hasWomenYouth: false,
          hasMenYouth: false,
          hasKidsVolley: false,
          hasBeachWomen: false,
          hasBeachMen: false,
          rawOfferings: []
        };
        
        i++;
        
        // Look for postal code + city
        if (i < lines.length && lines[i].match(/^\d{4}\s+/)) {
          const postalMatch = lines[i].match(/^(\d{4})\s+(.+)$/);
          if (postalMatch) {
            club.postalCode = postalMatch[1];
            club.city = postalMatch[2];
          }
          i++;
        }
        
        // Look for contact email
        if (i < lines.length && lines[i].startsWith('Kontakt:')) {
          club.email = lines[i].replace('Kontakt:', '').trim();
          i++;
        }
        
        // Look for "Angebot" header
        if (i < lines.length && lines[i] === 'Angebot') {
          i++;
          
          // Collect offerings until we hit next club or end
          while (i < lines.length) {
            const offeringLine = lines[i];
            
            // Check if this is an offering
            if (offeringLine.startsWith('Volleyball Frauen')) {
              club.hasWomenSenior = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Volleyball Männer')) {
              club.hasMenSenior = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Volleyball Juniorinnen')) {
              club.hasWomenYouth = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Volleyball Junioren')) {
              club.hasMenYouth = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Kids Volley')) {
              club.hasKidsVolley = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Beachvolleyball Frauen')) {
              club.hasBeachWomen = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Beachvolleyball Männer')) {
              club.hasBeachMen = true;
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine.startsWith('Beachvolleyball Juniorinnen') ||
                       offeringLine.startsWith('Beachvolleyball Junioren') ||
                       offeringLine.startsWith('Weitere Angebote')) {
              club.rawOfferings.push(offeringLine);
            } else if (offeringLine === 'Vereinswebseite') {
              // End of this club's offerings
              i++;
              break;
            } else {
              // Not a recognized offering - might be next club
              break;
            }
            i++;
          }
        }
        
        // Only add if we found some offerings (indicates a valid club entry)
        if (club.rawOfferings.length > 0 || club.email || club.postalCode) {
          clubs.push(club);
        }
        
        continue;
      }
      
      i++;
    }
    
    return clubs;
  };

  // Scrape page by page
  let pageNum = 1;
  let hasMorePages = true;
  
  while (hasMorePages) {
    console.log(`\n📄 Scraping page ${pageNum}...`);
    
    // Get page text and parse
    const bodyText = await page.locator('body').innerText();
    const pageClubs = parseClubsFromText(bodyText);
    console.log(`   Found ${pageClubs.length} clubs on this page`);
    
    // Add new clubs (avoid duplicates)
    for (const club of pageClubs) {
      if (!allClubs.find(c => c.name === club.name)) {
        allClubs.push(club);
      }
    }
    
    // Show some club names for debugging
    if (pageClubs.length > 0) {
      console.log(`   Sample: ${pageClubs.slice(0, 3).map(c => c.name).join(', ')}`);
    }
    
    // Try to go to next page
    try {
      const nextPageButton = page.locator(`a:has-text("${pageNum + 1}")`).first();
      
      if (await nextPageButton.count() > 0) {
        await nextPageButton.click();
        await delay(2000);
        await page.waitForLoadState('networkidle');
        pageNum++;
      } else {
        hasMorePages = false;
      }
    } catch (error) {
      console.log(`   Error navigating: ${error}`);
      hasMorePages = false;
    }
    
    // Safety limit - 299 clubs / ~8 per page = ~38 pages
    if (pageNum > 45) {
      console.log('   Reached page limit');
      hasMorePages = false;
    }
  }

  // Save screenshot for debugging
  await page.screenshot({ path: path.join(__dirname, '..', 'data', 'verein-suchen-final.png'), fullPage: true });

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
  console.log(`\n📋 Sample clubs (first 15):`);
  for (const club of allClubs.slice(0, 15)) {
    const offerings: string[] = [];
    if (club.hasWomenSenior) offerings.push('W-Senior');
    if (club.hasMenSenior) offerings.push('M-Senior');
    if (club.hasWomenYouth) offerings.push('W-Youth');
    if (club.hasMenYouth) offerings.push('M-Youth');
    console.log(`   ${club.name} ${club.city ? `(${club.city})` : ''}: ${offerings.join(', ') || 'other'}`);
  }
  
  // Check specific clubs
  console.log(`\n🔍 Checking specific clubs:`);
  const checkClubs = ['Volley Luzern', 'VTV Horw', 'BTV Aarau', 'Chênois', 'Amriswil', 'Volley Düdingen', 'NUC'];
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
    path.join(outputDir, 'swiss-volley-clubs-complete.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  );
  
  console.log(`\n💾 Saved to:`);
  console.log(`   data/swiss-volley-clubs-complete.json (${allClubs.length} clubs)`);
  
  console.log('\n' + '═'.repeat(70));
  console.log('DONE');
  console.log('═'.repeat(70));
}

main().catch(console.error);
