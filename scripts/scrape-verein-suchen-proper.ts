/**
 * Scraper for Swiss Volleyball Verein Suchen page
 * 
 * This scraper extracts SPECIFIC leagues for each club by:
 * 1. Loading the Verein Suchen page
 * 2. Scrolling to load all 299 clubs
 * 3. For each club, clicking on "Angebot" accordions to expand and get specific leagues
 * 
 * The Angebot section shows ranges like "Volleyball Frauen (NLA – 5L)"
 * but when expanded, shows specific league chips like "NLB", "1L", "2L", etc.
 * 
 * Based on user's screenshot showing Bellinzona Volley with:
 * - Volleyball Frauen expanded to show: NLB, 1L, 2L, 3L, 4L
 * - Juniorinnen expanded to show: U20, U18, U16, U14
 */

import { chromium, Page, Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ClubLeagues {
  name: string;
  city?: string;
  email?: string;
  
  // Women's Senior Leagues
  womenNLA?: boolean;
  womenNLB?: boolean;
  women1L?: boolean;
  women2L?: boolean;
  women3L?: boolean;
  women4L?: boolean;
  women5L?: boolean;
  womenSenioren?: boolean;
  
  // Men's Senior Leagues
  menNLA?: boolean;
  menNLB?: boolean;
  men1L?: boolean;
  men2L?: boolean;
  men3L?: boolean;
  men4L?: boolean;
  men5L?: boolean;
  menSenioren?: boolean;
  
  // Women's Youth
  womenU23?: boolean;
  womenU20?: boolean;
  womenU18?: boolean;
  womenU16?: boolean;
  womenU14?: boolean;
  womenU13?: boolean;
  
  // Men's Youth
  menU23?: boolean;
  menU20?: boolean;
  menU18?: boolean;
  menU16?: boolean;
  menU14?: boolean;
  menU13?: boolean;
  
  // Other
  kidsVolley?: boolean;
  beachWomen?: boolean;
  beachMen?: boolean;
  beachJuniorinnen?: boolean;
  beachJunioren?: boolean;
  
  rawAngebot?: string[];
  specificLeagues?: string[];
}

async function getTotalPages(page: Page): Promise<number> {
  // Get the pagination links and find the max page number
  const pageNumbers = await page.evaluate(() => {
    const pageLinks = document.querySelectorAll('.pagination a[aria-label^="Page"]');
    const numbers: number[] = [];
    pageLinks.forEach(link => {
      const label = link.getAttribute('aria-label');
      if (label) {
        const match = label.match(/Page (\d+)/);
        if (match) {
          numbers.push(parseInt(match[1]));
        }
      }
    });
    return numbers;
  });
  
  return Math.max(...pageNumbers, 1);
}

async function scrapeCurrentPage(page: Page): Promise<ClubLeagues[]> {
  const clubs: ClubLeagues[] = [];
  
  // Wait for clubs to load
  await page.waitForSelector('.ais-Hits-item', { timeout: 10000 }).catch(() => null);
  
  // Get all club cards on this page
  const clubCards = await page.$$('.ais-Hits-item');
  console.log(`  Found ${clubCards.length} clubs on this page`);
  
  for (let i = 0; i < clubCards.length; i++) {
    const card = clubCards[i];
    
    // Get club name
    const nameEl = await card.$('p.text-\\[30px\\]');
    const name = nameEl ? await nameEl.textContent() : '';
    
    if (!name) continue;
    
    // Get city
    const cityEl = await card.$('p.text-anthrazit-400');
    const city = cityEl ? await cityEl.textContent() : '';
    
    // Get email
    const emailEl = await card.$('a[href^="mailto:"]');
    const email = emailEl ? await emailEl.textContent() : '';
    
    const club: ClubLeagues = {
      name: name.trim(),
      city: city?.trim(),
      email: email?.trim(),
      specificLeagues: [],
      rawAngebot: []
    };
    
    // Find all accordion triggers (Angebot items with caret-down)
    const accordions = await card.$$('.club-search-offer .cursor-pointer');
    
    for (const accordion of accordions) {
      // Get the context (category name) before clicking
      const categoryText = await accordion.textContent();
      if (!categoryText) continue;
      
      club.rawAngebot?.push(categoryText.trim());
      
      // Only expand accordions that have expandable content
      const hasCaret = await accordion.$('svg') !== null;
      if (!hasCaret) continue;
      
      // Click to expand
      try {
        await accordion.click();
        await page.waitForTimeout(300);
        
        // After expanding, look for the specific league badges
        // They appear as flex items after the accordion is expanded
        const parent = await accordion.evaluateHandle(el => el.closest('.club-search-offer'));
        const parentEl = parent.asElement();
        
        if (parentEl) {
          // Get all text content from expanded section
          const expandedContent = await parentEl.evaluate(el => {
            // Look for the flex container that appears after clicking
            const flexContainers = el.querySelectorAll('.flex.flex-wrap, .flex.gap-2, div > span');
            const badges: string[] = [];
            flexContainers.forEach(container => {
              // Get individual badge spans
              const spans = container.querySelectorAll('span');
              spans.forEach(span => {
                const text = span.textContent?.trim();
                if (text && text.match(/^(NLA|NLB|1L|2L|3L|4L|5L|U23|U20|U18|U16|U14|U13)$/)) {
                  badges.push(text);
                }
              });
            });
            return badges;
          });
          
          if (expandedContent.length > 0) {
            club.specificLeagues?.push(...expandedContent);
            
            // Parse specific leagues with context
            for (const badge of expandedContent) {
              parseSpecificLeague(badge, club, categoryText);
            }
          }
        }
        
        // Click again to close (optional, for cleaner state)
        await accordion.click().catch(() => {});
        await page.waitForTimeout(100);
        
      } catch (e) {
        // Continue if click fails
      }
    }
    
    // If no specific leagues were found, try to parse from rawAngebot
    if (!club.specificLeagues?.length) {
      parseLeagues(club.rawAngebot || [], club);
    }
    
    clubs.push(club);
    
    if ((i + 1) % 5 === 0) {
      console.log(`    Processed ${i + 1}/${clubCards.length} clubs...`);
    }
  }
  
  return clubs;
}

function parseLeagues(leagueTexts: string[], club: ClubLeagues): void {
  for (const text of leagueTexts) {
    const lowerText = text.toLowerCase();
    
    // Women's senior leagues
    if (lowerText.includes('frauen') || lowerText.includes('women')) {
      if (text.includes('NLA')) club.womenNLA = true;
      if (text.includes('NLB')) club.womenNLB = true;
      if (text.includes('1L') || text.includes('1.')) club.women1L = true;
      if (text.includes('2L') || text.includes('2.')) club.women2L = true;
      if (text.includes('3L') || text.includes('3.')) club.women3L = true;
      if (text.includes('4L') || text.includes('4.')) club.women4L = true;
      if (text.includes('5L') || text.includes('5.')) club.women5L = true;
      if (lowerText.includes('senioren') || lowerText.includes('senior')) club.womenSenioren = true;
    }
    
    // Men's senior leagues
    if (lowerText.includes('männer') || lowerText.includes('herren') || lowerText.includes('men')) {
      if (text.includes('NLA')) club.menNLA = true;
      if (text.includes('NLB')) club.menNLB = true;
      if (text.includes('1L') || text.includes('1.')) club.men1L = true;
      if (text.includes('2L') || text.includes('2.')) club.men2L = true;
      if (text.includes('3L') || text.includes('3.')) club.men3L = true;
      if (text.includes('4L') || text.includes('4.')) club.men4L = true;
      if (text.includes('5L') || text.includes('5.')) club.men5L = true;
      if (lowerText.includes('senioren') || lowerText.includes('senior')) club.menSenioren = true;
    }
    
    // Women's youth (Juniorinnen)
    if (lowerText.includes('juniorinnen') || (lowerText.includes('junior') && lowerText.includes('female'))) {
      if (text.includes('U23')) club.womenU23 = true;
      if (text.includes('U20')) club.womenU20 = true;
      if (text.includes('U18')) club.womenU18 = true;
      if (text.includes('U16')) club.womenU16 = true;
      if (text.includes('U14')) club.womenU14 = true;
      if (text.includes('U13')) club.womenU13 = true;
    }
    
    // Men's youth (Junioren)
    if (lowerText.includes('junioren') && !lowerText.includes('juniorinnen')) {
      if (text.includes('U23')) club.menU23 = true;
      if (text.includes('U20')) club.menU20 = true;
      if (text.includes('U18')) club.menU18 = true;
      if (text.includes('U16')) club.menU16 = true;
      if (text.includes('U14')) club.menU14 = true;
      if (text.includes('U13')) club.menU13 = true;
    }
    
    // Kids Volley
    if (lowerText.includes('kids')) {
      club.kidsVolley = true;
    }
    
    // Beach volleyball
    if (lowerText.includes('beach')) {
      if (lowerText.includes('frauen') || lowerText.includes('women')) {
        club.beachWomen = true;
      }
      if (lowerText.includes('männer') || lowerText.includes('men') || lowerText.includes('herren')) {
        club.beachMen = true;
      }
      if (lowerText.includes('juniorinnen')) {
        club.beachJuniorinnen = true;
      }
      if (lowerText.includes('junioren') && !lowerText.includes('juniorinnen')) {
        club.beachJunioren = true;
      }
    }
  }
}

function parseSpecificLeague(badge: string, club: ClubLeagues, context: string): void {
  const lowerContext = context.toLowerCase();
  const lowerBadge = badge.toLowerCase();
  
  // Determine if this is for women or men based on context
  const isWomen = lowerContext.includes('frauen') || lowerContext.includes('juniorinnen');
  const isMen = lowerContext.includes('männer') || lowerContext.includes('junioren') && !lowerContext.includes('juniorinnen');
  const isYouth = lowerContext.includes('junior');
  
  // Parse the specific league badge
  if (badge === 'NLA') {
    if (isWomen) club.womenNLA = true;
    else if (isMen) club.menNLA = true;
  } else if (badge === 'NLB') {
    if (isWomen) club.womenNLB = true;
    else if (isMen) club.menNLB = true;
  } else if (badge === '1L' || badge === '1. Liga' || badge === '1.Liga') {
    if (isWomen && !isYouth) club.women1L = true;
    else if (isMen && !isYouth) club.men1L = true;
  } else if (badge === '2L' || badge === '2. Liga' || badge === '2.Liga') {
    if (isWomen && !isYouth) club.women2L = true;
    else if (isMen && !isYouth) club.men2L = true;
  } else if (badge === '3L' || badge === '3. Liga' || badge === '3.Liga') {
    if (isWomen && !isYouth) club.women3L = true;
    else if (isMen && !isYouth) club.men3L = true;
  } else if (badge === '4L' || badge === '4. Liga' || badge === '4.Liga') {
    if (isWomen && !isYouth) club.women4L = true;
    else if (isMen && !isYouth) club.men4L = true;
  } else if (badge === '5L' || badge === '5. Liga' || badge === '5.Liga') {
    if (isWomen && !isYouth) club.women5L = true;
    else if (isMen && !isYouth) club.men5L = true;
  } else if (badge === 'U23') {
    if (isWomen) club.womenU23 = true;
    else club.menU23 = true;
  } else if (badge === 'U20') {
    if (isWomen) club.womenU20 = true;
    else club.menU20 = true;
  } else if (badge === 'U18') {
    if (isWomen) club.womenU18 = true;
    else club.menU18 = true;
  } else if (badge === 'U16') {
    if (isWomen) club.womenU16 = true;
    else club.menU16 = true;
  } else if (badge === 'U14') {
    if (isWomen) club.womenU14 = true;
    else club.menU14 = true;
  } else if (badge === 'U13') {
    if (isWomen) club.womenU13 = true;
    else club.menU13 = true;
  } else if (lowerBadge.includes('senior')) {
    if (isWomen) club.womenSenioren = true;
    else if (isMen) club.menSenioren = true;
  }
}

async function scrapeClubDetails(page: Page): Promise<ClubLeagues[]> {
  console.log('\nExtracting club details by clicking accordions...');
  
  // Get all club cards
  const clubCards = await page.$$('.ais-Hits-item');
  console.log(`Found ${clubCards.length} club cards to process`);
  
  const clubs: ClubLeagues[] = [];
  
  for (let i = 0; i < clubCards.length; i++) {
    const card = clubCards[i];
    
    try {
      // Scroll card into view
      await card.scrollIntoViewIfNeeded();
      
      // Get club name
      const nameEl = await card.$('p.text-\\[30px\\].text-anthrazit-600');
      const name = nameEl ? (await nameEl.textContent())?.trim() || '' : '';
      
      if (!name) continue;
      
      // Get city
      const cityEl = await card.$('p.text-anthrazit-400');
      let city: string | undefined;
      if (cityEl) {
        const cityText = (await cityEl.textContent())?.trim() || '';
        const match = cityText.match(/^\d+\s+(.+)$/);
        city = match ? match[1] : undefined;
      }
      
      // Get email
      const emailEl = await card.$('a[href^="mailto:"]');
      const email = emailEl ? (await emailEl.textContent())?.trim() : undefined;
      
      const club: ClubLeagues = { name, city, email, specificLeagues: [] };
      
      // Find and click all Angebot accordions within this card
      const accordions = await card.$$('.club-search-offer .cursor-pointer');
      
      for (const accordion of accordions) {
        const accordionText = (await accordion.textContent())?.trim() || '';
        
        // Determine context (Frauen/Männer/Juniorinnen/Junioren)
        const isWomen = accordionText.includes('Frauen');
        const isMen = accordionText.includes('Männer');
        const isJuniorinnen = accordionText.includes('Juniorinnen');
        const isJunioren = accordionText.includes('Junioren') && !accordionText.includes('Juniorinnen');
        const isKids = accordionText.toLowerCase().includes('kids');
        const isBeach = accordionText.toLowerCase().includes('beach');
        
        // Click to expand
        try {
          await accordion.click();
          await page.waitForTimeout(200);
          
          // Look for specific league badges that appear after clicking
          // These are typically span or div elements with league names like NLA, NLB, 1L, 2L, etc.
          const parentOffer = await accordion.evaluateHandle(el => el.closest('.club-search-offer'));
          
          // Get all text after expansion
          const expandedText = await (parentOffer as any).evaluate((el: Element) => {
            const badges: string[] = [];
            // Look for span elements with league badges
            el.querySelectorAll('span').forEach(span => {
              const text = span.textContent?.trim() || '';
              if (text && !text.includes('–') && (
                text === 'NLA' || text === 'NLB' ||
                text.match(/^\d+L$/) || text.match(/^U\d+$/) ||
                text.includes('Liga') || text.includes('Senioren')
              )) {
                badges.push(text);
              }
            });
            // Also check div elements
            el.querySelectorAll('div').forEach(div => {
              if (div.children.length === 0) {
                const text = div.textContent?.trim() || '';
                if (text && !text.includes('–') && (
                  text === 'NLA' || text === 'NLB' ||
                  text.match(/^\d+L$/) || text.match(/^U\d+$/) ||
                  text.includes('Liga') || text.includes('Senioren')
                )) {
                  badges.push(text);
                }
              }
            });
            return badges;
          });
          
          // Parse the specific leagues
          for (const badge of expandedText) {
            club.specificLeagues!.push(`${accordionText.split('(')[0].trim()}: ${badge}`);
            
            if (badge === 'NLA') {
              if (isWomen) club.womenNLA = true;
              else if (isMen) club.menNLA = true;
            } else if (badge === 'NLB') {
              if (isWomen) club.womenNLB = true;
              else if (isMen) club.menNLB = true;
            } else if (badge === '1L' || badge === '1. Liga') {
              if (isWomen && !isJuniorinnen) club.women1L = true;
              else if (isMen && !isJunioren) club.men1L = true;
            } else if (badge === '2L' || badge === '2. Liga') {
              if (isWomen && !isJuniorinnen) club.women2L = true;
              else if (isMen && !isJunioren) club.men2L = true;
            } else if (badge === '3L' || badge === '3. Liga') {
              if (isWomen && !isJuniorinnen) club.women3L = true;
              else if (isMen && !isJunioren) club.men3L = true;
            } else if (badge === '4L' || badge === '4. Liga') {
              if (isWomen && !isJuniorinnen) club.women4L = true;
              else if (isMen && !isJunioren) club.men4L = true;
            } else if (badge === '5L' || badge === '5. Liga') {
              if (isWomen && !isJuniorinnen) club.women5L = true;
              else if (isMen && !isJunioren) club.men5L = true;
            } else if (badge === 'U23') {
              if (isJuniorinnen) club.womenU23 = true;
              else if (isJunioren) club.menU23 = true;
            } else if (badge === 'U20') {
              if (isJuniorinnen) club.womenU20 = true;
              else if (isJunioren) club.menU20 = true;
            } else if (badge === 'U18') {
              if (isJuniorinnen) club.womenU18 = true;
              else if (isJunioren) club.menU18 = true;
            } else if (badge === 'U16') {
              if (isJuniorinnen) club.womenU16 = true;
              else if (isJunioren) club.menU16 = true;
            } else if (badge === 'U14') {
              if (isJuniorinnen) club.womenU14 = true;
              else if (isJunioren) club.menU14 = true;
            } else if (badge === 'U13') {
              if (isJuniorinnen) club.womenU13 = true;
              else if (isJunioren) club.menU13 = true;
            } else if (badge.toLowerCase().includes('senioren')) {
              if (isWomen) club.womenSenioren = true;
              else if (isMen) club.menSenioren = true;
            }
          }
          
          // Handle Kids Volley
          if (isKids) {
            club.kidsVolley = true;
          }
          
          // Handle Beach
          if (isBeach) {
            if (isWomen) club.beachWomen = true;
            if (isMen) club.beachMen = true;
            if (isJuniorinnen) club.beachJuniorinnen = true;
            if (isJunioren) club.beachJunioren = true;
          }
          
        } catch (e) {
          // Accordion click failed, skip
        }
      }
      
      clubs.push(club);
      
      if ((i + 1) % 50 === 0) {
        console.log(`  Processed ${i + 1}/${clubCards.length} clubs...`);
      }
      
    } catch (e) {
      console.error(`Error processing club ${i}:`, e);
    }
  }
  
  return clubs;
}

async function main() {
  console.log('=== Swiss Volleyball Verein Suchen Scraper ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Loading Verein Suchen page...');
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  // Wait for initial content
  await page.waitForTimeout(3000);
  
  // Get total pages
  const totalPages = await getTotalPages(page);
  console.log(`Found ${totalPages} pages of clubs to scrape`);
  
  const allClubs: ClubLeagues[] = [];
  
  // Scrape each page
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    console.log(`\n=== Page ${pageNum}/${totalPages} ===`);
    
    if (pageNum > 1) {
      // Navigate to next page by clicking the page link
      const pageLink = await page.$(`a[aria-label="Page ${pageNum}"]`);
      if (pageLink) {
        await pageLink.click();
        await page.waitForTimeout(2000);
        await page.waitForSelector('.ais-Hits-item', { timeout: 10000 }).catch(() => null);
      } else {
        console.log(`Could not find link to page ${pageNum}, trying to navigate...`);
        // Try clicking the next arrow if page link not found
        const nextArrow = await page.$('.pagination a svg.rotate-180');
        if (nextArrow) {
          const parent = await nextArrow.evaluateHandle(el => el.closest('a'));
          if (parent) {
            await (parent.asElement() as any)?.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    }
    
    // Scrape clubs on current page
    const pageClubs = await scrapeCurrentPage(page);
    allClubs.push(...pageClubs);
    
    console.log(`  Total scraped so far: ${allClubs.length} clubs`);
  }
  
  // Save results
  const outputPath = path.join(__dirname, '../data/clubs-verein-suchen-leagues.json');
  fs.writeFileSync(outputPath, JSON.stringify(allClubs, null, 2));
  console.log(`\nSaved ${allClubs.length} clubs to ${outputPath}`);
  
  // Print summary
  const summary = {
    total: allClubs.length,
    womenNLA: allClubs.filter(c => c.womenNLA).length,
    womenNLB: allClubs.filter(c => c.womenNLB).length,
    women1L: allClubs.filter(c => c.women1L).length,
    women2L: allClubs.filter(c => c.women2L).length,
    women3L: allClubs.filter(c => c.women3L).length,
    women4L: allClubs.filter(c => c.women4L).length,
    women5L: allClubs.filter(c => c.women5L).length,
    menNLA: allClubs.filter(c => c.menNLA).length,
    menNLB: allClubs.filter(c => c.menNLB).length,
    men1L: allClubs.filter(c => c.men1L).length,
    men2L: allClubs.filter(c => c.men2L).length,
    men3L: allClubs.filter(c => c.men3L).length,
    men4L: allClubs.filter(c => c.men4L).length,
    men5L: allClubs.filter(c => c.men5L).length,
    kidsVolley: allClubs.filter(c => c.kidsVolley).length,
  };
  
  console.log('\n=== Summary ===');
  console.log(`Total clubs: ${summary.total}`);
  console.log(`\nWomen's Leagues:`);
  console.log(`  NLA: ${summary.womenNLA}, NLB: ${summary.womenNLB}`);
  console.log(`  1L: ${summary.women1L}, 2L: ${summary.women2L}, 3L: ${summary.women3L}`);
  console.log(`  4L: ${summary.women4L}, 5L: ${summary.women5L}`);
  console.log(`\nMen's Leagues:`);
  console.log(`  NLA: ${summary.menNLA}, NLB: ${summary.menNLB}`);
  console.log(`  1L: ${summary.men1L}, 2L: ${summary.men2L}, 3L: ${summary.men3L}`);
  console.log(`  4L: ${summary.men4L}, 5L: ${summary.men5L}`);
  console.log(`\nKids Volley: ${summary.kidsVolley}`);
  
  // Print some example clubs with NLA
  const nlaWomen = allClubs.filter(c => c.womenNLA);
  if (nlaWomen.length > 0) {
    console.log('\n=== Clubs with Women NLA ===');
    nlaWomen.slice(0, 10).forEach(c => console.log(`  - ${c.name}`));
  }
  
  const nlaMen = allClubs.filter(c => c.menNLA);
  if (nlaMen.length > 0) {
    console.log('\n=== Clubs with Men NLA ===');
    nlaMen.slice(0, 10).forEach(c => console.log(`  - ${c.name}`));
  }
  
  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
