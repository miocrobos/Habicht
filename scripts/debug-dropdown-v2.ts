/**
 * DEBUG v2 - Check dropdown options for each gender
 */

import { chromium } from 'playwright';
import * as path from 'path';

async function main() {
  console.log('DEBUG v2: Check dropdown options for each gender\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // ===== WOMEN =====
  console.log('===== WOMEN (Default) =====');
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Check current state
  let currentText = await page.locator('button:has-text("Liga:")').first().innerText();
  console.log(`Current Liga button: ${currentText}`);
  
  // Open dropdown
  await page.locator('button:has-text("Liga:")').first().click();
  await page.waitForTimeout(1000);
  
  let options = await page.locator('[role="option"]').allInnerTexts();
  console.log(`Women league options: ${JSON.stringify(options)}`);
  
  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // ===== MEN =====
  console.log('\n===== MEN =====');
  
  // Click Männer button
  const menButton = page.locator('.filter-button:has-text("Männer")').first();
  if (await menButton.count() > 0) {
    await menButton.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    console.log('Clicked Männer');
  } else {
    console.log('Männer button not found!');
  }
  
  // Check current state
  currentText = await page.locator('button:has-text("Liga:")').first().innerText();
  console.log(`Current Liga button after Men switch: ${currentText}`);
  
  // Open dropdown for Men
  await page.locator('button:has-text("Liga:")').first().click();
  await page.waitForTimeout(1000);
  
  options = await page.locator('[role="option"]').allInnerTexts();
  console.log(`Men league options: ${JSON.stringify(options)}`);
  
  await page.screenshot({ path: path.join(__dirname, '..', 'data', 'men-dropdown.png') });
  
  // Try to get page content for Men NLA
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Take full page text
  const bodyText = await page.locator('body').innerText();
  console.log('\n--- Page content (first 3000 chars) ---');
  console.log(bodyText.substring(0, 3000));
  
  await browser.close();
  console.log('\nDone');
}

main().catch(console.error);
