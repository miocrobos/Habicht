/**
 * DEBUG v4 - Check what happens after selecting 1L
 */

import { chromium } from 'playwright';
import * as path from 'path';

function extractTeamsFromText(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  let inTeamsSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'Teams ausblenden' || line === 'Teams einblenden') {
      inTeamsSection = true;
      continue;
    }
    
    if (inTeamsSection && (
      line === 'Spielplan' || 
      line === 'Rangliste' || 
      line.startsWith('Zu den') ||
      line.match(/^\d{2}\.\d{2}\.\d{2}/)
    )) {
      break;
    }
    
    if (inTeamsSection && line.length > 2) {
      if (!['Teams', 'Teams ausblenden', 'Teams einblenden'].includes(line)) {
        teams.push(line);
      }
    }
  }
  
  return teams;
}

async function main() {
  console.log('DEBUG v4: League selection\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // Navigate to Game Center
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Default Women NLA
  console.log('=== DEFAULT (Women NLA) ===');
  let bodyText = await page.locator('body').innerText();
  let teams = extractTeamsFromText(bodyText);
  console.log(`Teams found: ${teams.length} - ${teams.join(', ')}`);
  
  // Try to select NLB
  console.log('\n=== Selecting NLB ===');
  const ligaButton = page.locator('button:has-text("Liga:")').first();
  console.log(`Liga button exists: ${await ligaButton.count() > 0}`);
  await ligaButton.click();
  await page.waitForTimeout(1000);
  
  // Check options
  const nlbOption = page.locator('[role="option"]:has-text("NLB")').first();
  console.log(`NLB option exists: ${await nlbOption.count() > 0}`);
  await nlbOption.click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  
  // Check current Liga button
  const currentLiga = await page.locator('button:has-text("Liga:")').first().innerText();
  console.log(`Current Liga button text: "${currentLiga}"`);
  
  bodyText = await page.locator('body').innerText();
  teams = extractTeamsFromText(bodyText);
  console.log(`Teams found: ${teams.length} - ${teams.join(', ')}`);
  
  // Now try 1L
  console.log('\n=== Selecting 1L ===');
  const ligaButton2 = page.locator('button:has-text("Liga:")').first();
  await ligaButton2.click();
  await page.waitForTimeout(1000);
  
  // Check what options exist now
  const optionTexts = await page.locator('[role="option"]').allInnerTexts();
  console.log(`Available options: ${JSON.stringify(optionTexts)}`);
  
  const option1L = page.locator('[role="option"]:has-text("1L")').first();
  console.log(`1L option exists: ${await option1L.count() > 0}`);
  
  if (await option1L.count() > 0) {
    await option1L.click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    const currentLiga2 = await page.locator('button:has-text("Liga:")').first().innerText();
    console.log(`Current Liga button text after 1L: "${currentLiga2}"`);
    
    bodyText = await page.locator('body').innerText();
    
    // Check if Teams section exists
    const hasTeamsSection = bodyText.includes('Teams ausblenden') || bodyText.includes('Teams einblenden');
    console.log(`Has Teams section: ${hasTeamsSection}`);
    
    // Save page text
    const fs = require('fs');
    fs.writeFileSync(path.join(__dirname, '..', 'data', '1L-page-text.txt'), bodyText, 'utf-8');
    console.log('Saved page text to data/1L-page-text.txt');
    
    await page.screenshot({ path: path.join(__dirname, '..', 'data', '1L-screenshot.png'), fullPage: true });
    console.log('Saved screenshot');
    
    teams = extractTeamsFromText(bodyText);
    console.log(`Teams found: ${teams.length} - ${teams.join(', ')}`);
  }
  
  await browser.close();
}

main().catch(console.error);
