/**
 * Clean league data to only keep valid Swiss volleyball leagues
 * Removes team names like "Frauen 1", "Männer 2" and keeps only actual leagues
 */

import * as fs from 'fs';
import * as path from 'path';

// Valid Swiss volleyball league patterns
const VALID_LEAGUES = new Set([
  'NLA', 'NLB',
  '1L', '2L', '3L', '4L', '5L',
  'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U21', 'U23'
]);

interface LeagueInfo {
  league: string;
  gender: 'men' | 'women' | 'unknown';
  category: 'senior' | 'youth';
  raw: string;
}

interface ClubLeagues {
  name: string;
  website: string;
  leagues: LeagueInfo[];
  pagesChecked: string[];
  success: boolean;
  error?: string;
}

function normalizeLeague(league: string): string | null {
  const upper = league.toUpperCase().replace(/\s+/g, '');
  
  // NLA/NLB
  if (upper === 'NLA' || upper.includes('NATIONALLIGAA')) return 'NLA';
  if (upper === 'NLB' || upper.includes('NATIONALLIGAB')) return 'NLB';
  
  // Numbered leagues (1L-5L)
  const ligaMatch = upper.match(/^([1-5])\.?L(?:IGA)?$/);
  if (ligaMatch) return `${ligaMatch[1]}L`;
  
  // Check for "1. Liga", "2. Liga" etc in raw
  const dotLigaMatch = league.match(/([1-5])\.\s*Liga/i);
  if (dotLigaMatch) return `${dotLigaMatch[1]}L`;
  
  // Youth categories
  const youthMatch = upper.match(/^U(13|14|15|16|17|18|19|21|23)$/);
  if (youthMatch) return `U${youthMatch[1]}`;
  
  return null;
}

function isValidLeague(league: string): boolean {
  const normalized = normalizeLeague(league);
  return normalized !== null && VALID_LEAGUES.has(normalized);
}

async function main() {
  console.log('🧹 Cleaning league data...\n');
  
  const inputPath = path.join(__dirname, '../data/club-leagues-thorough.json');
  const outputPath = path.join(__dirname, '../data/club-leagues-cleaned.json');
  
  const data: ClubLeagues[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  
  console.log(`Loaded ${data.length} clubs\n`);
  
  let totalRemoved = 0;
  let totalKept = 0;
  const removedExamples: string[] = [];
  
  const cleanedData = data.map(club => {
    const originalCount = club.leagues.length;
    
    // Filter to only valid leagues and normalize
    const cleanedLeagues = club.leagues
      .filter(l => {
        const normalized = normalizeLeague(l.league);
        if (normalized === null) {
          if (removedExamples.length < 20) {
            removedExamples.push(`${club.name}: "${l.league}" (${l.raw})`);
          }
          return false;
        }
        return true;
      })
      .map(l => ({
        ...l,
        league: normalizeLeague(l.league)!
      }));
    
    // Deduplicate by league + gender
    const seen = new Set<string>();
    const deduped = cleanedLeagues.filter(l => {
      const key = `${l.league}-${l.gender}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    totalRemoved += originalCount - deduped.length;
    totalKept += deduped.length;
    
    return {
      ...club,
      leagues: deduped
    };
  });
  
  // Save cleaned data
  fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2));
  
  // Statistics
  const clubsWithLeagues = cleanedData.filter(c => c.leagues.length > 0).length;
  
  console.log('=== CLEANING RESULTS ===');
  console.log(`Clubs processed: ${data.length}`);
  console.log(`Clubs with valid leagues: ${clubsWithLeagues}`);
  console.log(`Total league entries kept: ${totalKept}`);
  console.log(`Total entries removed: ${totalRemoved}`);
  
  console.log('\n=== EXAMPLES OF REMOVED ENTRIES ===');
  removedExamples.forEach(ex => console.log(`  - ${ex}`));
  
  // League distribution
  const leagueCounts: Record<string, { men: number; women: number; unknown: number }> = {};
  
  for (const club of cleanedData) {
    for (const league of club.leagues) {
      if (!leagueCounts[league.league]) {
        leagueCounts[league.league] = { men: 0, women: 0, unknown: 0 };
      }
      leagueCounts[league.league][league.gender]++;
    }
  }
  
  console.log('\n=== LEAGUE DISTRIBUTION ===');
  const leagueOrder = ['NLA', 'NLB', '1L', '2L', '3L', '4L', '5L', 'U23', 'U21', 'U19', 'U18', 'U17', 'U16', 'U15', 'U14', 'U13'];
  
  for (const league of leagueOrder) {
    if (leagueCounts[league]) {
      const c = leagueCounts[league];
      console.log(`  ${league}: Men=${c.men}, Women=${c.women}, Unknown=${c.unknown}`);
    }
  }
  
  console.log(`\n✅ Cleaned data saved to: ${outputPath}`);
}

main().catch(console.error);
