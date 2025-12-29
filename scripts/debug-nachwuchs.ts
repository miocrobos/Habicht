/**
 * DEBUG - Find Nachwuchs navigation in Game Center
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('DEBUG: Find Nachwuchs\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Look for Meisterschaft/Nachwuchs options
  console.log('Checking for Meisterschaft/Nachwuchs dropdown...');
  
  // Check for dropdown with Meisterschaft
  const meisterschaftBtn = page.locator('button:has-text("Meisterschaft")').first();
  if (await meisterschaftBtn.count() > 0) {
    console.log('Found Meisterschaft button, clicking...');
    await meisterschaftBtn.click();
    await page.waitForTimeout(1000);
    
    // Get options
    const options = await page.locator('[role="option"]').allInnerTexts();
    console.log(`Options: ${JSON.stringify(options)}`);
    
    // Look for Nachwuchs option
    const nachwuchsOption = page.locator('[role="option"]:has-text("Nachwuchs")').first();
    if (await nachwuchsOption.count() > 0) {
      console.log('Found Nachwuchs option, clicking...');
      await nachwuchsOption.click();
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle');
      
      // Check Liga options now
      const ligaButton = page.locator('button:has-text("Liga:")').first();
      if (await ligaButton.count() > 0) {
        await ligaButton.click();
        await page.waitForTimeout(1000);
        
        const ligaOptions = await page.locator('[role="option"]').allInnerTexts();
        console.log(`\nNachwuchs Liga options: ${JSON.stringify(ligaOptions)}`);
      }
      
      // Save page content
      const bodyText = await page.locator('body').innerText();
      fs.writeFileSync(path.join(__dirname, '..', 'data', 'nachwuchs-page.txt'), bodyText, 'utf-8');
      console.log('Saved page content');
    }
  } else {
    console.log('Meisterschaft button not found');
    
    // Check page text for available sections
    const bodyText = await page.locator('body').innerText();
    const lines = bodyText.split('\n').slice(0, 100);
    console.log('\nFirst 100 lines of page:');
    console.log(lines.join('\n'));
  }
  
  await browser.close();
}

main().catch(console.error);
