/**
 * SWISS VOLLEY VEREIN SUCHEN - EXPLORE PAGE STRUCTURE
 * 
 * First, let's explore the page to understand the dropdown structure
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(70));
  console.log('EXPLORING VEREIN SUCHEN PAGE STRUCTURE');
  console.log('═'.repeat(70));

  const browser = await chromium.launch({ 
    headless: false,  // Watch the browser
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // Navigate to the page
  console.log('\n📡 Navigating to Verein suchen...');
  await page.goto('https://www.volleyball.ch/de/verband/services/verein-suchen', { 
    waitUntil: 'networkidle' 
  });
  await delay(3000);
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(__dirname, '..', 'data', 'verein-suchen-explore.png'), 
    fullPage: true 
  });
  console.log('   Screenshot saved to data/verein-suchen-explore.png');
  
  // Get the full page HTML for analysis
  const html = await page.content();
  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'verein-suchen-explore.html'),
    html,
    'utf-8'
  );
  console.log('   HTML saved to data/verein-suchen-explore.html');
  
  // Get body text
  const bodyText = await page.locator('body').innerText();
  fs.writeFileSync(
    path.join(__dirname, '..', 'data', 'verein-suchen-explore.txt'),
    bodyText,
    'utf-8'
  );
  console.log('   Text saved to data/verein-suchen-explore.txt');
  
  // Look for dropdown/filter elements
  console.log('\n🔍 Looking for filter elements...');
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n   Found ${buttons.length} buttons:`);
  for (const btn of buttons.slice(0, 20)) {
    const text = await btn.textContent();
    const classes = await btn.getAttribute('class');
    if (text && text.trim()) {
      console.log(`      - "${text.trim().substring(0, 50)}" (class: ${classes?.substring(0, 30) || 'none'})`);
    }
  }
  
  // Find elements with "Angebote" text
  console.log('\n   Looking for "Angebote" elements...');
  const angeboteElements = await page.locator('text=Angebote').all();
  console.log(`   Found ${angeboteElements.length} elements with "Angebote"`);
  
  for (const el of angeboteElements) {
    const tagName = await el.evaluate(e => e.tagName);
    const classes = await el.getAttribute('class');
    const text = await el.textContent();
    console.log(`      - <${tagName}> class="${classes}" text="${text?.substring(0, 50)}"`);
  }
  
  // Look for clickable filter elements
  console.log('\n   Looking for filter/dropdown containers...');
  const filterElements = await page.locator('[class*="filter"], [class*="dropdown"], [class*="select"], [class*="combobox"]').all();
  console.log(`   Found ${filterElements.length} filter-like elements`);
  
  for (const el of filterElements.slice(0, 10)) {
    const tagName = await el.evaluate(e => e.tagName);
    const classes = await el.getAttribute('class');
    const text = await el.textContent();
    console.log(`      - <${tagName}> class="${classes?.substring(0, 50)}" text="${text?.substring(0, 30)}"`);
  }
  
  // Try clicking on "Angebote" or related element
  console.log('\n📋 Trying to click on Angebote dropdown...');
  
  // Try different selectors
  const selectors = [
    'button:has-text("Angebote")',
    'div:has-text("Angebote")',
    '[class*="filter"]:has-text("Angebote")',
    'text=Alle Angebote',
    '[aria-label*="Angebote"]',
    '[placeholder*="Angebote"]',
  ];
  
  for (const selector of selectors) {
    try {
      const el = page.locator(selector).first();
      if (await el.count() > 0) {
        console.log(`   Found element with selector: ${selector}`);
        const isVisible = await el.isVisible();
        console.log(`   Is visible: ${isVisible}`);
        
        if (isVisible) {
          await el.click();
          await delay(1000);
          
          // Take screenshot after click
          await page.screenshot({ 
            path: path.join(__dirname, '..', 'data', 'verein-suchen-after-click.png'), 
            fullPage: true 
          });
          console.log('   Screenshot after click saved');
          
          // Get text after click
          const newText = await page.locator('body').innerText();
          fs.writeFileSync(
            path.join(__dirname, '..', 'data', 'verein-suchen-after-click.txt'),
            newText,
            'utf-8'
          );
          
          // Look for dropdown options
          console.log('\n   Looking for dropdown options...');
          const options = await page.locator('[role="option"], [role="menuitem"], li, [class*="option"]').all();
          console.log(`   Found ${options.length} potential options`);
          
          // Print first 30 options
          const optionTexts: string[] = [];
          for (const opt of options.slice(0, 50)) {
            const text = await opt.textContent();
            if (text && text.trim() && !optionTexts.includes(text.trim())) {
              optionTexts.push(text.trim());
            }
          }
          
          console.log('\n   Dropdown options found:');
          for (const text of optionTexts.slice(0, 40)) {
            console.log(`      - ${text.substring(0, 60)}`);
          }
          
          // Press Escape to close
          await page.keyboard.press('Escape');
          break;
        }
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  // Wait for user to see the page
  console.log('\n⏳ Waiting 30 seconds for manual inspection...');
  console.log('   You can interact with the page in the browser window.');
  await delay(30000);
  
  await browser.close();
  console.log('\n✅ Done');
}

main().catch(console.error);
