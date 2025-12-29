/**
 * DEBUG v6 - Test ranking table extraction
 */

import { chromium } from 'playwright';

function extractTeamsFromRankingTable(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const teams: string[] = [];
  
  // Find the ranking table - look for "Informationen zum Modus" and then the column headers
  let inRankingTable = false;
  let pastHeaders = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Start of ranking table section
    if (line === 'Informationen zum Modus') {
      inRankingTable = true;
      console.log(`Line ${i}: Found "Informationen zum Modus"`);
      continue;
    }
    
    // Skip headers row: Phase: Qualifikation, #, Team, Sp., Pu., etc.
    if (inRankingTable && line === 'BQ') {
      pastHeaders = true;
      console.log(`Line ${i}: Found "BQ" - past headers now`);
      continue;
    }
    
    // End of table - footer elements
    if (pastHeaders && (
      line === 'Premium Partner' ||
      line.includes('Partner') ||
      line === 'Impressum' ||
      line.startsWith('Gruppe')  // For leagues with groups
    )) {
      console.log(`Line ${i}: Found end marker "${line}"`);
      break;
    }
    
    if (pastHeaders) {
      // Rows are: rank, team name, games, points, etc.
      // Team names are strings that don't look like numbers
      if (!line.match(/^[\d.:]+$/) && line.length > 2) {
        // Skip stats like "30 : 11"
        if (!line.includes(' : ')) {
          teams.push(line);
          console.log(`Line ${i}: TEAM: "${line}"`);
        }
      }
    }
  }
  
  return teams;
}

async function main() {
  console.log('DEBUG v6: Ranking table extraction\n');
  
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
  
  const ligaText = await page.locator('button:has-text("Liga:")').first().innerText();
  console.log(`Liga button: ${ligaText}\n`);
  
  const bodyText = await page.locator('body').innerText();
  
  // Check if key markers exist
  console.log(`Has "Informationen zum Modus": ${bodyText.includes('Informationen zum Modus')}`);
  console.log(`Has "BQ": ${bodyText.includes('BQ')}`);
  console.log(`Has "Volley Näfels": ${bodyText.includes('Volley Näfels')}`);
  
  // Run extraction
  console.log('\n--- Extraction ---');
  const teams = extractTeamsFromRankingTable(bodyText);
  console.log(`\nExtracted ${teams.length} teams`);
  
  await browser.close();
}

main().catch(console.error);
