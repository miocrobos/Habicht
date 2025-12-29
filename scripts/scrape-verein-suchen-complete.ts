/**
 * Complete Verein Suchen Scraper
 * Scrapes ALL clubs from https://www.volleyball.ch/de/verband/services/verein-suchen
 * With proper pagination support
 * 
 * Note from Swiss Volley website:
 * - "Die Vereine steuern diese Angaben, indem sie wählen, ob sie in der Vereinssuche erscheinen wollen"
 *   (Clubs control whether they appear in the search)
 * - Some clubs may be temporarily hidden due to season changeover
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

interface ClubData {
  name: string;
  postalCode?: string;
  city?: string;
  email?: string;
  website?: string;
  offerings: {
    womenSenior: boolean;  // Volleyball Frauen (NLA – 5L)
    menSenior: boolean;    // Volleyball Männer (NLA – 5L)
    womenYouth: boolean;   // Volleyball Juniorinnen (U23 – U13)
    menYouth: boolean;     // Volleyball Junioren (U23 – U13)
    kidsVolley: boolean;   // Kids Volley
    beachWomen: boolean;   // Beachvolleyball Frauen
    beachMen: boolean;     // Beachvolleyball Männer
    beachYouthWomen: boolean;  // Beachvolleyball Juniorinnen
    beachYouthMen: boolean;    // Beachvolleyball Junioren
    otherAdult: boolean;       // Weitere Angebote Erwachsene
    otherYouth: boolean;       // Weitere Angebote Nachwuchs
  };
  rawOfferings: string[];
}

async function scrapeVereinSuchen(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Swiss Volley - Complete Club Scraper');
  console.log('URL: https://www.volleyball.ch/de/verband/services/verein-suchen');
  console.log('='.repeat(60));
  
  const browser: Browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const page: Page = await browser.newPage();
  
  try {
    // Navigate to the page
    console.log('\n📍 Navigating to Verein suchen...');
    await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for clubs to load
    await page.waitForTimeout(3000);
    
    // Get total number of clubs
    const totalText = await page.textContent('body');
    const totalMatch = totalText?.match(/(\d+)\s*Vereine gefunden/);
    const expectedTotal = totalMatch ? parseInt(totalMatch[1]) : 0;
    console.log(`\n📊 Expected clubs: ${expectedTotal}`);
    
    // Collect all clubs across all pages
    const allClubs: ClubData[] = [];
    let currentPage = 1;
    let hasNextPage = true;
    
    while (hasNextPage) {
      console.log(`\n📖 Scraping page ${currentPage}...`);
      
      // Wait for content to load
      await page.waitForTimeout(1500);
      
      // Find all club cards on this page
      const clubElements = await page.$$('div.row.border-bottom');
      console.log(`   Found ${clubElements.length} club elements on this page`);
      
      // If no club elements found, try alternative selectors
      if (clubElements.length === 0) {
        // Try to find clubs by looking for characteristic patterns
        const pageText = await page.textContent('body');
        const clubMatches = pageText?.match(/([A-ZÀ-Ü][^\n]+)\n\n(?:\d{4}\s+[A-ZÀ-Ü][^\n]+\n\n)?(?:Kontakt:)?/g);
        console.log(`   Alternative: Found ${clubMatches?.length || 0} potential clubs via text parsing`);
      }
      
      // Parse each club card
      for (const element of clubElements) {
        try {
          const text = await element.textContent();
          if (!text) continue;
          
          // Extract club name (first line, bold/heading text)
          const nameEl = await element.$('b, strong, h3, h4, .font-weight-bold');
          let name = nameEl ? await nameEl.textContent() : null;
          
          if (!name) {
            // Try to get name from first non-empty line
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            name = lines[0];
          }
          
          if (!name) continue;
          
          // Parse postal code and city
          const locationMatch = text.match(/(\d{4})\s+([A-ZÀ-Ü][^\n]+)/);
          const postalCode = locationMatch?.[1];
          const city = locationMatch?.[2];
          
          // Parse email
          const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
          const email = emailMatch?.[0];
          
          // Parse website
          const websiteEl = await element.$('a[href*="http"]:not([href*="mailto"])');
          const website = websiteEl ? await websiteEl.getAttribute('href') : undefined;
          
          // Parse offerings
          const offerings = {
            womenSenior: text.includes('Volleyball Frauen'),
            menSenior: text.includes('Volleyball Männer'),
            womenYouth: text.includes('Volleyball Juniorinnen'),
            menYouth: text.includes('Volleyball Junioren'),
            kidsVolley: text.includes('Kids Volley'),
            beachWomen: text.includes('Beachvolleyball Frauen'),
            beachMen: text.includes('Beachvolleyball Männer'),
            beachYouthWomen: text.includes('Beachvolleyball Juniorinnen'),
            beachYouthMen: text.includes('Beachvolleyball Junioren'),
            otherAdult: text.includes('Weitere Angebote Erwachsene'),
            otherYouth: text.includes('Weitere Angebote Nachwuchs'),
          };
          
          // Extract raw offering strings
          const rawOfferings: string[] = [];
          if (offerings.womenSenior) rawOfferings.push('Volleyball Frauen (NLA – 5L)');
          if (offerings.menSenior) rawOfferings.push('Volleyball Männer (NLA – 5L)');
          if (offerings.womenYouth) rawOfferings.push('Volleyball Juniorinnen (U23 – U13)');
          if (offerings.menYouth) rawOfferings.push('Volleyball Junioren (U23 – U13)');
          if (offerings.kidsVolley) rawOfferings.push('Kids Volley');
          if (offerings.beachWomen) rawOfferings.push('Beachvolleyball Frauen');
          if (offerings.beachMen) rawOfferings.push('Beachvolleyball Männer');
          if (offerings.beachYouthWomen) rawOfferings.push('Beachvolleyball Juniorinnen');
          if (offerings.beachYouthMen) rawOfferings.push('Beachvolleyball Junioren');
          if (offerings.otherAdult) rawOfferings.push('Weitere Angebote Erwachsene');
          if (offerings.otherYouth) rawOfferings.push('Weitere Angebote Nachwuchs');
          
          // Avoid duplicates
          if (!allClubs.some(c => c.name === name)) {
            allClubs.push({
              name: name.trim(),
              postalCode,
              city: city?.trim(),
              email,
              website: website || undefined,
              offerings,
              rawOfferings
            });
          }
        } catch (err) {
          // Skip malformed entries
        }
      }
      
      console.log(`   Total clubs collected so far: ${allClubs.length}`);
      
      // Try to go to next page
      const nextPageNum = currentPage + 1;
      const nextPageButton = await page.$(`button:has-text("${nextPageNum}"), a:has-text("${nextPageNum}")`);
      
      if (nextPageButton && await nextPageButton.isVisible()) {
        await nextPageButton.click();
        await page.waitForTimeout(2000);
        currentPage++;
        
        // Safety limit
        if (currentPage > 50) {
          console.log('\n⚠️ Reached page limit (50), stopping');
          hasNextPage = false;
        }
      } else {
        // Try clicking "next" button if numbered page doesn't exist
        const nextBtn = await page.$('button:has-text("Next"), button:has-text("»"), a:has-text("»")');
        if (nextBtn && await nextBtn.isVisible()) {
          await nextBtn.click();
          await page.waitForTimeout(2000);
          currentPage++;
        } else {
          hasNextPage = false;
        }
      }
    }
    
    // If we didn't get clubs from structured elements, try text parsing
    if (allClubs.length < 50) {
      console.log('\n📝 Trying alternative text-based parsing...');
      await parseAllPagesViaText(page, allClubs);
    }
    
    // Statistics
    const stats = {
      total: allClubs.length,
      womenSenior: allClubs.filter(c => c.offerings.womenSenior).length,
      menSenior: allClubs.filter(c => c.offerings.menSenior).length,
      womenYouth: allClubs.filter(c => c.offerings.womenYouth).length,
      menYouth: allClubs.filter(c => c.offerings.menYouth).length,
      kidsVolley: allClubs.filter(c => c.offerings.kidsVolley).length,
      beach: allClubs.filter(c => c.offerings.beachWomen || c.offerings.beachMen).length,
    };
    
    console.log('\n' + '='.repeat(60));
    console.log('RESULTS');
    console.log('='.repeat(60));
    console.log(`Total clubs scraped: ${stats.total}`);
    console.log(`Women Senior (NLA-5L): ${stats.womenSenior}`);
    console.log(`Men Senior (NLA-5L): ${stats.menSenior}`);
    console.log(`Women Youth (U23-U13): ${stats.womenYouth}`);
    console.log(`Men Youth (U23-U13): ${stats.menYouth}`);
    console.log(`Kids Volley: ${stats.kidsVolley}`);
    console.log(`Beach: ${stats.beach}`);
    
    // Save results
    const output = {
      scrapedAt: new Date().toISOString(),
      source: 'https://www.volleyball.ch/de/verband/services/verein-suchen',
      expectedTotal: expectedTotal,
      actualTotal: allClubs.length,
      statistics: stats,
      note: 'League levels shown as ranges (NLA-5L, U23-U13). Clubs control visibility.',
      clubs: allClubs.sort((a, b) => a.name.localeCompare(b.name))
    };
    
    const outputPath = 'data/verein-suchen-clubs.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✅ Data saved to: ${outputPath}`);
    
    // Check for VTV Horw
    const horwClub = allClubs.find(c => c.name.toLowerCase().includes('horw') || c.name.includes('VTV'));
    if (horwClub) {
      console.log(`\n✅ VTV Horw found: ${horwClub.name}`);
    } else {
      console.log('\n❌ VTV Horw NOT found in the scraped data');
      console.log('   This club may have opted out of the search or be affected by season changeover');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

async function parseAllPagesViaText(page: Page, allClubs: ClubData[]): Promise<void> {
  // Navigate back to page 1
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', {
    waitUntil: 'networkidle'
  });
  await page.waitForTimeout(2000);
  
  let pageNum = 1;
  let hasMore = true;
  
  while (hasMore && pageNum <= 50) {
    console.log(`   Parsing page ${pageNum} via text...`);
    
    // Get page HTML
    const html = await page.content();
    
    // Parse clubs from HTML structure
    // Looking for patterns like club cards
    const clubCardRegex = /<div[^>]*class="[^"]*row[^"]*border[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
    
    // Also try to extract from visible text
    const bodyText = await page.textContent('body') || '';
    
    // Find club names - they're typically the first text in each card
    // Pattern: Club name followed by location (postal code + city)
    const clubPattern = /([A-ZÀ-Ü][\wÀ-ü\s\-\.#'()]+?)\n+(?:(\d{4})\s+([A-ZÀ-ü][^\n]+))?\n*(?:Kontakt:\s*)?([\w.-]+@[\w.-]+\.\w+)?/g;
    
    let match;
    while ((match = clubPattern.exec(bodyText)) !== null) {
      const name = match[1]?.trim();
      if (!name || name.length < 3) continue;
      
      // Skip known non-club entries
      if (name.includes('Vereine gefunden') || 
          name.includes('Premium Partner') ||
          name.includes('Leading Partner') ||
          name.includes('Official Partner') ||
          name.includes('Page ') ||
          name.includes('Angebot wählen') ||
          name.includes('Swiss Volley')) continue;
      
      if (!allClubs.some(c => c.name === name)) {
        // Check for offerings in nearby text
        const startIndex = match.index;
        const contextText = bodyText.substring(startIndex, startIndex + 500);
        
        const offerings = {
          womenSenior: contextText.includes('Volleyball Frauen'),
          menSenior: contextText.includes('Volleyball Männer'),
          womenYouth: contextText.includes('Volleyball Juniorinnen'),
          menYouth: contextText.includes('Volleyball Junioren'),
          kidsVolley: contextText.includes('Kids Volley'),
          beachWomen: contextText.includes('Beachvolleyball Frauen'),
          beachMen: contextText.includes('Beachvolleyball Männer'),
          beachYouthWomen: contextText.includes('Beachvolleyball Juniorinnen'),
          beachYouthMen: contextText.includes('Beachvolleyball Junioren'),
          otherAdult: contextText.includes('Weitere Angebote Erwachsene'),
          otherYouth: contextText.includes('Weitere Angebote Nachwuchs'),
        };
        
        // Build raw offerings array
        const rawOfferings: string[] = [];
        if (offerings.womenSenior) rawOfferings.push('Volleyball Frauen (NLA – 5L)');
        if (offerings.menSenior) rawOfferings.push('Volleyball Männer (NLA – 5L)');
        if (offerings.womenYouth) rawOfferings.push('Volleyball Juniorinnen (U23 – U13)');
        if (offerings.menYouth) rawOfferings.push('Volleyball Junioren (U23 – U13)');
        if (offerings.kidsVolley) rawOfferings.push('Kids Volley');
        if (offerings.beachWomen) rawOfferings.push('Beachvolleyball Frauen');
        if (offerings.beachMen) rawOfferings.push('Beachvolleyball Männer');
        
        allClubs.push({
          name,
          postalCode: match[2],
          city: match[3]?.trim(),
          email: match[4],
          offerings,
          rawOfferings
        });
      }
    }
    
    // Try to go to next page
    const nextPageButton = await page.$(`text="${pageNum + 1}"`);
    if (nextPageButton && await nextPageButton.isVisible()) {
      await nextPageButton.click();
      await page.waitForTimeout(2000);
      pageNum++;
    } else {
      hasMore = false;
    }
  }
}

// Run the scraper
scrapeVereinSuchen().catch(console.error);
