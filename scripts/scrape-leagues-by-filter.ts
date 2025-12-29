/**
 * Swiss Volleyball League Scraper - Final Version
 * 
 * This scraper collects clubs by filtering on specific league levels
 * in the Angebote dropdown on the Verein Suchen page.
 * 
 * Based on analysis:
 * - The Angebote dropdown has sub-filters for specific leagues (NLA, NLB, 1L, 2L, etc.)
 * - Clicking these filters shows only clubs in that specific league
 * - This allows us to get the exact league level for each club
 * 
 * URL: https://www.volleyball.ch/de/verband/services/verein-suchen
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';

interface ClubLeague {
  name: string;
  city?: string;
  postalCode?: string;
  email?: string;
  website?: string;
}

interface LeagueData {
  gender: 'women' | 'men';
  league: string;
  clubs: ClubLeague[];
}

async function scrapeByLeague(): Promise<void> {
  console.log('='.repeat(70));
  console.log('Swiss Volleyball - League-by-League Scraper');
  console.log('URL: https://www.volleyball.ch/de/verband/services/verein-suchen');
  console.log('='.repeat(70));
  
  const browser: Browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const page: Page = await browser.newPage();
  
  const allLeagues: LeagueData[] = [];
  
  // Senior leagues to scrape
  const seniorLeagues = ['NLA', 'NLB', '1L', '2L', '3L', '4L', '5L'];
  // Youth leagues to scrape
  const youthLeagues = ['U23', 'U20', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14', 'U13'];
  
  try {
    // Navigate to the page
    console.log('\n📍 Navigating to Verein suchen...');
    await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // First, let's try clicking the Angebot dropdown to reveal options
    console.log('\n📊 Exploring Angebote dropdown structure...');
    
    // Try to find and click the Angebot dropdown button
    const angebotDropdown = await page.$('text=Angebot wählen');
    if (angebotDropdown) {
      await angebotDropdown.click();
      await page.waitForTimeout(1000);
    }
    
    // Now let's get the full structure of available filter options
    const filterStructure = await page.evaluate(() => {
      const dropdown = document.querySelector('.refinement-dropdown');
      if (!dropdown) return { found: false, text: '' };
      
      const text = dropdown.textContent || '';
      
      // Find all checkboxes/filter items
      const items = Array.from(dropdown.querySelectorAll('.ais-RefinementList-item, .refinement-item-checkbox'));
      const labels = items.map(item => item.textContent?.trim() || '');
      
      return {
        found: true,
        text: text.substring(0, 2000),
        labels
      };
    });
    
    console.log('\nDropdown structure found:', filterStructure.found);
    console.log('Labels found:', filterStructure.labels.slice(0, 20));
    
    // Try to scrape clubs for each league by clicking the checkboxes
    // Women Senior leagues
    console.log('\n\n' + '='.repeat(50));
    console.log('SCRAPING WOMEN SENIOR LEAGUES');
    console.log('='.repeat(50));
    
    // First click on "Volleyball Frauen (NLA – 5L)" to expand
    const womenSeniorSection = await page.$('text=Volleyball Frauen (NLA – 5L)');
    if (womenSeniorSection) {
      // This might be a collapsible section - try to expand it
      const parent = await womenSeniorSection.evaluateHandle(el => el.closest('.ais-RefinementList-item, .refinement-item-checkbox, div[class*="mb-4"]'));
      if (parent) {
        await (parent as any).click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Now try to find and click specific league filters
    for (const league of seniorLeagues) {
      console.log(`\n   Trying to filter: Women ${league}...`);
      
      // Look for checkbox with the league name followed by a count (e.g., "NLA9")
      const leagueFilter = await page.$(`text=/^${league}\\d+$/`);
      if (leagueFilter) {
        // Click to filter
        await leagueFilter.click();
        await page.waitForTimeout(2000);
        
        // Collect clubs shown
        const clubs = await collectVisibleClubs(page);
        
        allLeagues.push({
          gender: 'women',
          league,
          clubs
        });
        
        console.log(`      Found ${clubs.length} clubs`);
        
        // Uncheck the filter
        await leagueFilter.click();
        await page.waitForTimeout(1000);
      } else {
        console.log(`      Filter not found`);
      }
    }
    
    // Men Senior leagues
    console.log('\n\n' + '='.repeat(50));
    console.log('SCRAPING MEN SENIOR LEAGUES');
    console.log('='.repeat(50));
    
    // First click on "Volleyball Männer (NLA – 5L)" to expand
    const menSeniorSection = await page.$('text=Volleyball Männer (NLA – 5L)');
    if (menSeniorSection) {
      const parent = await menSeniorSection.evaluateHandle(el => el.closest('.ais-RefinementList-item, .refinement-item-checkbox, div[class*="mb-4"]'));
      if (parent) {
        await (parent as any).click();
        await page.waitForTimeout(1000);
      }
    }
    
    for (const league of seniorLeagues) {
      console.log(`\n   Trying to filter: Men ${league}...`);
      
      const leagueFilter = await page.$(`text=/^${league}\\d+$/`);
      if (leagueFilter) {
        await leagueFilter.click();
        await page.waitForTimeout(2000);
        
        const clubs = await collectVisibleClubs(page);
        
        allLeagues.push({
          gender: 'men',
          league,
          clubs
        });
        
        console.log(`      Found ${clubs.length} clubs`);
        
        await leagueFilter.click();
        await page.waitForTimeout(1000);
      } else {
        console.log(`      Filter not found`);
      }
    }
    
    // Generate results
    console.log('\n\n' + '='.repeat(70));
    console.log('FINAL RESULTS');
    console.log('='.repeat(70));
    
    let totalClubs = 0;
    const clubsByLeague: Record<string, string[]> = {};
    
    for (const data of allLeagues) {
      const key = `${data.gender === 'women' ? 'W' : 'M'}-${data.league}`;
      clubsByLeague[key] = data.clubs.map(c => c.name);
      totalClubs += data.clubs.length;
      console.log(`${key}: ${data.clubs.length} clubs`);
    }
    
    console.log(`\nTotal league entries: ${totalClubs}`);
    
    // Save results
    const output = {
      scrapedAt: new Date().toISOString(),
      source: 'https://www.volleyball.ch/de/verband/services/verein-suchen',
      method: 'Angebote dropdown filtering',
      totalLeagueEntries: totalClubs,
      leagueData: allLeagues,
      clubsByLeague,
      notes: [
        'One club can appear in multiple leagues',
        'This data shows specific league levels, not just ranges',
        'Some clubs may not appear if they opted out of the search'
      ]
    };
    
    const outputPath = 'data/swiss-volley-leagues-by-club.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n✅ Data saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

async function collectVisibleClubs(page: Page): Promise<ClubLeague[]> {
  const clubs: ClubLeague[] = [];
  
  // Collect all visible club items
  const clubItems = await page.$$('.ais-Hits-item');
  
  for (const item of clubItems) {
    try {
      const data = await item.evaluate(el => {
        const text = el.textContent || '';
        
        // Get the first significant text (club name)
        // Skip known non-name patterns
        const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => 
          l.length > 2 && 
          !l.includes('Angebot') && 
          !l.includes('Kontakt') &&
          !l.includes('Volleyball') &&
          !l.includes('Kids') &&
          !l.includes('Beach') &&
          !l.includes('Weitere') &&
          !l.includes('Vereinswebseite')
        );
        
        const name = lines[0] || '';
        
        // Location
        const locMatch = text.match(/(\d{4})\s+([A-ZÀ-Ü][a-zà-ü\-]+)/);
        
        // Email
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
        
        // Website
        const websiteLink = el.querySelector('a[href*="http"]:not([href*="mailto"])');
        const website = websiteLink?.getAttribute('href') || undefined;
        
        return {
          name,
          postalCode: locMatch?.[1],
          city: locMatch?.[2],
          email: emailMatch?.[0],
          website
        };
      });
      
      if (data.name && data.name.length > 2) {
        clubs.push(data);
      }
    } catch (e) {
      // Skip errors
    }
  }
  
  return clubs;
}

// Run
scrapeByLeague().catch(console.error);
