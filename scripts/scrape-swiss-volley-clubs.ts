import { chromium } from 'playwright';
import * as fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  const page = await browser.newPage();
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { waitUntil: 'networkidle' });

  let clubs: any[] = [];
  let pageNum = 1;

  // Wait for content to load
  await page.waitForTimeout(3000);

  // Save first page HTML for debugging
  const html = await page.content();
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  fs.writeFileSync('data/verein-search-page1.html', html, 'utf-8');
  console.log('Saved HTML of first page to data/verein-search-page1.html');

  while (true) {
    await page.waitForTimeout(2000); // Wait for JS to render

    // Extract club data from the current page - using broader selectors
    const pageClubs = await page.evaluate(() => {
      // The site shows club cards - let's try to find them
      // Look for any element that contains club info patterns
      const allDivs = Array.from(document.querySelectorAll('div, article, section'));
      const clubNodes: Element[] = [];
      
      allDivs.forEach(div => {
        const text = div.textContent || '';
        // Check if this div contains a postal code pattern (Swiss clubs have 4-digit postal codes)
        if (/\d{4}\s+[A-Za-zÀ-ÿ]/.test(text) && text.includes('Angebot')) {
          // Make sure it's not a parent containing multiple clubs
          const children = div.querySelectorAll('div');
          let isLeafClub = true;
          children.forEach(child => {
            if (/\d{4}\s+[A-Za-zÀ-ÿ]/.test(child.textContent || '') && child.textContent?.includes('Angebot')) {
              isLeafClub = false;
            }
          });
          if (isLeafClub || children.length < 5) {
            clubNodes.push(div);
          }
        }
      });

      // De-duplicate by getting unique club names
      const seen = new Set<string>();
      const results: any[] = [];
      
      clubNodes.forEach(node => {
        const text = node.textContent || '';
        // Extract club name - usually at the start or in a heading
        const heading = node.querySelector('h1, h2, h3, h4, strong, b');
        let name = heading?.textContent?.trim() || '';
        
        // If no heading, try to get the first line
        if (!name) {
          const lines = text.split('\n').filter(l => l.trim());
          name = lines[0]?.trim() || '';
        }
        
        // Skip if already seen or name is too short/generic
        if (seen.has(name) || name.length < 3 || name === 'Angebot') return;
        seen.add(name);

        // Extract postal code and town
        const townMatch = text.match(/(\d{4})\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\n|Kontakt|Angebot)/);
        const postalCode = townMatch?.[1] || '';
        const town = townMatch?.[2]?.trim() || '';

        // Extract website
        const websiteLink = node.querySelector('a[href*="http"]:not([href*="mailto"])');
        const website = websiteLink?.getAttribute('href') || '';

        // Extract offerings (Angebot)
        const angebotMatch = text.match(/Angebot[\s\S]*?(Volleyball|Beach|Kids|Junioren|Juniorinnen|Männer|Frauen|NLA|NLB|Liga)[\s\S]*?(?=\n\n|$)/i);
        const angebot = angebotMatch?.[0]?.trim() || '';

        if (name && name.length > 2) {
          results.push({ name, postalCode, town, website, angebot: text.substring(0, 500) });
        }
      });

      return results;
    });

    console.log(`Page ${pageNum}: found ${pageClubs.length} clubs`);
    if (pageClubs.length > 0) {
      console.log('Sample club:', pageClubs[0]?.name);
    }

    clubs.push(...pageClubs);

    // Try to click the next page button
    const nextButton = await page.$('text="Page ' + (pageNum + 1) + '"');
    const nextButtonAlt = await page.$('[aria-label*="next" i], [aria-label*="nächste" i], .pagination a:has-text("' + (pageNum + 1) + '")');
    
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(2000);
      pageNum++;
    } else if (nextButtonAlt) {
      await nextButtonAlt.click();
      await page.waitForTimeout(2000);
      pageNum++;
    } else if (pageNum < 30) {
      // Try clicking page number directly
      const pageLink = await page.$(`a:has-text("${pageNum + 1}")`);
      if (pageLink) {
        await pageLink.click();
        await page.waitForTimeout(2000);
        pageNum++;
      } else {
        console.log('No more pages found');
        break;
      }
    } else {
      break;
    }
  }

  await browser.close();

  // De-duplicate clubs by name
  const uniqueClubs = Array.from(new Map(clubs.map(c => [c.name, c])).values());

  fs.writeFileSync('data/swiss-volleyball-clubs-raw.json', JSON.stringify(uniqueClubs, null, 2), 'utf-8');
  console.log(`\nExtracted ${uniqueClubs.length} unique clubs to data/swiss-volleyball-clubs-raw.json`);
})();