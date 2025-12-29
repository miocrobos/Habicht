/**
 * DEBUG - Find all league options
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('DEBUG: League Options Discovery\n');
  
  const browser = await chromium.launch({ headless: false }); // Show browser
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Page loaded. Looking for Liga dropdown...');
  
  // Find and click Liga button
  const ligaButton = page.locator('button:has-text("Liga:")').first();
  if (await ligaButton.count() > 0) {
    console.log('Found Liga button, clicking...');
    await ligaButton.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot
    await page.screenshot({ path: path.join(__dirname, '..', 'data', 'dropdown-debug.png'), fullPage: false });
    console.log('Saved screenshot to data/dropdown-debug.png');
    
    // Get all options
    const options = await page.locator('[role="option"]').all();
    console.log(`\nFound ${options.length} options with [role="option"]:`);
    for (let i = 0; i < options.length; i++) {
      const text = await options[i].innerText();
      const ariaLabel = await options[i].getAttribute('aria-label');
      console.log(`  ${i}: "${text}" (aria-label: ${ariaLabel})`);
    }
    
    // Also check listbox options
    const listboxOptions = await page.locator('[role="listbox"] li').all();
    console.log(`\nFound ${listboxOptions.length} LI items in listbox:`);
    for (let i = 0; i < listboxOptions.length; i++) {
      const text = await listboxOptions[i].innerText();
      console.log(`  ${i}: "${text}"`);
    }
    
    // Check with .option class
    const optionClass = await page.locator('li.option').all();
    console.log(`\nFound ${optionClass.length} items with li.option:`);
    for (let i = 0; i < optionClass.length; i++) {
      const text = await optionClass[i].innerText();
      console.log(`  ${i}: "${text}"`);
    }
    
    // Try clicking NLB
    console.log('\n\nTrying to click NLB...');
    const nlbOption = page.locator('[role="option"]:has-text("NLB")').first();
    if (await nlbOption.count() > 0) {
      await nlbOption.click();
      await page.waitForTimeout(3000);
      console.log('NLB clicked, page updated');
      
      // Now open dropdown again
      const ligaButton2 = page.locator('button:has-text("Liga:")').first();
      await ligaButton2.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: path.join(__dirname, '..', 'data', 'dropdown-after-nlb.png'), fullPage: false });
      
      // Check options again
      const options2 = await page.locator('[role="option"]').all();
      console.log(`\nAfter NLB selection, found ${options2.length} options:`);
      for (let i = 0; i < options2.length; i++) {
        const text = await options2[i].innerText();
        console.log(`  ${i}: "${text}"`);
      }
    }
    
  } else {
    console.log('Could not find Liga button');
    await page.screenshot({ path: path.join(__dirname, '..', 'data', 'no-liga-button.png'), fullPage: true });
  }
  
  console.log('\n\nWaiting 10 seconds for inspection...');
  await page.waitForTimeout(10000);
  
  await browser.close();
  console.log('Done');
}

main().catch(console.error);
