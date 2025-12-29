/**
 * Automatic Logo Quality Check
 * 
 * Checks all logos for:
 * 1. Very small images (likely favicons/icons, not logos)
 * 2. Stock photo indicators in filenames
 * 3. Generic Wix template images
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Patterns that indicate a stock photo or generic image, NOT a logo
const STOCK_PHOTO_PATTERNS = [
  /nsplsh_/i,           // Unsplash stock photos
  /rawpixel/i,          // Rawpixel stock photos
  /shutterstock/i,      // Shutterstock
  /istock/i,            // iStock
  /getty/i,             // Getty Images
  /depositphotos/i,     // Depositphotos
  /adobe.*stock/i,      // Adobe Stock
  /pfavico\.ico/i,      // Generic Wix favicon
  /favicon/i,           // Any favicon
]

// Patterns that indicate a legitimate logo
const LOGO_PATTERNS = [
  /logo/i,
  /wappen/i,            // German for crest/emblem
  /emblem/i,
  /badge/i,
  /crest/i,
  /shield/i,
]

interface LogoCheck {
  name: string
  logo: string
  issue: string
  recommendation: 'remove' | 'keep' | 'review'
}

async function checkLogo(name: string, logoUrl: string): Promise<LogoCheck | null> {
  // Check for stock photo patterns
  for (const pattern of STOCK_PHOTO_PATTERNS) {
    if (pattern.test(logoUrl)) {
      return {
        name,
        logo: logoUrl,
        issue: `Stock photo pattern detected: ${pattern.source}`,
        recommendation: 'remove'
      }
    }
  }

  // Check image size via URL parameters (Wix includes dimensions in URL)
  const widthMatch = logoUrl.match(/w_(\d+)/);
  const heightMatch = logoUrl.match(/h_(\d+)/);
  
  if (widthMatch && heightMatch) {
    const width = parseInt(widthMatch[1]);
    const height = parseInt(heightMatch[1]);
    
    // Very small images (less than 30x30) are likely icons, not logos
    if (width < 30 && height < 30) {
      return {
        name,
        logo: logoUrl,
        issue: `Very small image (${width}x${height}px) - likely a favicon`,
        recommendation: 'review'
      }
    }
  }

  // Check if filename suggests it's a logo
  const hasLogoIndicator = LOGO_PATTERNS.some(p => p.test(logoUrl));
  
  // Wix template IDs that are known to be generic
  const genericWixIds = ['11062b_'];  // Common Wix template prefix
  const isGenericWix = genericWixIds.some(id => logoUrl.includes(id));
  
  if (isGenericWix && !hasLogoIndicator) {
    return {
      name,
      logo: logoUrl,
      issue: 'Generic Wix template image ID without logo indicator in filename',
      recommendation: 'review'
    }
  }

  return null;
}

async function main() {
  console.log('🔍 Automatic Logo Quality Check\n')
  console.log('================================\n')

  const clubs = await prisma.club.findMany({
    where: { logo: { not: null } },
    select: { id: true, name: true, logo: true, website: true }
  })

  const issues: LogoCheck[] = []
  const toRemove: LogoCheck[] = []

  for (const club of clubs) {
    if (!club.logo) continue
    
    const issue = await checkLogo(club.name, club.logo)
    if (issue) {
      issues.push(issue)
      if (issue.recommendation === 'remove') {
        toRemove.push(issue)
      }
    }
  }

  if (issues.length === 0) {
    console.log('✅ All logos passed automatic quality checks!\n')
  } else {
    console.log(`Found ${issues.length} potential issues:\n`)
    
    for (const issue of issues) {
      const icon = issue.recommendation === 'remove' ? '❌' : '⚠️'
      console.log(`${icon} ${issue.name}`)
      console.log(`   Issue: ${issue.issue}`)
      console.log(`   Logo: ${issue.logo.substring(0, 80)}...`)
      console.log(`   Recommendation: ${issue.recommendation.toUpperCase()}`)
      console.log('')
    }
  }

  // Auto-remove clearly bad logos
  if (toRemove.length > 0) {
    console.log('\n🔧 Auto-removing clearly problematic logos...\n')
    
    for (const item of toRemove) {
      const club = await prisma.club.findFirst({
        where: { name: item.name },
        select: { id: true }
      })
      
      if (club) {
        await prisma.club.update({
          where: { id: club.id },
          data: { logo: null }
        })
        console.log(`   ✅ Removed logo for ${item.name}`)
      }
    }
  }

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  await prisma.$disconnect()
}

main()
