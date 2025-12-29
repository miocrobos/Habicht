/**
 * Swiss Volleyball Complete League Scraper v3
 * Uses the Verein Suchen page with proper selectors discovered from debugging
 * 
 * Key discoveries:
 * - Clubs are in .ais-Hits-item elements (Algolia search hits)
 * - Angebote dropdown contains specific league counts (NLA, NLB, 1L, 2L, etc.)
 * - Pagination uses <a> tags with page numbers
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

interface ClubData {
  name: string;
  postalCode?: string;
  city?: string;
  email?: string;
  website?: string;
  offerings: string[];
}

interface LeagueCount {
  league: string;
  gender: 'women' | 'men' | 'juniorinnen' | 'junioren';
  category: 'senior' | 'youth' | 'beach' | 'kids' | 'other';
  count: number;
}

async function scrapeVereinSuchen(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Swiss Volleyball Complete Scraper v3');
  console.log('URL: https://www.volleyball.ch/de/verband/services/verein-suchen');
  console.log('='.repeat(70));
  
  const browser: Browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  
  const page: Page = await browser.newPage();
  
  try {
    // Navigate to the page
    console.log('\n📍 Navigating to Verein suchen...');
    await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for dynamic content
    await page.waitForTimeout(3000);
    
    // Step 1: Extract league statistics from the dropdown
    console.log('\n📊 Extracting league statistics from Angebote dropdown...');
    
    // Click on "Angebot" to expand the dropdown
    const angebotButton = await page.$('button:has-text("Angebot"), div:has-text("Angebot wählen")');
    if (angebotButton) {
      try {
        await angebotButton.click();
        await page.waitForTimeout(1000);
      } catch (e) {
        console.log('   Could not click Angebot button, dropdown may be visible');
      }
    }
    
    // Extract league counts from the dropdown
    const leagueCounts = await page.evaluate(() => {
      const results: { category: string; league: string; count: number }[] = [];
      
      // Find all refinement items
      const items = document.querySelectorAll('.ais-RefinementList-item, .refinement-item-checkbox');
      items.forEach(item => {
        const label = item.textContent?.trim() || '';
        // Parse patterns like "NLA9" or "1L37"
        const match = label.match(/^([^\d]+)(\d+)$/);
        if (match) {
          results.push({
            category: '', // Will be set based on parent
            league: match[1].trim(),
            count: parseInt(match[2])
          });
        }
      });
      
      // Also try to get the full text from dropdown
      const dropdownText = document.querySelector('.refinement-dropdown')?.textContent || '';
      
      return { items: results, rawText: dropdownText };
    });
    
    console.log('\n   League breakdown from dropdown:');
    console.log(leagueCounts.rawText?.substring(0, 500));
    
    // Parse the league statistics from the raw text
    const parseLeagueStats = (text: string): LeagueCount[] => {
      const leagues: LeagueCount[] = [];
      
      // Women Senior leagues
      const womenMatch = text.match(/Volleyball Frauen \(NLA – 5L\)([\w\d\s]+?)Volleyball Männer/s);
      if (womenMatch) {
        const womenSection = womenMatch[1];
        const leagueMatches = womenSection.matchAll(/([A-Za-z0-9]+?)(\d+)/g);
        for (const m of leagueMatches) {
          leagues.push({
            league: m[1],
            gender: 'women',
            category: 'senior',
            count: parseInt(m[2])
          });
        }
      }
      
      // Men Senior leagues
      const menMatch = text.match(/Volleyball Männer \(NLA – 5L\)([\w\d\s]+?)Volleyball Juniorinnen/s);
      if (menMatch) {
        const menSection = menMatch[1];
        const leagueMatches = menSection.matchAll(/([A-Za-z0-9]+?)(\d+)/g);
        for (const m of leagueMatches) {
          leagues.push({
            league: m[1],
            gender: 'men',
            category: 'senior',
            count: parseInt(m[2])
          });
        }
      }
      
      // Women Youth leagues
      const womenYouthMatch = text.match(/Volleyball Juniorinnen \(U23 – U13\)([\w\d\s]+?)Volleyball Junioren/s);
      if (womenYouthMatch) {
        const section = womenYouthMatch[1];
        const leagueMatches = section.matchAll(/([A-Za-z0-9]+?)(\d+)/g);
        for (const m of leagueMatches) {
          leagues.push({
            league: m[1],
            gender: 'juniorinnen',
            category: 'youth',
            count: parseInt(m[2])
          });
        }
      }
      
      // Men Youth leagues
      const menYouthMatch = text.match(/Volleyball Junioren \(U23 – U13\)([\w\d\s]+?)Kids Volley/s);
      if (menYouthMatch) {
        const section = menYouthMatch[1];
        const leagueMatches = section.matchAll(/([A-Za-z0-9]+?)(\d+)/g);
        for (const m of leagueMatches) {
          leagues.push({
            league: m[1],
            gender: 'junioren',
            category: 'youth',
            count: parseInt(m[2])
          });
        }
      }
      
      return leagues;
    };
    
    const leagueStats = parseLeagueStats(leagueCounts.rawText || '');
    
    console.log('\n📈 Parsed League Statistics:');
    console.log('\n   Women Senior:');
    leagueStats.filter(l => l.gender === 'women' && l.category === 'senior')
      .forEach(l => console.log(`      ${l.league}: ${l.count} clubs`));
    
    console.log('\n   Men Senior:');
    leagueStats.filter(l => l.gender === 'men' && l.category === 'senior')
      .forEach(l => console.log(`      ${l.league}: ${l.count} clubs`));
    
    console.log('\n   Women Youth:');
    leagueStats.filter(l => l.gender === 'juniorinnen')
      .forEach(l => console.log(`      ${l.league}: ${l.count} clubs`));
    
    console.log('\n   Men Youth:');
    leagueStats.filter(l => l.gender === 'junioren')
      .forEach(l => console.log(`      ${l.league}: ${l.count} clubs`));
    
    // Step 2: Scrape all clubs with their offerings
    console.log('\n\n📥 Scraping all clubs...');
    
    // Get total count
    const totalText = await page.textContent('body');
    const totalMatch = totalText?.match(/(\d+)\s*Vereine gefunden/);
    const expectedTotal = totalMatch ? parseInt(totalMatch[1]) : 0;
    console.log(`   Expected total: ${expectedTotal} clubs`);
    
    const allClubs: ClubData[] = [];
    let currentPage = 1;
    const maxPages = Math.ceil(expectedTotal / 50) + 1; // Estimate pages
    
    while (currentPage <= maxPages) {
      console.log(`\n   Page ${currentPage}:`);
      
      // Wait for hits to load
      await page.waitForTimeout(1500);
      
      // Get all club items on this page
      const clubsOnPage = await page.$$('.ais-Hits-item');
      console.log(`      Found ${clubsOnPage.length} club items`);
      
      for (const clubEl of clubsOnPage) {
        try {
          const clubData = await clubEl.evaluate((el) => {
            const text = el.textContent || '';
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            
            // First significant line is usually the club name
            let name = '';
            for (const line of lines) {
              if (line.length > 3 && 
                  !line.includes('Angebot') && 
                  !line.includes('Kontakt') &&
                  !line.includes('Volleyball') &&
                  !line.includes('Kids') &&
                  !line.includes('Beach') &&
                  !line.includes('Weitere')) {
                name = line;
                break;
              }
            }
            
            // Location (postal code + city)
            const locationMatch = text.match(/(\d{4})\s+([A-ZÀ-Ü][a-zà-ü\-]+)/);
            
            // Email
            const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
            
            // Website
            const websiteEl = el.querySelector('a[href*="http"]:not([href*="mailto"])');
            const website = websiteEl?.getAttribute('href') || undefined;
            
            // Offerings - collect all volleyball-related text
            const offerings: string[] = [];
            if (text.includes('Volleyball Frauen')) offerings.push('Volleyball Frauen (NLA – 5L)');
            if (text.includes('Volleyball Männer')) offerings.push('Volleyball Männer (NLA – 5L)');
            if (text.includes('Volleyball Juniorinnen')) offerings.push('Volleyball Juniorinnen (U23 – U13)');
            if (text.includes('Volleyball Junioren')) offerings.push('Volleyball Junioren (U23 – U13)');
            if (text.includes('Kids Volley')) offerings.push('Kids Volley');
            if (text.includes('Beachvolleyball Frauen')) offerings.push('Beachvolleyball Frauen');
            if (text.includes('Beachvolleyball Männer')) offerings.push('Beachvolleyball Männer');
            if (text.includes('Beachvolleyball Juniorinnen')) offerings.push('Beachvolleyball Juniorinnen');
            if (text.includes('Beachvolleyball Junioren')) offerings.push('Beachvolleyball Junioren');
            if (text.includes('Weitere Angebote Erwachsene')) offerings.push('Weitere Angebote Erwachsene');
            if (text.includes('Weitere Angebote Nachwuchs')) offerings.push('Weitere Angebote Nachwuchs');
            
            return {
              name,
              postalCode: locationMatch?.[1],
              city: locationMatch?.[2],
              email: emailMatch?.[0],
              website,
              offerings
            };
          });
          
          if (clubData.name && !allClubs.some(c => c.name === clubData.name)) {
            allClubs.push(clubData);
          }
        } catch (err) {
          // Skip problematic elements
        }
      }
      
      console.log(`      Total collected: ${allClubs.length} clubs`);
      
      // Check if we've reached the expected total
      if (allClubs.length >= expectedTotal - 5) {
        console.log('\n   ✓ Reached expected club count');
        break;
      }
      
      // Go to next page
      const nextPageLink = await page.$(`a:has-text("${currentPage + 1}")`);
      if (nextPageLink) {
        try {
          await nextPageLink.click();
          await page.waitForTimeout(2000);
          currentPage++;
        } catch (e) {
          console.log('   Could not navigate to next page');
          break;
        }
      } else {
        console.log('   No more pages');
        break;
      }
    }
    
    // Step 3: Generate summary
    const stats = {
      total: allClubs.length,
      womenSenior: allClubs.filter(c => c.offerings.some(o => o.includes('Volleyball Frauen'))).length,
      menSenior: allClubs.filter(c => c.offerings.some(o => o.includes('Volleyball Männer'))).length,
      womenYouth: allClubs.filter(c => c.offerings.some(o => o.includes('Juniorinnen'))).length,
      menYouth: allClubs.filter(c => c.offerings.some(o => o.includes('Junioren'))).length,
      kidsVolley: allClubs.filter(c => c.offerings.some(o => o.includes('Kids'))).length,
      beach: allClubs.filter(c => c.offerings.some(o => o.includes('Beach'))).length,
    };
    
    console.log('\n' + '='.repeat(70));
    console.log('FINAL RESULTS');
    console.log('='.repeat(70));
    console.log(`\nTotal clubs scraped: ${stats.total} (expected: ${expectedTotal})`);
    console.log(`\nBy category:`);
    console.log(`   Women Senior (NLA-5L): ${stats.womenSenior} clubs`);
    console.log(`   Men Senior (NLA-5L): ${stats.menSenior} clubs`);
    console.log(`   Women Youth (U23-U13): ${stats.womenYouth} clubs`);
    console.log(`   Men Youth (U23-U13): ${stats.menYouth} clubs`);
    console.log(`   Kids Volley: ${stats.kidsVolley} clubs`);
    console.log(`   Beach: ${stats.beach} clubs`);
    
    // Save full results
    const output = {
      scrapedAt: new Date().toISOString(),
      source: 'https://www.volleyball.ch/de/verband/services/verein-suchen',
      expectedTotal,
      actualTotal: allClubs.length,
      leagueStatistics: leagueStats,
      clubStatistics: stats,
      notes: [
        'League levels shown as ranges (NLA-5L, U23-U13) per club',
        'Specific league breakdown available in leagueStatistics (count of clubs per league)',
        'Clubs control visibility - some may opt out of search',
        'Data may be incomplete during season changeover'
      ],
      clubs: allClubs.sort((a, b) => a.name.localeCompare(b.name))
    };
    
    const outputPath = 'data/swiss-volley-clubs-v3.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✅ Data saved to: ${outputPath}`);
    
    // Check for VTV Horw
    const horwClub = allClubs.find(c => 
      c.name.toLowerCase().includes('horw') || 
      c.name.includes('VTV') ||
      c.city?.toLowerCase().includes('horw')
    );
    if (horwClub) {
      console.log(`\n✅ VTV Horw found: ${horwClub.name} (${horwClub.city})`);
    } else {
      console.log('\n❌ VTV Horw NOT found in scraped data');
      console.log('   This club likely opted out of the search or is affected by season changeover');
    }
    
    // Show sample clubs
    console.log('\n📋 Sample clubs:');
    allClubs.slice(0, 10).forEach(c => {
      console.log(`   ${c.name} (${c.city || 'unknown'}) - ${c.offerings.length} offerings`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

// Run
scrapeVereinSuchen().catch(console.error);
