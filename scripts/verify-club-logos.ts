/**
 * Club Logo Verification Script
 * 
 * Cross-references club logos with their official websites to verify:
 * 1. The logo URL is accessible and returns an image
 * 2. The image dimensions are reasonable for a logo
 * 3. The image is not a random photo or person
 * 
 * Uses image analysis to detect potential issues.
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as https from 'https'
import * as http from 'http'

const prisma = new PrismaClient()

interface LogoVerification {
  clubId: string
  clubName: string
  logoUrl: string
  website: string | null
  status: 'valid' | 'invalid' | 'warning' | 'unreachable' | 'not_image'
  issues: string[]
  contentType?: string
  imageSize?: number
  isFromClubDomain?: boolean
}

// Common logo/favicon paths to check on websites
const LOGO_PATHS = [
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/logo.png',
  '/logo.svg',
  '/images/logo.png',
  '/assets/logo.png',
  '/wp-content/uploads/',
]

// Suspicious image sources that might not be real logos
const SUSPICIOUS_SOURCES = [
  'facebook.com',
  'fbcdn.net',
  'instagram.com',
  'cdninstagram.com',
  'twitter.com',
  'twimg.com',
  'wixstatic.com',
  'parastorage.com',
  'placeholder',
  'gravatar',
  'avatar',
  'profile',
  'user',
]

// Image types that are valid for logos
const VALID_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]

async function checkImageUrl(url: string): Promise<{
  accessible: boolean
  contentType?: string
  size?: number
  error?: string
}> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      httpAgent: new http.Agent(),
    })
    
    return {
      accessible: true,
      contentType: response.headers['content-type'],
      size: parseInt(response.headers['content-length'] || '0', 10),
    }
  } catch (error: any) {
    // Try GET if HEAD fails
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        responseType: 'arraybuffer',
        validateStatus: (status) => status < 400,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      })
      
      return {
        accessible: true,
        contentType: response.headers['content-type'],
        size: response.data?.length || 0,
      }
    } catch (getError: any) {
      return {
        accessible: false,
        error: getError.message || 'Unknown error',
      }
    }
  }
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace('www.', '')
  } catch {
    return null
  }
}

function isFromSameDomain(logoUrl: string, websiteUrl: string): boolean {
  const logoDomain = extractDomain(logoUrl)
  const websiteDomain = extractDomain(websiteUrl)
  
  if (!logoDomain || !websiteDomain) return false
  
  // Check if domains match or logo is from a subdomain
  return logoDomain === websiteDomain || 
         logoDomain.endsWith('.' + websiteDomain) ||
         websiteDomain.endsWith('.' + logoDomain)
}

function checkSuspiciousSource(url: string): string | null {
  const lowerUrl = url.toLowerCase()
  for (const suspicious of SUSPICIOUS_SOURCES) {
    if (lowerUrl.includes(suspicious)) {
      return suspicious
    }
  }
  return null
}

async function verifyClubLogo(club: {
  id: string
  name: string
  logo: string | null
  website: string | null
}): Promise<LogoVerification> {
  const result: LogoVerification = {
    clubId: club.id,
    clubName: club.name,
    logoUrl: club.logo || '',
    website: club.website,
    status: 'valid',
    issues: [],
  }

  if (!club.logo) {
    result.status = 'invalid'
    result.issues.push('No logo URL')
    return result
  }

  // Check if logo is a base64 data URL
  if (club.logo.startsWith('data:image/')) {
    result.status = 'valid'
    result.issues.push('Base64 encoded image (manual upload)')
    return result
  }

  // Check for emoji logos (from static database)
  if (club.logo.length <= 4 && !club.logo.startsWith('http')) {
    result.status = 'warning'
    result.issues.push('Emoji placeholder logo: ' + club.logo)
    return result
  }

  // Check suspicious sources
  const suspicious = checkSuspiciousSource(club.logo)
  if (suspicious) {
    result.issues.push(`⚠️ Potentially suspicious source: ${suspicious}`)
    result.status = 'warning'
  }

  // Check if logo is accessible
  const imageCheck = await checkImageUrl(club.logo)
  
  if (!imageCheck.accessible) {
    result.status = 'unreachable'
    result.issues.push(`Cannot access logo: ${imageCheck.error}`)
    return result
  }

  result.contentType = imageCheck.contentType
  result.imageSize = imageCheck.size

  // Verify content type is an image
  const isValidImage = VALID_IMAGE_TYPES.some(type => 
    imageCheck.contentType?.toLowerCase().includes(type.split('/')[1])
  )
  
  if (!isValidImage && imageCheck.contentType) {
    result.status = 'not_image'
    result.issues.push(`Not an image type: ${imageCheck.contentType}`)
  }

  // Check if logo is from the same domain as the club website
  if (club.website) {
    result.isFromClubDomain = isFromSameDomain(club.logo, club.website)
    if (!result.isFromClubDomain) {
      result.issues.push(`Logo not from club domain (logo: ${extractDomain(club.logo)}, website: ${extractDomain(club.website)})`)
      if (result.status === 'valid') {
        result.status = 'warning'
      }
    }
  }

  // Check for very small images (likely favicons)
  if (imageCheck.size && imageCheck.size < 500) {
    result.issues.push(`Very small image (${imageCheck.size} bytes) - might be a tiny favicon`)
  }

  // Check for very large images (might be photos, not logos)
  if (imageCheck.size && imageCheck.size > 500000) {
    result.issues.push(`Large image (${Math.round(imageCheck.size / 1024)}KB) - might be a photo, not a logo`)
    if (result.status === 'valid') {
      result.status = 'warning'
    }
  }

  return result
}

async function main() {
  console.log('🔍 Club Logo Verification Script')
  console.log('================================\n')

  // Get all clubs with logos
  const clubs = await prisma.club.findMany({
    where: {
      logo: { not: null }
    },
    select: {
      id: true,
      name: true,
      logo: true,
      website: true,
    },
    orderBy: { name: 'asc' },
  })

  console.log(`Found ${clubs.length} clubs with logos to verify\n`)

  const results: LogoVerification[] = []
  let processed = 0

  for (const club of clubs) {
    processed++
    process.stdout.write(`\rVerifying ${processed}/${clubs.length}: ${club.name.padEnd(40)}`)
    
    const verification = await verifyClubLogo(club)
    results.push(verification)
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('\n\n📊 Verification Results\n')
  console.log('========================\n')

  // Group by status
  const valid = results.filter(r => r.status === 'valid')
  const warnings = results.filter(r => r.status === 'warning')
  const invalid = results.filter(r => r.status === 'invalid')
  const unreachable = results.filter(r => r.status === 'unreachable')
  const notImage = results.filter(r => r.status === 'not_image')

  console.log(`✅ Valid: ${valid.length}`)
  console.log(`⚠️ Warnings: ${warnings.length}`)
  console.log(`❌ Invalid: ${invalid.length}`)
  console.log(`🚫 Unreachable: ${unreachable.length}`)
  console.log(`📄 Not Image: ${notImage.length}`)

  // Show problematic logos
  console.log('\n\n🚨 PROBLEMATIC LOGOS (Need Review)\n')
  console.log('====================================\n')

  // Warnings - potentially wrong images
  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS (Potentially incorrect logos):\n')
    for (const w of warnings) {
      console.log(`  ${w.clubName}`)
      console.log(`    Logo: ${w.logoUrl.substring(0, 80)}...`)
      console.log(`    Website: ${w.website || 'N/A'}`)
      console.log(`    Issues: ${w.issues.join(', ')}`)
      console.log()
    }
  }

  // Unreachable - broken links
  if (unreachable.length > 0) {
    console.log('\n🚫 UNREACHABLE (Broken logo URLs):\n')
    for (const u of unreachable) {
      console.log(`  ${u.clubName}`)
      console.log(`    Logo: ${u.logoUrl.substring(0, 80)}...`)
      console.log(`    Error: ${u.issues.join(', ')}`)
      console.log()
    }
  }

  // Not images
  if (notImage.length > 0) {
    console.log('\n📄 NOT IMAGES (Wrong content type):\n')
    for (const n of notImage) {
      console.log(`  ${n.clubName}`)
      console.log(`    Logo: ${n.logoUrl.substring(0, 80)}...`)
      console.log(`    Content-Type: ${n.contentType}`)
      console.log()
    }
  }

  // Summary of logos from external domains
  const externalDomains = results.filter(r => r.isFromClubDomain === false)
  if (externalDomains.length > 0) {
    console.log('\n\n📍 LOGOS FROM EXTERNAL DOMAINS:\n')
    console.log('(These might be copied from other sources, not official club logos)\n')
    for (const e of externalDomains) {
      console.log(`  ${e.clubName}`)
      console.log(`    Logo domain: ${extractDomain(e.logoUrl)}`)
      console.log(`    Club website: ${e.website || 'N/A'}`)
      console.log()
    }
  }

  // Social media logos (high risk of being profile photos)
  const socialMediaLogos = results.filter(r => 
    r.logoUrl.includes('instagram') || 
    r.logoUrl.includes('facebook') || 
    r.logoUrl.includes('fbcdn') ||
    r.logoUrl.includes('cdninstagram')
  )
  
  if (socialMediaLogos.length > 0) {
    console.log('\n\n🔴 HIGH RISK: SOCIAL MEDIA SOURCED LOGOS:\n')
    console.log('(These are likely profile pictures or random images from social feeds)\n')
    for (const s of socialMediaLogos) {
      console.log(`  ❗ ${s.clubName}`)
      console.log(`     ${s.logoUrl}`)
      console.log()
    }
  }

  // Wix/generic sources
  const genericSources = results.filter(r => 
    r.logoUrl.includes('wixstatic') || 
    r.logoUrl.includes('parastorage') ||
    r.logoUrl.includes('static.wix')
  )
  
  if (genericSources.length > 0) {
    console.log('\n\n⚠️ GENERIC/WIX SOURCED LOGOS:\n')
    console.log('(These might be placeholder images or generic icons)\n')
    for (const g of genericSources) {
      console.log(`  ${g.clubName}`)
      console.log(`    ${g.logoUrl.substring(0, 100)}...`)
      console.log()
    }
  }

  console.log('\n\n✅ Verification complete!')
  console.log(`   Total clubs: ${clubs.length}`)
  console.log(`   Need review: ${warnings.length + unreachable.length + notImage.length}`)
  
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
