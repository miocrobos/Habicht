/**
 * SWISS VOLLEY NACHWUCHS (YOUTH) SCRAPER
 * Scrapes U23, U20, U18 leagues from Game Center
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface YouthData {
  teams: string[];
  league: string;
  gender: string;
}

async function main() {
  console.log('SWISS VOLLEY NACHWUCHS SCRAPER');
  console.log('==============================\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // Navigate to Game Center
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check for Nachwuchs button
  console.log('Looking for Nachwuchs section...');
  
  const nachwuchsBtn = page.locator('.filter-button:has-text("Nachwuchs")').first();
  if (await nachwuchsBtn.count() > 0) {
    console.log('Found Nachwuchs button, clicking...');
    await nachwuchsBtn.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Get page content
    const bodyText = await page.locator('body').innerText();
    
    // Save for analysis
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'nachwuchs-page.txt'), bodyText, 'utf-8');
    console.log('Saved nachwuchs page to data/nachwuchs-page.txt');
    
    // Check what leagues/options are available
    const ligaButton = page.locator('button:has-text("Liga:")').first();
    if (await ligaButton.count() > 0) {
      const ligaText = await ligaButton.innerText();
      console.log(`\nLiga button: ${ligaText}`);
      
      await ligaButton.click();
      await page.waitForTimeout(1000);
      
      const options = await page.locator('[role="option"]').allInnerTexts();
      console.log(`Available youth leagues: ${JSON.stringify(options)}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: path.join(__dirname, '..', 'data', 'nachwuchs-screenshot.png'), fullPage: true });
    console.log('Saved screenshot');
    
  } else {
    console.log('Nachwuchs button not found');
    
    // Look for any filter buttons
    const allButtons = await page.locator('.filter-button').allInnerTexts();
    console.log(`Available filter buttons: ${JSON.stringify(allButtons)}`);
  }
  
  await browser.close();
  console.log('\nDone');
}

main().catch(console.error);
