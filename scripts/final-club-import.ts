/**
 * Final Import Script for Swiss Volleyball Clubs
 * 
 * Uses the raw scraped data and imports into the database with:
 * - Properly parsed club names
 * - Canton from postal code
 * - League participation flags (Men/Women/Juniors)
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RawClub {
  name: string
  postalCode: string
  town: string
  website: string
  angebot: string
}

// Map postal codes to valid Canton enum values
function getCantonFromPostalCode(postalCode: string): string | null {
  const code = parseInt(postalCode)
  if (isNaN(code)) return null
  
  if (code >= 1000 && code <= 1099) return 'VD'
  if (code >= 1100 && code <= 1199) return 'VD'
  if (code >= 1200 && code <= 1299) return 'GE'
  if (code >= 1300 && code <= 1399) return 'VD'
  if (code >= 1400 && code <= 1499) return 'VD'
  if (code >= 1500 && code <= 1599) return 'VD'
  if (code >= 1600 && code <= 1699) return 'FR'
  if (code >= 1700 && code <= 1799) return 'FR'
  if (code >= 1800 && code <= 1899) return 'VD'
  if (code >= 1900 && code <= 1999) return 'VS'
  if (code >= 2000 && code <= 2099) return 'NE'
  if (code >= 2100 && code <= 2299) return 'NE'
  if (code >= 2300 && code <= 2499) return 'NE'
  if (code >= 2500 && code <= 2699) return 'BE'
  if (code >= 2700 && code <= 2799) return 'BE'
  if (code >= 2800 && code <= 2999) return 'JU'
  if (code >= 3000 && code <= 3899) return 'BE'
  if (code >= 3900 && code <= 3999) return 'VS'
  if (code >= 4000 && code <= 4099) return 'BS'
  if (code >= 4100 && code <= 4199) return 'BL'
  if (code >= 4200 && code <= 4299) return 'BL'
  if (code >= 4300 && code <= 4399) return 'AG'
  if (code >= 4400 && code <= 4499) return 'BL'
  if (code >= 4500 && code <= 4699) return 'SO'
  if (code >= 4700 && code <= 4799) return 'SO'
  if (code >= 4800 && code <= 4899) return 'AG'
  if (code >= 4900 && code <= 4999) return 'BE'
  if (code >= 5000 && code <= 5999) return 'AG'
  if (code >= 6000 && code <= 6099) return 'LU'
  if (code >= 6100 && code <= 6199) return 'LU'
  if (code >= 6200 && code <= 6299) return 'LU'
  if (code >= 6300 && code <= 6399) return 'ZG'
  if (code >= 6400 && code <= 6499) return 'SZ'
  if (code >= 6500 && code <= 6599) return 'TI'
  if (code >= 6600 && code <= 6699) return 'TI'
  if (code >= 6700 && code <= 6799) return 'TI'
  if (code >= 6800 && code <= 6899) return 'TI'
  if (code >= 6900 && code <= 6999) return 'TI'
  if (code >= 7000 && code <= 7799) return 'GR'
  if (code >= 8000 && code <= 8199) return 'ZH'
  if (code >= 8200 && code <= 8299) return 'SH'
  if (code >= 8300 && code <= 8499) return 'ZH'
  if (code >= 8500 && code <= 8599) return 'TG'
  if (code >= 8600 && code <= 8899) return 'ZH'
  if (code >= 8900 && code <= 8999) return 'ZH'
  if (code >= 9000 && code <= 9099) return 'SG'
  if (code >= 9100 && code <= 9199) return 'AR'
  if (code >= 9200 && code <= 9299) return 'TG'
  if (code >= 9300 && code <= 9699) return 'SG'
  if (code >= 9700 && code <= 9799) return 'SG'
  if (code >= 9800 && code <= 9899) return 'TG'
  
  // Some edge cases
  if (code >= 6370 && code <= 6379) return 'NW'
  if (code >= 6060 && code <= 6069) return 'OW'
  if (code >= 6460 && code <= 6469) return 'UR'
  if (code >= 8750 && code <= 8759) return 'GL'
  
  return null
}

function parseClubName(rawName: string, postalCode: string): string {
  // The raw name format is: "ClubName1234 Town..."
  const postalIndex = rawName.indexOf(postalCode)
  if (postalIndex > 0) {
    return rawName.substring(0, postalIndex).trim()
  }
  const match = rawName.match(/^(.+?)(\d{4})/)
  return match ? match[1].trim() : rawName.trim()
}

function parseLeagues(angebot: string) {
  return {
    // Men's leagues - if they have Volleyball Männer, they have teams from NLA to 5L
    hasNLAMen: angebot.includes('Volleyball Männer'),
    hasNLBMen: angebot.includes('Volleyball Männer'),
    has1LigaMen: angebot.includes('Volleyball Männer'),
    has2LigaMen: angebot.includes('Volleyball Männer'),
    has3LigaMen: angebot.includes('Volleyball Männer'),
    has4LigaMen: angebot.includes('Volleyball Männer'),
    has5LigaMen: angebot.includes('Volleyball Männer'),
    // Women's leagues
    hasNLAWomen: angebot.includes('Volleyball Frauen'),
    hasNLBWomen: angebot.includes('Volleyball Frauen'),
    has1LigaWomen: angebot.includes('Volleyball Frauen'),
    has2LigaWomen: angebot.includes('Volleyball Frauen'),
    has3LigaWomen: angebot.includes('Volleyball Frauen'),
    has4LigaWomen: angebot.includes('Volleyball Frauen'),
    has5LigaWomen: angebot.includes('Volleyball Frauen'),
    // Youth - male
    hasU23Men: angebot.includes('Volleyball Junioren'),
    hasU20Men: angebot.includes('Volleyball Junioren'),
    hasU18Men: angebot.includes('Volleyball Junioren'),
    // Youth - female
    hasU23Women: angebot.includes('Volleyball Juniorinnen'),
    hasU20Women: angebot.includes('Volleyball Juniorinnen'),
    hasU18Women: angebot.includes('Volleyball Juniorinnen'),
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('Swiss Volleyball Club Import')
  console.log('='.repeat(60))
  
  // Load raw data
  const rawPath = path.join(__dirname, '../data/swiss-volleyball-clubs-raw.json')
  const rawData: RawClub[] = JSON.parse(fs.readFileSync(rawPath, 'utf-8'))
  
  console.log(`\nLoaded ${rawData.length} clubs from raw data`)
  
  let created = 0
  let updated = 0
  let skipped = 0
  
  for (const raw of rawData) {
    const name = parseClubName(raw.name, raw.postalCode)
    
    if (!name || name.length < 2) {
      console.log(`Skipping: Invalid name`)
      skipped++
      continue
    }
    
    const canton = getCantonFromPostalCode(raw.postalCode)
    if (!canton) {
      console.log(`Skipping ${name}: Unknown canton for ${raw.postalCode}`)
      skipped++
      continue
    }
    
    const leagues = parseLeagues(raw.angebot || raw.name)
    
    // Check if club exists
    const existing = await prisma.club.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })
    
    const data = {
      name,
      town: raw.town || '',
      canton: canton as any,
      ...leagues
    }
    
    try {
      if (existing) {
        await prisma.club.update({
          where: { id: existing.id },
          data
        })
        updated++
      } else {
        await prisma.club.create({ data })
        created++
      }
    } catch (e: any) {
      console.log(`Error with ${name}: ${e.message}`)
      skipped++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('Import Complete!')
  console.log('='.repeat(60))
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  
  // Show summary
  const total = await prisma.club.count()
  console.log(`\nTotal clubs in database: ${total}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
