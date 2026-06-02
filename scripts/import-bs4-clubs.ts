/**
 * Import BeautifulSoup-scraped clubs into the database
 * 
 * Reads: data/swiss-volleyball-clubs-bs4.json
 * Upserts all clubs into the Club table.
 *
 * Usage:
 *   npx ts-node scripts/import-bs4-clubs.ts
 */

import { PrismaClient, Canton } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ScrapedClub {
  name: string
  postalCode?: string
  town: string
  canton: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  swissVolleyClubId?: string
  // League flags from Game Center
  hasNLAMen?: boolean
  hasNLAWomen?: boolean
  hasNLBMen?: boolean
  hasNLBWomen?: boolean
  has1LigaMen?: boolean
  has1LigaWomen?: boolean
  // Derived from offerings
  hasU23Men?: boolean
  hasU23Women?: boolean
  hasU20Men?: boolean
  hasU20Women?: boolean
  hasU18Men?: boolean
  hasU18Women?: boolean
  // Social media
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
}

// Valid Prisma Canton enum values
const VALID_CANTONS = new Set([
  'AG','AI','AR','BE','BL','BS','FR','GE','GL','GR',
  'JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG',
  'TI','UR','VD','VS','ZG','ZH'
])

function toCantonEnum(raw: string): Canton | null {
  const upper = raw?.trim().toUpperCase()
  if (VALID_CANTONS.has(upper)) return upper as Canton
  return null
}

function normalizeUrl(url: string | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed.startsWith('http')) return null
  return trimmed
}

async function importClubs() {
  const dataPath = path.join(__dirname, '../data/swiss-volleyball-clubs-bs4.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Data file not found:', dataPath)
    console.error('   Run: python scripts/scrape_clubs_beautifulsoup.py first')
    process.exit(1)
  }

  const raw = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(raw)
  const clubs: ScrapedClub[] = data.clubs

  console.log(`\n=== Importing ${clubs.length} scraped clubs ===`)
  console.log(`Source: ${dataPath}`)
  console.log(`Last updated: ${data.lastUpdated}\n`)

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const club of clubs) {
    if (!club.name || club.name.trim().length < 2) {
      skipped++
      continue
    }

    const canton = toCantonEnum(club.canton)
    if (!canton) {
      console.warn(`⚠  Skipping "${club.name}" – invalid canton: "${club.canton}"`)
      skipped++
      continue
    }

    const clubData = {
      name:           club.name.trim(),
      town:           (club.town || '').trim(),
      canton:         canton,
      website:        normalizeUrl(club.website),
      email:          club.email?.trim() || null,
      phone:          club.phone?.trim() || null,
      logo:           normalizeUrl(club.logo),
      swissVolleyId:  club.swissVolleyClubId || null,
      // League flags
      hasNLAMen:      club.hasNLAMen    ?? false,
      hasNLAWomen:    club.hasNLAWomen  ?? false,
      hasNLBMen:      club.hasNLBMen    ?? false,
      hasNLBWomen:    club.hasNLBWomen  ?? false,
      has1LigaMen:    club.has1LigaMen  ?? false,
      has1LigaWomen:  club.has1LigaWomen ?? false,
      has2LigaMen:    false,
      has2LigaWomen:  false,
      has3LigaMen:    false,
      has3LigaWomen:  false,
      has4LigaMen:    false,
      has4LigaWomen:  false,
      has5LigaMen:    false,
      has5LigaWomen:  false,
      // Youth
      hasU23Men:      club.hasU23Men    ?? false,
      hasU23Women:    club.hasU23Women  ?? false,
      hasU20Men:      club.hasU20Men    ?? false,
      hasU20Women:    club.hasU20Women  ?? false,
      hasU18Men:      club.hasU18Men    ?? false,
      hasU18Women:    club.hasU18Women  ?? false,
      // Social media
      facebook:       normalizeUrl(club.facebook),
      instagram:      club.instagram?.trim() || null,
      twitter:        normalizeUrl(club.twitter),
      youtube:        normalizeUrl(club.youtube),
      tiktok:         club.tiktok?.trim() || null,
    }

    try {
      // Try to find existing club by swissVolleyId first, then by name
      let existing = null
      if (clubData.swissVolleyId) {
        existing = await prisma.club.findUnique({
          where: { swissVolleyId: clubData.swissVolleyId }
        })
      }
      if (!existing) {
        existing = await prisma.club.findFirst({
          where: { name: { equals: clubData.name, mode: 'insensitive' } }
        })
      }

      if (existing) {
        await prisma.club.update({
          where: { id: existing.id },
          data: clubData,
        })
        console.log(`✓ Updated:  ${club.name}`)
        updated++
      } else {
        await prisma.club.create({ data: clubData })
        console.log(`+ Created:  ${club.name}`)
        created++
      }
    } catch (error: any) {
      console.error(`✗ Error processing "${club.name}": ${error?.message}`)
      errors++
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`  Created:  ${created}`)
  console.log(`  Updated:  ${updated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Errors:   ${errors}`)
  console.log(`  Total:    ${clubs.length}`)
}

importClubs()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
