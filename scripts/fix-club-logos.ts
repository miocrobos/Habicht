/**
 * Fix Club Logos Script
 * 
 * This script:
 * 1. Removes broken logos (404/403 errors)
 * 2. Replaces Instagram/social media logos with real ones from club websites
 * 3. Checks large images and replaces if they're photos, not logos
 * 
 * Fetches actual logos from club websites (favicon, apple-touch-icon, og:image, etc.)
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as https from 'https'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

interface LogoFix {
  clubId: string
  clubName: string
  oldLogo: string
  newLogo: string | null
  website: string | null
  action: 'replaced' | 'removed' | 'unchanged' | 'failed'
  reason: string
}

// Clubs with broken logos (404/403)
const BROKEN_LOGO_CLUBS = [
  'Pallavolo-Novaggio-Bedigliora',
  'VBC Chatel-St-Denis',
  'VBC Eburo',
  'VBC Küssnacht',
  'VBC Meggen',
  'VBC Sixieme 7',
  'VBR Rickenbach',
  'Volleyball-Club Volketswil',
]

// Clubs with Instagram logos (high risk)
const INSTAGRAM_LOGO_CLUBS = [
  'Infomaniak Genève Volley',
  'TS Volero Zürich',
  'Turnverein Horgen',
  'VBC Lignieres',
  'Volley Bern',
]

// Clubs with large images (might be photos)
const LARGE_IMAGE_CLUBS = [
  'VBC Littau',
  'TSV Rechthalten',
  'SV Volley Lengnau',
]

// Common logo paths to check on websites
const LOGO_PATHS = [
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/apple-touch-icon-180x180.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-144x144.png',
  '/apple-touch-icon-120x120.png',
  '/favicon-192x192.png',
  '/favicon-96x96.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/logo.png',
  '/logo.svg',
  '/images/logo.png',
  '/img/logo.png',
  '/assets/logo.png',
  '/favicon.ico',
]

async function fetchWithTimeout(url: string, timeout: number = 10000): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })
    return response.data
  } catch (error) {
    return null
  }
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    return true
  } catch {
    // Try GET if HEAD fails
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        responseType: 'arraybuffer',
        validateStatus: (status) => status < 400,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      return true
    } catch {
      return false
    }
  }
}

async function getImageSize(url: string): Promise<number | null> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      responseType: 'arraybuffer',
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    return response.data.length
  } catch {
    return null
  }
}

function resolveUrl(base: string, path: string): string {
  try {
    return new URL(path, base).href
  } catch {
    return path
  }
}

async function findLogoFromWebsite(websiteUrl: string): Promise<string | null> {
  if (!websiteUrl) return null

  console.log(`    Searching for logo on ${websiteUrl}...`)

  // First, try common logo paths
  for (const path of LOGO_PATHS) {
    const logoUrl = resolveUrl(websiteUrl, path)
    const exists = await checkUrlExists(logoUrl)
    if (exists) {
      // Check if it's a reasonable size for a logo (not too small, not too big)
      const size = await getImageSize(logoUrl)
      if (size && size > 100 && size < 500000) {
        console.log(`    ✓ Found logo at ${path} (${Math.round(size / 1024)}KB)`)
        return logoUrl
      }
    }
  }

  // If no common paths work, try parsing the HTML
  const html = await fetchWithTimeout(websiteUrl)
  if (!html) {
    console.log(`    ✗ Could not fetch website HTML`)
    return null
  }

  const $ = cheerio.load(html)

  // Try various meta tags and link elements
  const logoSelectors = [
    // Apple touch icons
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    // Standard favicons
    'link[rel="icon"][sizes="192x192"]',
    'link[rel="icon"][sizes="180x180"]',
    'link[rel="icon"][sizes="144x144"]',
    'link[rel="icon"][sizes="96x96"]',
    'link[rel="icon"][sizes="32x32"]',
    'link[rel="shortcut icon"]',
    'link[rel="icon"]',
    // Open Graph
    'meta[property="og:image"]',
    // Twitter
    'meta[name="twitter:image"]',
    // Common logo elements
    'img.logo',
    'img#logo',
    '.logo img',
    '#logo img',
    'header img',
    '.header img',
    'a.logo img',
    '.navbar-brand img',
    '.site-logo img',
  ]

  for (const selector of logoSelectors) {
    const element = $(selector).first()
    if (element.length) {
      let logoUrl = element.attr('href') || element.attr('content') || element.attr('src')
      if (logoUrl) {
        logoUrl = resolveUrl(websiteUrl, logoUrl)
        
        // Check if it's accessible and reasonable size
        const exists = await checkUrlExists(logoUrl)
        if (exists) {
          const size = await getImageSize(logoUrl)
          // Skip very small icons and very large images
          if (size && size > 100 && size < 500000) {
            console.log(`    ✓ Found logo via ${selector} (${Math.round(size / 1024)}KB)`)
            return logoUrl
          }
        }
      }
    }
  }

  console.log(`    ✗ No suitable logo found`)
  return null
}

async function fixBrokenLogos(): Promise<LogoFix[]> {
  console.log('\n🔧 FIXING BROKEN LOGOS (404/403)\n')
  const fixes: LogoFix[] = []

  for (const clubName of BROKEN_LOGO_CLUBS) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
      select: { id: true, name: true, logo: true, website: true },
    })

    if (!club) {
      console.log(`  ⚠ Club not found: ${clubName}`)
      continue
    }

    console.log(`  Processing: ${club.name}`)

    // Try to find a new logo from the website
    let newLogo: string | null = null
    if (club.website) {
      newLogo = await findLogoFromWebsite(club.website)
    }

    if (newLogo) {
      // Update with new logo
      await prisma.club.update({
        where: { id: club.id },
        data: { logo: newLogo },
      })
      console.log(`    ✓ Replaced with new logo from website`)
      fixes.push({
        clubId: club.id,
        clubName: club.name,
        oldLogo: club.logo || '',
        newLogo,
        website: club.website,
        action: 'replaced',
        reason: 'Broken logo replaced with website logo',
      })
    } else {
      // Remove broken logo
      await prisma.club.update({
        where: { id: club.id },
        data: { logo: null },
      })
      console.log(`    ✗ Removed broken logo (no replacement found)`)
      fixes.push({
        clubId: club.id,
        clubName: club.name,
        oldLogo: club.logo || '',
        newLogo: null,
        website: club.website,
        action: 'removed',
        reason: 'Broken logo removed, no replacement available',
      })
    }
  }

  return fixes
}

async function fixInstagramLogos(): Promise<LogoFix[]> {
  console.log('\n🔧 FIXING INSTAGRAM/SOCIAL MEDIA LOGOS\n')
  const fixes: LogoFix[] = []

  for (const clubName of INSTAGRAM_LOGO_CLUBS) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
      select: { id: true, name: true, logo: true, website: true },
    })

    if (!club) {
      console.log(`  ⚠ Club not found: ${clubName}`)
      continue
    }

    console.log(`  Processing: ${club.name}`)

    // Try to find a new logo from the website
    let newLogo: string | null = null
    if (club.website) {
      newLogo = await findLogoFromWebsite(club.website)
    }

    if (newLogo) {
      // Update with new logo
      await prisma.club.update({
        where: { id: club.id },
        data: { logo: newLogo },
      })
      console.log(`    ✓ Replaced Instagram logo with website logo`)
      fixes.push({
        clubId: club.id,
        clubName: club.name,
        oldLogo: club.logo || '',
        newLogo,
        website: club.website,
        action: 'replaced',
        reason: 'Instagram logo replaced with website logo',
      })
    } else {
      // Keep Instagram logo as fallback but log the issue
      console.log(`    ⚠ No replacement found, keeping Instagram logo`)
      fixes.push({
        clubId: club.id,
        clubName: club.name,
        oldLogo: club.logo || '',
        newLogo: club.logo,
        website: club.website,
        action: 'unchanged',
        reason: 'No replacement found on website',
      })
    }
  }

  return fixes
}

async function fixLargeImages(): Promise<LogoFix[]> {
  console.log('\n🔧 FIXING LARGE IMAGES (potential photos)\n')
  const fixes: LogoFix[] = []

  for (const clubName of LARGE_IMAGE_CLUBS) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
      select: { id: true, name: true, logo: true, website: true },
    })

    if (!club) {
      console.log(`  ⚠ Club not found: ${clubName}`)
      continue
    }

    console.log(`  Processing: ${club.name}`)

    // Check current logo size
    if (club.logo) {
      const currentSize = await getImageSize(club.logo)
      console.log(`    Current image size: ${currentSize ? Math.round(currentSize / 1024) + 'KB' : 'unknown'}`)
    }

    // Try to find a smaller logo from the website
    let newLogo: string | null = null
    if (club.website) {
      newLogo = await findLogoFromWebsite(club.website)
    }

    if (newLogo) {
      const newSize = await getImageSize(newLogo)
      const currentSize = club.logo ? await getImageSize(club.logo) : null
      
      // Only replace if new logo is significantly smaller
      if (newSize && (!currentSize || newSize < currentSize * 0.5)) {
        await prisma.club.update({
          where: { id: club.id },
          data: { logo: newLogo },
        })
        console.log(`    ✓ Replaced with smaller logo (${Math.round(newSize / 1024)}KB)`)
        fixes.push({
          clubId: club.id,
          clubName: club.name,
          oldLogo: club.logo || '',
          newLogo,
          website: club.website,
          action: 'replaced',
          reason: `Large image replaced with smaller logo (${Math.round((newSize || 0) / 1024)}KB)`,
        })
      } else {
        console.log(`    ⚠ New logo not significantly smaller, keeping current`)
        fixes.push({
          clubId: club.id,
          clubName: club.name,
          oldLogo: club.logo || '',
          newLogo: club.logo,
          website: club.website,
          action: 'unchanged',
          reason: 'No significantly smaller logo found',
        })
      }
    } else {
      console.log(`    ⚠ No replacement found`)
      fixes.push({
        clubId: club.id,
        clubName: club.name,
        oldLogo: club.logo || '',
        newLogo: club.logo,
        website: club.website,
        action: 'unchanged',
        reason: 'No replacement found on website',
      })
    }
  }

  return fixes
}

async function main() {
  console.log('🔧 Club Logo Fix Script')
  console.log('=======================\n')

  const allFixes: LogoFix[] = []

  // Fix broken logos
  const brokenFixes = await fixBrokenLogos()
  allFixes.push(...brokenFixes)

  // Fix Instagram logos
  const instagramFixes = await fixInstagramLogos()
  allFixes.push(...instagramFixes)

  // Fix large images
  const largeFixes = await fixLargeImages()
  allFixes.push(...largeFixes)

  // Summary
  console.log('\n\n📊 SUMMARY')
  console.log('==========\n')

  const replaced = allFixes.filter(f => f.action === 'replaced')
  const removed = allFixes.filter(f => f.action === 'removed')
  const unchanged = allFixes.filter(f => f.action === 'unchanged')
  const failed = allFixes.filter(f => f.action === 'failed')

  console.log(`✅ Replaced: ${replaced.length}`)
  replaced.forEach(f => console.log(`   - ${f.clubName}: ${f.reason}`))

  console.log(`\n❌ Removed: ${removed.length}`)
  removed.forEach(f => console.log(`   - ${f.clubName}: ${f.reason}`))

  console.log(`\n⚠️ Unchanged: ${unchanged.length}`)
  unchanged.forEach(f => console.log(`   - ${f.clubName}: ${f.reason}`))

  if (failed.length > 0) {
    console.log(`\n💥 Failed: ${failed.length}`)
    failed.forEach(f => console.log(`   - ${f.clubName}: ${f.reason}`))
  }

  console.log('\n✅ Logo fix complete!')

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
