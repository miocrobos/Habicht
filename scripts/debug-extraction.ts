/**
 * DEBUG v3 - Test team extraction from actual page text
 */

import { chromium } from 'playwright';

function extractTeamsFromText(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  let inTeamsSection = false;
  
  console.log('\n--- Scanning lines ---');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'Teams ausblenden' || line === 'Teams einblenden') {
      inTeamsSection = true;
      console.log(`Line ${i}: FOUND marker "${line}" - starting team section`);
      continue;
    }
    
    if (inTeamsSection && (
      line === 'Spielplan' || 
      line === 'Rangliste' || 
      line.startsWith('Zu den') ||
      line.match(/^\d{2}\.\d{2}\.\d{2}/)
    )) {
      console.log(`Line ${i}: FOUND end marker "${line}" - stopping`);
      break;
    }
    
    if (inTeamsSection && line.length > 2) {
      if (!['Teams', 'Teams ausblenden', 'Teams einblenden'].includes(line)) {
        teams.push(line);
        console.log(`Line ${i}: TEAM: "${line}"`);
      }
    }
  }
  
  return teams;
}

async function main() {
  console.log('DEBUG v3: Test team extraction\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  
  // Navigate to Game Center
  await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Switch to Men
  await page.locator('.filter-button:has-text("Männer")').first().click();
  await page.waitForTimeout(3000);
  await page.waitForLoadState('networkidle');
  
  // Get body text
  const bodyText = await page.locator('body').innerText();
  
  // Find "Teams" section in text
  const teamsIdx = bodyText.indexOf('Teams');
  console.log(`"Teams" found at index: ${teamsIdx}`);
  console.log('\n--- Text around Teams section ---');
  console.log(bodyText.substring(Math.max(0, teamsIdx - 50), teamsIdx + 500));
  
  // Try extraction
  const teams = extractTeamsFromText(bodyText);
  console.log(`\n\nExtracted ${teams.length} teams: ${teams.join(', ')}`);
  
  await browser.close();
}

main().catch(console.error);
