/**
 * DEBUG v5 - Check what's different between NLA and 1L pages
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('DEBUG v5: Compare NLA vs 1L page content\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // Navigate to Game Center - Men
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Switch to Men
  await page.locator('.filter-button:has-text("Männer")').first().click();
  await page.waitForTimeout(3000);
  
  // Men NLA (default)
  console.log('=== MEN NLA (default) ===');
  let bodyText = await page.locator('body').innerText();
  let ligaText = await page.locator('button:has-text("Liga:")').first().innerText();
  console.log(`Liga button: ${ligaText}`);
  
  // Find Rangliste section
  const rankingStart = bodyText.indexOf('Rangliste');
  const rankingSection = bodyText.substring(rankingStart, rankingStart + 1500);
  console.log('Ranking table (NLA):');
  console.log(rankingSection);
  
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'men-nla-page.txt'), bodyText, 'utf-8');
  
  // Now select NLB  
  console.log('\n\n=== MEN NLB ===');
  let ligaButton = page.locator('button:has-text("Liga:")').first();
  await ligaButton.click();
  await page.waitForTimeout(1000);
  await page.locator('[role="option"]:has-text("NLB")').first().click();
  await page.waitForTimeout(3000);
  
  bodyText = await page.locator('body').innerText();
  ligaText = await page.locator('button:has-text("Liga:")').first().innerText();
  console.log(`Liga button: ${ligaText}`);
  
  const rankingStart2 = bodyText.indexOf('Rangliste');
  const rankingSection2 = bodyText.substring(rankingStart2, rankingStart2 + 1500);
  console.log('Ranking table (NLB):');
  console.log(rankingSection2);
  
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'men-nlb-page.txt'), bodyText, 'utf-8');
  
  await browser.close();
}

main().catch(console.error);
