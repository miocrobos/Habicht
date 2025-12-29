/**
 * Fix Remaining Club Logos
 * 
 * Manually sets correct logos for clubs that couldn't be auto-fixed
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as https from 'https'
import * as cheerio from 'cheerio'

const prisma = new PrismaClient()

// Manual logo fixes for clubs where auto-detection failed
const MANUAL_LOGO_FIXES: { [clubName: string]: { logo: string | null; website?: string; reason: string } } = {
  // TS Volero Zürich - Update website and use their favicon
  'TS Volero Zürich': {
    logo: 'https://vbc.volero.ch/favicon.ico',
    website: 'https://vbc.volero.ch',
    reason: 'Updated to correct website (vbc.volero.ch) and favicon'
  },
  
  // Turnverein Horgen - This is a gymnastics club with volleyball section, use Jimdo favicon
  'Turnverein Horgen': {
    logo: null, // Remove Instagram logo - this isn't primarily a volleyball club
    reason: 'Removed Instagram logo - gymnastics club with volleyball section, no dedicated volleyball logo'
  },
  
  // VBC Lignieres - Website is down, remove logo
  'VBC Lignieres': {
    logo: null,
    reason: 'Website appears down, removed Instagram logo'
  },
  
  // Infomaniak Genève Volley - Website DNS issues, keep Instagram as it shows club logo
  'Infomaniak Genève Volley': {
    // Keep Instagram logo as it appears to be their actual logo
    logo: null, // Will be handled specially - keep existing
    reason: 'Website has DNS issues, Instagram profile shows club logo - keeping'
  },
  
  // Volley Bern - Website is parked/for sale
  'Volley Bern': {
    logo: null,
    website: 'https://volleybern.ch', // Keep website even though parked
    reason: 'Website is parked/for sale, removed Instagram logo'
  },
  
  // VBC Littau - Large team photo, need to find proper logo
  'VBC Littau': {
    logo: null, // Remove the 790KB team photo
    reason: 'Removed 790KB team photo - no proper logo found on website'
  },
}

async function findLogoInHtml(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const $ = cheerio.load(response.data)
    
    // Look for site icon/logo in various places
    const selectors = [
      'link[rel="apple-touch-icon"]',
      'link[rel="icon"][sizes="192x192"]',
      'link[rel="icon"][sizes="180x180"]',
      'link[rel="icon"][sizes="144x144"]',
      'link[rel="shortcut icon"]',
      'link[rel="icon"]',
      '.site-logo img',
      '.custom-logo',
      'img[class*="logo"]',
      'header img:first',
    ]
    
    for (const selector of selectors) {
      const el = $(selector).first()
      if (el.length) {
        const href = el.attr('href') || el.attr('src')
        if (href) {
          const fullUrl = new URL(href, url).href
          // Check if accessible
          try {
            const check = await axios.head(fullUrl, { 
              timeout: 5000,
              httpsAgent: new https.Agent({ rejectUnauthorized: false })
            })
            if (check.status < 400) {
              return fullUrl
            }
          } catch {}
        }
      }
    }
    
    return null
  } catch (e) {
    return null
  }
}

async function main() {
  console.log('🔧 Fixing Remaining Club Logos\n')
  console.log('==============================\n')

  // First, try to find VBC Littau's logo from their WordPress site
  console.log('🔍 Searching for VBC Littau logo...')
  const littauLogo = await findLogoInHtml('https://vbc-littau.ch')
  if (littauLogo) {
    console.log(`   Found: ${littauLogo}`)
    MANUAL_LOGO_FIXES['VBC Littau'].logo = littauLogo
    MANUAL_LOGO_FIXES['VBC Littau'].reason = 'Found logo from website'
  }

  // Apply manual fixes
  for (const [clubName, fix] of Object.entries(MANUAL_LOGO_FIXES)) {
    const club = await prisma.club.findFirst({
      where: { name: clubName },
      select: { id: true, name: true, logo: true, website: true }
    })

    if (!club) {
      console.log(`⚠️ Club not found: ${clubName}`)
      continue
    }

    console.log(`\n📌 ${clubName}`)
    console.log(`   Current logo: ${club.logo ? club.logo.substring(0, 60) + '...' : 'none'}`)
    
    // Special handling for Genève - keep existing if fix.logo is null
    if (clubName === 'Infomaniak Genève Volley' && fix.logo === null) {
      console.log(`   ℹ️ Keeping existing logo (Instagram shows actual club logo)`)
      continue
    }

    const updateData: any = {}
    
    if (fix.logo !== undefined) {
      updateData.logo = fix.logo
    }
    if (fix.website) {
      updateData.website = fix.website
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.club.update({
        where: { id: club.id },
        data: updateData
      })
      
      if (fix.logo) {
        console.log(`   ✅ Updated logo: ${fix.logo.substring(0, 60)}...`)
      } else if (fix.logo === null) {
        console.log(`   🗑️ Removed logo`)
      }
      if (fix.website) {
        console.log(`   🔗 Updated website: ${fix.website}`)
      }
    }
    
    console.log(`   📝 Reason: ${fix.reason}`)
  }

  // Summary
  console.log('\n\n📊 Summary')
  console.log('==========')
  
  // Check final state
  const remaining = await prisma.club.findMany({
    where: {
      OR: [
        { logo: { contains: 'instagram' } },
        { logo: { contains: 'cdninstagram' } },
      ]
    },
    select: { name: true, logo: true }
  })

  if (remaining.length > 0) {
    console.log(`\n⚠️ ${remaining.length} clubs still have Instagram logos:`)
    remaining.forEach(c => console.log(`   - ${c.name}`))
  } else {
    console.log('\n✅ No more Instagram logos in database!')
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
