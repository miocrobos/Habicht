/**
 * DEBUG - Analyze Game Center page structure
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('DEBUG: Page Structure Analysis\n');
  
  const browser = await chromium.launch({ headless: false }); // Show browser
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Get all buttons
  console.log('=== BUTTONS ===');
  const buttons = await page.locator('button').all();
  for (let i = 0; i < Math.min(buttons.length, 30); i++) {
    const text = await buttons[i].innerText();
    if (text.trim()) {
      console.log(`Button ${i}: "${text.substring(0, 50)}"`);
    }
  }
  
  // Get all links with potential navigation
  console.log('\n=== NAVIGATION LINKS ===');
  const navLinks = await page.locator('a, [role="button"]').all();
  for (let i = 0; i < Math.min(navLinks.length, 50); i++) {
    const text = await navLinks[i].innerText();
    if (text.trim() && text.includes('Nachwuchs')) {
      console.log(`Found Nachwuchs: "${text}"`);
    }
  }
  
  // Look for text containing Nachwuchs
  const bodyText = await page.locator('body').innerText();
  if (bodyText.includes('Nachwuchs')) {
    const idx = bodyText.indexOf('Nachwuchs');
    console.log('\n=== NACHWUCHS CONTEXT ===');
    console.log(bodyText.substring(Math.max(0, idx - 100), idx + 100));
  }
  
  // Try clicking on different areas
  console.log('\n=== TRYING TO FIND NACHWUCHS ===');
  
  // Check if it's in a div or tab
  const nachwuchsElements = await page.locator('text=Nachwuchs').all();
  console.log(`Found ${nachwuchsElements.length} elements with text 'Nachwuchs'`);
  
  for (let i = 0; i < nachwuchsElements.length; i++) {
    const el = nachwuchsElements[i];
    const tagName = await el.evaluate(e => e.tagName);
    const className = await el.getAttribute('class');
    console.log(`  ${i}: <${tagName}> class="${className}"`);
  }
  
  // If we find a clickable one, click it
  if (nachwuchsElements.length > 0) {
    console.log('\nClicking first Nachwuchs element...');
    await nachwuchsElements[0].click();
    await page.waitForTimeout(3000);
    
    // Check Liga options now
    const ligaButton = page.locator('button:has-text("Liga:")').first();
    if (await ligaButton.count() > 0) {
      await ligaButton.click();
      await page.waitForTimeout(1000);
      
      const ligaOptions = await page.locator('[role="option"]').allInnerTexts();
      console.log(`\nLiga options after Nachwuchs: ${JSON.stringify(ligaOptions)}`);
    }
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(console.error);
