/**
 * Logo Verification via Web Search
 * 
 * Cross-references club logos with web searches to verify accuracy
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import * as https from 'https'

const prisma = new PrismaClient()

// Clubs that were flagged as potentially having wrong logos
const CLUBS_TO_VERIFY = [
  'Infomaniak Genève Volley',  // Instagram logo
  'VBC Chatel-St-Denis',       // Google Sites
  'VBC Eburo',                 // Google Sites
  'VBC Meggen',                // Google Sites
  'Volley GraPa',              // Wix - suspicious
  'BMV 92',                    // Wix
  'VBC Allschwil',             // Wix
  'Bienne Volleyboys',         // Parastorage
  'TS Volero Zürich',          // Recently fixed
]

async function getClubInfo(clubName: string) {
  const club = await prisma.club.findFirst({
    where: { name: clubName },
    select: { id: true, name: true, logo: true, website: true }
  })
  return club
}

async function main() {
  console.log('🔍 Logo Verification Report\n')
  console.log('===========================\n')
  console.log('This report lists clubs and their logo URLs for manual verification.\n')
  console.log('To verify, search Google Images for "[club name] volleyball logo schweiz"\n')
  console.log('and compare with our stored logo.\n\n')

  for (const clubName of CLUBS_TO_VERIFY) {
    const club = await getClubInfo(clubName)
    
    if (!club) {
      console.log(`❌ ${clubName}: NOT FOUND IN DATABASE\n`)
      continue
    }

    console.log(`📌 ${club.name}`)
    console.log(`   Website: ${club.website || 'N/A'}`)
    console.log(`   Our Logo: ${club.logo ? club.logo.substring(0, 100) : 'NO LOGO'}`)
    console.log(`   Search: https://www.google.com/search?tbm=isch&q=${encodeURIComponent(club.name + ' volleyball logo')}`)
    console.log()
  }

  // Also show clubs with Wix logos for bulk review
  console.log('\n\n📋 ALL CLUBS WITH WIX-HOSTED LOGOS:\n')
  const wixClubs = await prisma.club.findMany({
    where: { logo: { contains: 'wixstatic' } },
    select: { name: true, logo: true, website: true }
  })

  for (const club of wixClubs) {
    console.log(`  ${club.name}`)
    console.log(`    Logo: ${club.logo?.substring(0, 80)}...`)
    console.log(`    Website: ${club.website}`)
  }

  console.log(`\n  Total: ${wixClubs.length} clubs with Wix logos`)

  await prisma.$disconnect()
}

main()
