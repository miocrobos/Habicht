import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// New NLB clubs to deep scrape
const clubsToScrape = [
  { name: 'VBC Visp', website: 'https://www.vbc-visp.ch' },
  { name: 'VBC Glaronia', website: 'https://www.vbcglaronia.ch' },
  { name: 'Lutry-Lavaux Volleyball', website: 'https://www.lutry-lavaux-volleyball.ch' },
  { name: 'VBC Aeschi', website: 'https://www.vbcaeschi.ch' },
  { name: 'Volleyball Papiermühle', website: 'https://www.papimuehle.ch' },
];

interface ClubData {
  website?: string;
  email?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  logo?: string;
  // League participation
  hasNLAMen?: boolean;
  hasNLAWomen?: boolean;
  hasNLBMen?: boolean;
  hasNLBWomen?: boolean;
  has1LigaMen?: boolean;
  has1LigaWomen?: boolean;
  has2LigaMen?: boolean;
  has2LigaWomen?: boolean;
  has3LigaMen?: boolean;
  has3LigaWomen?: boolean;
  has4LigaMen?: boolean;
  has4LigaWomen?: boolean;
  has5LigaMen?: boolean;
  has5LigaWomen?: boolean;
  hasU23Men?: boolean;
  hasU23Women?: boolean;
  hasU20Men?: boolean;
  hasU20Women?: boolean;
  hasU18Men?: boolean;
  hasU18Women?: boolean;
}

async function fetchPage(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      console.log(`    HTTP ${response.status} for ${url}`);
      return '';
    }
    
    return await response.text();
  } catch (error: any) {
    console.log(`    Error fetching ${url}: ${error.message}`);
    return '';
  }
}

function extractSocialMedia(html: string, baseUrl: string): Partial<ClubData> {
  const data: Partial<ClubData> = {};
  
  // Facebook
  const fbMatch = html.match(/href=["'](https?:\/\/(www\.)?facebook\.com\/[^"'\s<>]+)["']/i);
  if (fbMatch) data.facebook = fbMatch[1].replace(/\/$/, '');
  
  // Instagram
  const igMatch = html.match(/href=["'](https?:\/\/(www\.)?instagram\.com\/[^"'\s<>]+)["']/i);
  if (igMatch) data.instagram = igMatch[1].replace(/\/$/, '');
  
  // Twitter/X
  const twMatch = html.match(/href=["'](https?:\/\/(www\.)?(twitter|x)\.com\/[^"'\s<>]+)["']/i);
  if (twMatch) data.twitter = twMatch[1].replace(/\/$/, '');
  
  // YouTube
  const ytMatch = html.match(/href=["'](https?:\/\/(www\.)?youtube\.com\/(channel|user|c|@)[^"'\s<>]+)["']/i);
  if (ytMatch) data.youtube = ytMatch[1].replace(/\/$/, '');
  
  // TikTok
  const ttMatch = html.match(/href=["'](https?:\/\/(www\.)?tiktok\.com\/@[^"'\s<>]+)["']/i);
  if (ttMatch) data.tiktok = ttMatch[1].replace(/\/$/, '');
  
  return data;
}

function extractContactInfo(html: string): Partial<ClubData> {
  const data: Partial<ClubData> = {};
  
  // Email - look for mailto links
  const emailMatch = html.match(/href=["']mailto:([^"'\s<>?]+)/i);
  if (emailMatch) data.email = emailMatch[1];
  
  // Phone - look for tel links
  const phoneMatch = html.match(/href=["']tel:([^"'\s<>]+)["']/i);
  if (phoneMatch) data.phone = phoneMatch[1].replace(/\s/g, '');
  
  return data;
}

function extractLogo(html: string, baseUrl: string): string | undefined {
  // Priority order for logo extraction
  const patterns = [
    // Look for logo in common places
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i,
    /<img[^>]+class=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*logo[^"']*["']/i,
    /<img[^>]+alt=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i,
    /class=["'][^"']*logo[^"']*["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i,
    /<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+\.png)["']/i,
    /<link[^>]+href=["']([^"']+\.png)["'][^>]+rel=["']icon["']/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let logoUrl = match[1];
      
      // Skip generic favicons and small icons
      if (logoUrl.includes('favicon') && logoUrl.includes('.ico')) continue;
      if (logoUrl.includes('wix') && logoUrl.includes('pfavico')) continue;
      
      // Make absolute URL
      if (logoUrl.startsWith('//')) {
        logoUrl = 'https:' + logoUrl;
      } else if (logoUrl.startsWith('/')) {
        const base = new URL(baseUrl);
        logoUrl = `${base.protocol}//${base.host}${logoUrl}`;
      } else if (!logoUrl.startsWith('http')) {
        logoUrl = new URL(logoUrl, baseUrl).href;
      }
      
      return logoUrl;
    }
  }
  
  return undefined;
}

function extractLeagues(html: string, clubName: string): Partial<ClubData> {
  const data: Partial<ClubData> = {};
  const htmlLower = html.toLowerCase();
  
  // Look for league mentions in the HTML
  // NLA
  if (/\bnla\b/i.test(html) && /herren|männer|men/i.test(html)) {
    // Check if it's about their team, not just a match against NLA
    if (/herren.*nla|nla.*herren|männer.*nla|nla.*männer/i.test(html)) {
      data.hasNLAMen = true;
    }
  }
  if (/\bnla\b/i.test(html) && /damen|frauen|women/i.test(html)) {
    if (/damen.*nla|nla.*damen|frauen.*nla|nla.*frauen/i.test(html)) {
      data.hasNLAWomen = true;
    }
  }
  
  // NLB - already set, but verify
  if (/\bnlb\b/i.test(html)) {
    if (/herren.*nlb|nlb.*herren|männer.*nlb|nlb.*männer/i.test(html)) {
      data.hasNLBMen = true;
    }
    if (/damen.*nlb|nlb.*damen|frauen.*nlb|nlb.*frauen/i.test(html)) {
      data.hasNLBWomen = true;
    }
  }
  
  // 1. Liga
  if (/1\.?\s*liga/i.test(html)) {
    if (/herren.*1\.?\s*liga|1\.?\s*liga.*herren/i.test(html)) {
      data.has1LigaMen = true;
    }
    if (/damen.*1\.?\s*liga|1\.?\s*liga.*damen/i.test(html)) {
      data.has1LigaWomen = true;
    }
  }
  
  // 2. Liga
  if (/2\.?\s*liga/i.test(html)) {
    if (/herren.*2\.?\s*liga|2\.?\s*liga.*herren|herren\s*\d?\s*[-–]\s*2\.?\s*liga/i.test(html)) {
      data.has2LigaMen = true;
    }
    if (/damen.*2\.?\s*liga|2\.?\s*liga.*damen|damen\s*\d?\s*[-–]\s*2\.?\s*liga/i.test(html)) {
      data.has2LigaWomen = true;
    }
  }
  
  // 3. Liga
  if (/3\.?\s*liga/i.test(html)) {
    if (/herren.*3\.?\s*liga|3\.?\s*liga.*herren/i.test(html)) {
      data.has3LigaMen = true;
    }
    if (/damen.*3\.?\s*liga|3\.?\s*liga.*damen/i.test(html)) {
      data.has3LigaWomen = true;
    }
  }
  
  // 4. Liga
  if (/4\.?\s*liga/i.test(html)) {
    if (/herren.*4\.?\s*liga|4\.?\s*liga.*herren/i.test(html)) {
      data.has4LigaMen = true;
    }
    if (/damen.*4\.?\s*liga|4\.?\s*liga.*damen/i.test(html)) {
      data.has4LigaWomen = true;
    }
  }
  
  // 5. Liga
  if (/5\.?\s*liga/i.test(html)) {
    if (/herren.*5\.?\s*liga|5\.?\s*liga.*herren/i.test(html)) {
      data.has5LigaMen = true;
    }
    if (/damen.*5\.?\s*liga|5\.?\s*liga.*damen/i.test(html)) {
      data.has5LigaWomen = true;
    }
  }
  
  // U23
  if (/u23|u-23|unter\s*23/i.test(html)) {
    if (/junioren.*u23|u23.*junioren|jungs.*u23/i.test(html)) {
      data.hasU23Men = true;
    }
    if (/juniorinnen.*u23|u23.*juniorinnen/i.test(html)) {
      data.hasU23Women = true;
    }
  }
  
  // U20
  if (/u20|u-20|unter\s*20/i.test(html)) {
    if (/junioren.*u20|u20.*junioren/i.test(html)) {
      data.hasU20Men = true;
    }
    if (/juniorinnen.*u20|u20.*juniorinnen/i.test(html)) {
      data.hasU20Women = true;
    }
  }
  
  // U18
  if (/u18|u-18|unter\s*18/i.test(html)) {
    if (/junioren.*u18|u18.*junioren/i.test(html)) {
      data.hasU18Men = true;
    }
    if (/juniorinnen.*u18|u18.*juniorinnen/i.test(html)) {
      data.hasU18Women = true;
    }
  }
  
  return data;
}

async function scrapeClub(name: string, website: string): Promise<Partial<ClubData>> {
  console.log(`\n📡 Scraping ${name}...`);
  console.log(`   Website: ${website}`);
  
  const allData: Partial<ClubData> = {};
  
  // Fetch main page
  const mainHtml = await fetchPage(website);
  if (!mainHtml) {
    console.log('   ❌ Could not fetch main page');
    return allData;
  }
  
  console.log(`   ✓ Fetched main page (${mainHtml.length} bytes)`);
  
  // Extract data from main page
  Object.assign(allData, extractSocialMedia(mainHtml, website));
  Object.assign(allData, extractContactInfo(mainHtml));
  Object.assign(allData, extractLeagues(mainHtml, name));
  
  const logo = extractLogo(mainHtml, website);
  if (logo) allData.logo = logo;
  
  // Try to find and fetch teams/mannschaften page
  const teamPages = ['/teams', '/mannschaften', '/unsere-teams', '/verein/teams', '/club/teams'];
  for (const path of teamPages) {
    const teamUrl = new URL(path, website).href;
    const teamHtml = await fetchPage(teamUrl);
    if (teamHtml && teamHtml.length > 1000) {
      console.log(`   ✓ Found teams page: ${path}`);
      Object.assign(allData, extractLeagues(teamHtml, name));
      Object.assign(allData, extractSocialMedia(teamHtml, website));
      break;
    }
  }
  
  // Try contact page for email/phone
  const contactPages = ['/kontakt', '/contact', '/kontaktieren', '/about'];
  for (const path of contactPages) {
    const contactUrl = new URL(path, website).href;
    const contactHtml = await fetchPage(contactUrl);
    if (contactHtml && contactHtml.length > 500) {
      console.log(`   ✓ Found contact page: ${path}`);
      const contactInfo = extractContactInfo(contactHtml);
      if (contactInfo.email && !allData.email) allData.email = contactInfo.email;
      if (contactInfo.phone && !allData.phone) allData.phone = contactInfo.phone;
      Object.assign(allData, extractSocialMedia(contactHtml, website));
      break;
    }
  }
  
  return allData;
}

async function main() {
  console.log('=== Deep Scrape New NLB Clubs ===\n');
  
  for (const clubInfo of clubsToScrape) {
    const scrapedData = await scrapeClub(clubInfo.name, clubInfo.website);
    
    // Get current club from database
    const club = await prisma.club.findFirst({
      where: { name: clubInfo.name }
    });
    
    if (!club) {
      console.log(`   ❌ Club not found in database: ${clubInfo.name}`);
      continue;
    }
    
    // Prepare update data (only set what we found and isn't already set)
    const updateData: any = {};
    
    // Social media
    if (scrapedData.facebook && !club.facebook) updateData.facebook = scrapedData.facebook;
    if (scrapedData.instagram && !club.instagram) updateData.instagram = scrapedData.instagram;
    if (scrapedData.twitter && !club.twitter) updateData.twitter = scrapedData.twitter;
    if (scrapedData.youtube && !club.youtube) updateData.youtube = scrapedData.youtube;
    if (scrapedData.tiktok && !club.tiktok) updateData.tiktok = scrapedData.tiktok;
    
    // Contact info
    if (scrapedData.email && !club.email) updateData.email = scrapedData.email;
    if (scrapedData.phone && !club.phone) updateData.phone = scrapedData.phone;
    
    // Logo
    if (scrapedData.logo && !club.logo) updateData.logo = scrapedData.logo;
    
    // League participation (additive - don't remove existing flags)
    if (scrapedData.hasNLAMen) updateData.hasNLAMen = true;
    if (scrapedData.hasNLAWomen) updateData.hasNLAWomen = true;
    if (scrapedData.hasNLBMen) updateData.hasNLBMen = true;
    if (scrapedData.hasNLBWomen) updateData.hasNLBWomen = true;
    if (scrapedData.has1LigaMen) updateData.has1LigaMen = true;
    if (scrapedData.has1LigaWomen) updateData.has1LigaWomen = true;
    if (scrapedData.has2LigaMen) updateData.has2LigaMen = true;
    if (scrapedData.has2LigaWomen) updateData.has2LigaWomen = true;
    if (scrapedData.has3LigaMen) updateData.has3LigaMen = true;
    if (scrapedData.has3LigaWomen) updateData.has3LigaWomen = true;
    if (scrapedData.has4LigaMen) updateData.has4LigaMen = true;
    if (scrapedData.has4LigaWomen) updateData.has4LigaWomen = true;
    if (scrapedData.has5LigaMen) updateData.has5LigaMen = true;
    if (scrapedData.has5LigaWomen) updateData.has5LigaWomen = true;
    if (scrapedData.hasU23Men) updateData.hasU23Men = true;
    if (scrapedData.hasU23Women) updateData.hasU23Women = true;
    if (scrapedData.hasU20Men) updateData.hasU20Men = true;
    if (scrapedData.hasU20Women) updateData.hasU20Women = true;
    if (scrapedData.hasU18Men) updateData.hasU18Men = true;
    if (scrapedData.hasU18Women) updateData.hasU18Women = true;
    
    // Update database
    if (Object.keys(updateData).length > 0) {
      await prisma.club.update({
        where: { id: club.id },
        data: updateData
      });
      
      console.log(`\n   📝 Updated ${clubInfo.name}:`);
      for (const [key, value] of Object.entries(updateData)) {
        if (typeof value === 'string' && value.length > 60) {
          console.log(`      ${key}: ${value.substring(0, 60)}...`);
        } else {
          console.log(`      ${key}: ${value}`);
        }
      }
    } else {
      console.log(`\n   ℹ️ No new data to update for ${clubInfo.name}`);
    }
  }
  
  // Final summary
  console.log('\n\n=== Final Club Data Summary ===\n');
  
  for (const clubInfo of clubsToScrape) {
    const club = await prisma.club.findFirst({
      where: { name: clubInfo.name }
    });
    
    if (club) {
      console.log(`\n${club.name}:`);
      console.log(`  Location: ${club.town}, ${club.canton}`);
      console.log(`  Website: ${club.website || 'none'}`);
      console.log(`  Email: ${club.email || 'none'}`);
      console.log(`  Phone: ${club.phone || 'none'}`);
      console.log(`  Logo: ${club.logo ? 'YES' : 'none'}`);
      console.log(`  Social Media:`);
      console.log(`    Facebook: ${club.facebook ? 'YES' : 'no'}`);
      console.log(`    Instagram: ${club.instagram ? 'YES' : 'no'}`);
      console.log(`    YouTube: ${club.youtube ? 'YES' : 'no'}`);
      console.log(`    TikTok: ${club.tiktok ? 'YES' : 'no'}`);
      console.log(`  Leagues:`);
      
      const leagues: string[] = [];
      if (club.hasNLAMen) leagues.push('NLA Men');
      if (club.hasNLAWomen) leagues.push('NLA Women');
      if (club.hasNLBMen) leagues.push('NLB Men');
      if (club.hasNLBWomen) leagues.push('NLB Women');
      if (club.has1LigaMen) leagues.push('1L Men');
      if (club.has1LigaWomen) leagues.push('1L Women');
      if (club.has2LigaMen) leagues.push('2L Men');
      if (club.has2LigaWomen) leagues.push('2L Women');
      if (club.has3LigaMen) leagues.push('3L Men');
      if (club.has3LigaWomen) leagues.push('3L Women');
      if (club.has4LigaMen) leagues.push('4L Men');
      if (club.has4LigaWomen) leagues.push('4L Women');
      if (club.has5LigaMen) leagues.push('5L Men');
      if (club.has5LigaWomen) leagues.push('5L Women');
      if (club.hasU23Men) leagues.push('U23 Men');
      if (club.hasU23Women) leagues.push('U23 Women');
      if (club.hasU20Men) leagues.push('U20 Men');
      if (club.hasU20Women) leagues.push('U20 Women');
      if (club.hasU18Men) leagues.push('U18 Men');
      if (club.hasU18Women) leagues.push('U18 Women');
      
      console.log(`    ${leagues.join(', ') || 'none'}`);
    }
  }
  
  await prisma.$disconnect();
}

main();
