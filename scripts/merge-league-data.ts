/**
 * Merge scraped league data with consolidated club data
 * Creates final swiss-volleyball-leagues-final.json
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// Load all data sources
const consolidatedData = JSON.parse(fs.readFileSync(path.join(dataDir, 'swiss-volleyball-consolidated.json'), 'utf-8'));
const scrapedLeagues = JSON.parse(fs.readFileSync(path.join(dataDir, 'clubs-leagues-fast.json'), 'utf-8'));
const clubWebsites = JSON.parse(fs.readFileSync(path.join(dataDir, 'club-websites.json'), 'utf-8'));

console.log(`Consolidated clubs: ${consolidatedData.clubs.length}`);
console.log(`Scraped results: ${scrapedLeagues.results.length}`);
console.log(`Club websites: ${Object.keys(clubWebsites).length}`);

// Create a map of scraped data by club name (normalized)
const scrapedByName = new Map();
for (const result of scrapedLeagues.results) {
  const normalizedName = result.name.toLowerCase().trim();
  scrapedByName.set(normalizedName, result);
}

// Create a map of websites by club name
const websitesByName = new Map();
for (const club of Object.values(clubWebsites)) {
  const normalizedName = (club as any).name.toLowerCase().trim();
  websitesByName.set(normalizedName, (club as any).website);
}

// Merge data
const mergedClubs = consolidatedData.clubs.map((club: any) => {
  const normalizedName = club.name.toLowerCase().trim();
  const scraped = scrapedByName.get(normalizedName);
  const website = websitesByName.get(normalizedName);
  
  // Start with existing data
  const merged = { ...club };
  
  // Add website if not present
  if (website && !merged.website) {
    merged.website = website;
  }
  
  // Add scraped leagues
  if (scraped && scraped.leaguesFound && scraped.leaguesFound.length > 0) {
    merged.leaguesFromWebsite = scraped.leaguesFound;
    
    // Parse specific leagues
    if (!merged.specificLeagues) {
      merged.specificLeagues = {};
    }
    
    for (const league of scraped.leaguesFound) {
      const l = league.toUpperCase();
      // We don't know gender from simple scraping, so mark as generic
      if (l === 'NLA') merged.hasNLA = true;
      if (l === 'NLB') merged.hasNLB = true;
      if (l === '1L' || l === '1.LIGA') merged.has1L = true;
      if (l === '2L') merged.has2L = true;
      if (l === '3L') merged.has3L = true;
      if (l === '4L') merged.has4L = true;
      if (l === '5L') merged.has5L = true;
    }
  }
  
  return merged;
});

// Calculate statistics
const stats = {
  totalClubs: mergedClubs.length,
  withWebsite: mergedClubs.filter((c: any) => c.website).length,
  withLeagues: mergedClubs.filter((c: any) => c.leaguesFromWebsite && c.leaguesFromWebsite.length > 0).length,
  withNLANLBSpecific: mergedClubs.filter((c: any) => c.specificLeagues && 
    (c.specificLeagues.womenNLA || c.specificLeagues.menNLA || 
     c.specificLeagues.womenNLB || c.specificLeagues.menNLB)).length,
  
  leaguePresence: {
    NLA: mergedClubs.filter((c: any) => c.hasNLA || c.specificLeagues?.womenNLA || c.specificLeagues?.menNLA).length,
    NLB: mergedClubs.filter((c: any) => c.hasNLB || c.specificLeagues?.womenNLB || c.specificLeagues?.menNLB).length,
    '1L': mergedClubs.filter((c: any) => c.has1L).length,
    '2L': mergedClubs.filter((c: any) => c.has2L).length,
    '3L': mergedClubs.filter((c: any) => c.has3L).length,
    '4L': mergedClubs.filter((c: any) => c.has4L).length,
    '5L': mergedClubs.filter((c: any) => c.has5L).length,
  },
  
  // Count from original consolidated data (NLA/NLB by gender)
  genderSpecific: {
    womenNLA: mergedClubs.filter((c: any) => c.specificLeagues?.womenNLA).length,
    womenNLB: mergedClubs.filter((c: any) => c.specificLeagues?.womenNLB).length,
    menNLA: mergedClubs.filter((c: any) => c.specificLeagues?.menNLA).length,
    menNLB: mergedClubs.filter((c: any) => c.specificLeagues?.menNLB).length,
  }
};

// Save final output
const output = {
  generatedAt: new Date().toISOString(),
  sources: [
    'Swiss Volley Verein Suchen',
    'Swiss Volley Game Center (NLA/NLB)',
    'Club official websites (scraped)'
  ],
  statistics: stats,
  notes: [
    'NLA/NLB gender-specific data from Game Center',
    'Lower league (1L-5L) data from club website scraping',
    'Some clubs have league info not available (website errors or no league info on site)',
    'League presence does not indicate gender - only that the club has teams at that level',
    `Scraped ${scrapedLeagues.stats.success} of ${scrapedLeagues.stats.total} club websites successfully`
  ],
  clubs: mergedClubs
};

const outputPath = path.join(dataDir, 'swiss-volleyball-leagues-final.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('\n========================================');
console.log('MERGE COMPLETE');
console.log('========================================');
console.log(`Total clubs: ${stats.totalClubs}`);
console.log(`With website: ${stats.withWebsite}`);
console.log(`With league info from website: ${stats.withLeagues}`);
console.log(`With NLA/NLB gender-specific: ${stats.withNLANLBSpecific}`);
console.log('\nLeague presence (clubs with teams at level):');
console.log(`  NLA: ${stats.leaguePresence.NLA}`);
console.log(`  NLB: ${stats.leaguePresence.NLB}`);
console.log(`  1L: ${stats.leaguePresence['1L']}`);
console.log(`  2L: ${stats.leaguePresence['2L']}`);
console.log(`  3L: ${stats.leaguePresence['3L']}`);
console.log(`  4L: ${stats.leaguePresence['4L']}`);
console.log(`  5L: ${stats.leaguePresence['5L']}`);
console.log('\nGender-specific (from Game Center):');
console.log(`  Women NLA: ${stats.genderSpecific.womenNLA}`);
console.log(`  Women NLB: ${stats.genderSpecific.womenNLB}`);
console.log(`  Men NLA: ${stats.genderSpecific.menNLA}`);
console.log(`  Men NLB: ${stats.genderSpecific.menNLB}`);
console.log(`\nOutput: ${outputPath}`);
