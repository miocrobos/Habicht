/**
 * SWISS VOLLEY LEAGUE SCRAPER - DEBUG VERSION
 * Inspect the dropdown structure to understand the selectors
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('SWISS VOLLEY DROPDOWN INSPECTOR');
  console.log('================================\n');
  
  const browser = await chromium.launch({ headless: false }); // Show browser
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  
  // Navigate to Game Center
  console.log('Navigating to Game Center...');
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click Liga dropdown
  console.log('\nClicking Liga dropdown...');
  const ligaButton = page.locator('button:has-text("Liga:")').first();
  await ligaButton.click();
  await page.waitForTimeout(2000);
  
  // Take screenshot of open dropdown
  await page.screenshot({ path: path.join(__dirname, '..', 'data', 'dropdown-open.png'), fullPage: true });
  
  // Get all visible text
  const bodyText = await page.locator('body').innerText();
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'dropdown-open.txt'), bodyText, 'utf-8');
  
  // Find all clickable elements
  console.log('\nLooking for dropdown options...');
  const allElements = await page.locator('*').all();
  
  // Look for elements containing league names
  const leagueTexts = ['NLA', 'NLB', '1. Liga', '2. Liga', '3. Liga'];
  
  for (const text of leagueTexts) {
    const elements = await page.locator(`text="${text}"`).all();
    console.log(`\n"${text}" found ${elements.length} times:`);
    
    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const el = elements[i];
      try {
        const tagName = await el.evaluate(e => e.tagName);
        const className = await el.evaluate(e => e.className || '');
        const isVisible = await el.isVisible();
        console.log(`  ${i}: <${tagName}> class="${className.substring(0, 50)}" visible=${isVisible}`);
      } catch (e) {
        console.log(`  ${i}: Error getting info`);
      }
    }
  }
  
  // Try to find elements that look like dropdown options
  console.log('\nLooking for dropdown/listbox elements...');
  const dropdownSelectors = [
    '[role="listbox"]',
    '[role="option"]',
    '[role="menu"]',
    '[role="menuitem"]',
    'ul li',
    '.dropdown',
    '[class*="dropdown"]',
    '[class*="select"]',
    '[class*="option"]',
  ];
  
  for (const selector of dropdownSelectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`  ${selector}: ${count} elements`);
      }
    } catch (e) {
      // Ignore selector errors
    }
  }
  
  // Wait for user to inspect
  console.log('\n\nBrowser open for 30 seconds - inspect the dropdown...');
  await page.waitForTimeout(30000);
  
  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
