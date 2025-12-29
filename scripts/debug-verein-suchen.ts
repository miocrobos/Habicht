import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function debugVereinSuchen() {
  console.log('Starting Verein Suchen page debug...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Loading Verein Suchen page...');
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { 
    waitUntil: 'networkidle', 
    timeout: 60000 
  });
  
  // Wait for content to load
  await page.waitForTimeout(5000);
  
  // Save full HTML
  const html = await page.content();
  fs.writeFileSync(path.join(__dirname, '../data/vs-page-full.html'), html);
  console.log('Saved full HTML to data/vs-page-full.html');
  
  // Get page text to understand structure
  const allText = await page.evaluate(() => document.body.innerText);
  const lines = allText.split('\n').filter(l => l.trim());
  console.log('\nFirst 100 lines of page text:');
  lines.slice(0, 100).forEach((l, i) => console.log(`${i}: ${l}`));
  
  // Try to find elements with "Angebot" text
  const angebotElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements
      .filter(el => el.textContent?.includes('Angebot'))
      .map(el => ({
        tag: el.tagName,
        className: el.className,
        id: el.id,
        text: el.textContent?.substring(0, 100)
      }))
      .slice(0, 20);
  });
  
  console.log('\n\nElements containing "Angebot":');
  angebotElements.forEach((el, i) => {
    console.log(`${i}: <${el.tag} class="${el.className}" id="${el.id}">`);
    console.log(`   Text: ${el.text}`);
  });
  
  // Try to find club names like "Bellinzona"
  const clubElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements
      .filter(el => {
        const text = el.textContent || '';
        return (text.includes('Bellinzona') || text.includes('VBC') || text.includes('Volley')) 
          && el.children.length === 0 
          && text.length < 100;
      })
      .map(el => ({
        tag: el.tagName,
        className: el.className,
        text: el.textContent
      }))
      .slice(0, 30);
  });
  
  console.log('\n\nElements that look like club names:');
  clubElements.forEach((el, i) => {
    console.log(`${i}: <${el.tag} class="${el.className}"> ${el.text}`);
  });
  
  // Look for hit items or cards
  const hitItems = await page.evaluate(() => {
    // Try various selectors
    const selectors = [
      '[class*="hit"]',
      '[class*="card"]',
      '[class*="club"]',
      '[class*="result"]',
      '[class*="item"]',
      'article',
      'li'
    ];
    
    const results: { selector: string; count: number; sample: string }[] = [];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        results.push({
          selector,
          count: elements.length,
          sample: (elements[0] as HTMLElement).className
        });
      }
    }
    
    return results;
  });
  
  console.log('\n\nElements found by selector:');
  hitItems.forEach(item => {
    console.log(`  ${item.selector}: ${item.count} elements (sample class: "${item.sample}")`);
  });
  
  await browser.close();
  console.log('\nDone!');
}

debugVereinSuchen().catch(console.error);
