/**
 * Fast league scraper - scrapes main page only, no navigation
 * Designed to process all 254 clubs quickly
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

interface ClubWebsite {
  id: string;
  name: string;
  website: string;
}

interface ScrapedResult {
  id: string;
  name: string;
  website: string;
  leaguesFound: string[];
  pageTitle?: string;
  scrapedAt: string;
  error?: string;
}

// Simple league detection patterns
const LEAGUE_REGEX = /\b(NLA|NLB|1\.\s*Liga|2\.\s*Liga|3\.\s*Liga|4\.\s*Liga|5\.\s*Liga)\b/gi;

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const websitesFile = path.join(dataDir, 'club-websites.json');
  const outputFile = path.join(dataDir, 'clubs-leagues-fast.json');
  
  const websitesData: Record<string, ClubWebsite> = JSON.parse(fs.readFileSync(websitesFile, 'utf-8'));
  const clubs = Object.values(websitesData);
  console.log(`Processing ${clubs.length} clubs...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    locale: 'de-CH'
  });
  
  const results: ScrapedResult[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Process in batches of 5 for speed
  const batchSize = 5;
  
  for (let i = 0; i < clubs.length; i += batchSize) {
    const batch = clubs.slice(i, i + batchSize);
    console.log(`\nBatch ${Math.floor(i/batchSize) + 1}/${Math.ceil(clubs.length/batchSize)} (clubs ${i+1}-${Math.min(i+batchSize, clubs.length)})`);
    
    const batchPromises = batch.map(async (club) => {
      const page = await context.newPage();
      const result: ScrapedResult = {
        id: club.id,
        name: club.name,
        website: club.website,
        leaguesFound: [],
        scrapedAt: new Date().toISOString()
      };
      
      try {
        await page.goto(club.website, { 
          waitUntil: 'domcontentloaded', 
          timeout: 10000 
        });
        
        const text = await page.evaluate(() => document.body?.innerText || '');
        const title = await page.title();
        
        result.pageTitle = title;
        
        // Find all league mentions
        const matches = text.match(LEAGUE_REGEX);
        if (matches) {
          const uniqueLeagues = [...new Set(matches.map(m => 
            m.replace(/\s+/g, '').replace('.Liga', 'L').toUpperCase()
          ))];
          result.leaguesFound = uniqueLeagues;
        }
        
        successCount++;
      } catch (error: any) {
        result.error = error.message?.substring(0, 50);
        errorCount++;
      } finally {
        await page.close();
      }
      
      return result;
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Log batch results
    for (const r of batchResults) {
      const status = r.error ? '❌' : r.leaguesFound.length > 0 ? '✓' : '○';
      console.log(`  ${status} ${r.name}: ${r.leaguesFound.join(', ') || (r.error ? 'error' : 'no leagues')}`);
    }
  }
  
  await browser.close();
  
  // Calculate stats
  const stats = {
    total: results.length,
    success: successCount,
    errors: errorCount,
    withLeagues: results.filter(r => r.leaguesFound.length > 0).length,
    byLeague: {
      NLA: results.filter(r => r.leaguesFound.includes('NLA')).length,
      NLB: results.filter(r => r.leaguesFound.includes('NLB')).length,
      '1L': results.filter(r => r.leaguesFound.includes('1L')).length,
      '2L': results.filter(r => r.leaguesFound.includes('2L')).length,
      '3L': results.filter(r => r.leaguesFound.includes('3L')).length,
      '4L': results.filter(r => r.leaguesFound.includes('4L')).length,
      '5L': results.filter(r => r.leaguesFound.includes('5L')).length
    }
  };
  
  fs.writeFileSync(outputFile, JSON.stringify({ results, stats, scrapedAt: new Date().toISOString() }, null, 2));
  
  console.log('\n========================================');
  console.log('COMPLETE');
  console.log('========================================');
  console.log(`Total: ${stats.total} | Success: ${stats.success} | Errors: ${stats.errors}`);
  console.log(`With leagues: ${stats.withLeagues}`);
  console.log(`NLA: ${stats.byLeague.NLA} | NLB: ${stats.byLeague.NLB}`);
  console.log(`1L: ${stats.byLeague['1L']} | 2L: ${stats.byLeague['2L']} | 3L: ${stats.byLeague['3L']}`);
  console.log(`4L: ${stats.byLeague['4L']} | 5L: ${stats.byLeague['5L']}`);
  console.log(`\nOutput: ${outputFile}`);
}

main().catch(console.error);
