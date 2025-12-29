import { PrismaClient, Canton } from '@prisma/client'
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

// Map postal codes to cantons
function getCantonFromPostalCode(postalCode: string): Canton | null {
  const code = parseInt(postalCode)
  if (isNaN(code)) return null
  
  // Swiss postal code ranges by canton
  if (code >= 1000 && code <= 1099) return 'VD' // Lausanne area
  if (code >= 1100 && code <= 1199) return 'VD' // Morges area
  if (code >= 1200 && code <= 1299) return 'GE' // Genève
  if (code >= 1300 && code <= 1399) return 'VD' // Nyon area
  if (code >= 1400 && code <= 1499) return 'VD' // Yverdon area
  if (code >= 1500 && code <= 1599) return 'VD' // Moudon area
  if (code >= 1600 && code <= 1699) return 'FR' // Bulle/Vevey area
  if (code >= 1700 && code <= 1799) return 'FR' // Fribourg area
  if (code >= 1800 && code <= 1899) return 'VD' // Vevey/Montreux area
  if (code >= 1900 && code <= 1999) return 'VS' // Valais
  if (code >= 2000 && code <= 2099) return 'NE' // Neuchâtel area
  if (code >= 2100 && code <= 2199) return 'NE' // La Chaux-de-Fonds area
  if (code >= 2200 && code <= 2299) return 'NE' // Le Locle area
  if (code >= 2300 && code <= 2399) return 'NE' // La Chaux-de-Fonds area
  if (code >= 2400 && code <= 2499) return 'NE' // Le Locle area
  if (code >= 2500 && code <= 2599) return 'BE' // Biel/Bienne area
  if (code >= 2600 && code <= 2699) return 'BE' // Biel area
  if (code >= 2700 && code <= 2799) return 'BE' // Reconvilier area
  if (code >= 2800 && code <= 2899) return 'JU' // Jura (Delémont)
  if (code >= 2900 && code <= 2999) return 'JU' // Jura (Porrentruy)
  if (code >= 3000 && code <= 3099) return 'BE' // Bern
  if (code >= 3100 && code <= 3199) return 'BE' // Bern area
  if (code >= 3200 && code <= 3299) return 'BE' // Aarberg area
  if (code >= 3300 && code <= 3399) return 'BE' // Burgdorf area
  if (code >= 3400 && code <= 3499) return 'BE' // Burgdorf area
  if (code >= 3500 && code <= 3599) return 'BE' // Langnau area
  if (code >= 3600 && code <= 3699) return 'BE' // Thun area
  if (code >= 3700 && code <= 3799) return 'BE' // Spiez/Interlaken area
  if (code >= 3800 && code <= 3899) return 'BE' // Interlaken/Brienz area
  if (code >= 3900 && code <= 3999) return 'VS' // Valais (Brig)
  if (code >= 4000 && code <= 4099) return 'BS' // Basel-Stadt
  if (code >= 4100 && code <= 4199) return 'BL' // Basel-Landschaft
  if (code >= 4200 && code <= 4299) return 'BL' // Basel-Landschaft
  if (code >= 4300 && code <= 4399) return 'AG' // Rheinfelden area
  if (code >= 4400 && code <= 4499) return 'BL' // Liestal area
  if (code >= 4500 && code <= 4599) return 'SO' // Solothurn
  if (code >= 4600 && code <= 4699) return 'SO' // Olten area
  if (code >= 4700 && code <= 4799) return 'SO' // Oensingen area
  if (code >= 4800 && code <= 4899) return 'AG' // Zofingen area
  if (code >= 4900 && code <= 4999) return 'BE' // Langenthal area
  if (code >= 5000 && code <= 5099) return 'AG' // Aarau
  if (code >= 5100 && code <= 5199) return 'AG' // Frick area
  if (code >= 5200 && code <= 5299) return 'AG' // Brugg area
  if (code >= 5300 && code <= 5399) return 'AG' // Turgi area
  if (code >= 5400 && code <= 5499) return 'AG' // Baden area
  if (code >= 5500 && code <= 5599) return 'AG' // Bremgarten area
  if (code >= 5600 && code <= 5699) return 'AG' // Lenzburg area
  if (code >= 5700 && code <= 5799) return 'AG' // Seon area
  if (code >= 5800 && code <= 5899) return 'AG' // Muri area
  if (code >= 5900 && code <= 5999) return 'AG' // Sins area
  if (code >= 6000 && code <= 6099) return 'LU' // Luzern
  if (code >= 6100 && code <= 6199) return 'LU' // Willisau area
  if (code >= 6200 && code <= 6299) return 'LU' // Sempach area
  if (code >= 6300 && code <= 6399) return 'ZG' // Zug
  if (code >= 6400 && code <= 6499) return 'SZ' // Schwyz
  if (code >= 6500 && code <= 6599) return 'TI' // Bellinzona
  if (code >= 6600 && code <= 6699) return 'TI' // Locarno
  if (code >= 6700 && code <= 6799) return 'TI' // Biasca area
  if (code >= 6800 && code <= 6899) return 'TI' // Chiasso area
  if (code >= 6900 && code <= 6999) return 'TI' // Lugano
  if (code >= 7000 && code <= 7099) return 'GR' // Chur
  if (code >= 7100 && code <= 7199) return 'GR' // Domat/Ems area
  if (code >= 7200 && code <= 7299) return 'GR' // Untervaz area
  if (code >= 7300 && code <= 7399) return 'GR' // Davos area
  if (code >= 7400 && code <= 7499) return 'GR' // Tiefencastel area
  if (code >= 7500 && code <= 7599) return 'GR' // St. Moritz area
  if (code >= 7600 && code <= 7699) return 'GR' // Bregaglia area
  if (code >= 7700 && code <= 7799) return 'GR' // Val Müstair area
  if (code >= 8000 && code <= 8099) return 'ZH' // Zürich
  if (code >= 8100 && code <= 8199) return 'ZH' // Zürich area
  if (code >= 8200 && code <= 8299) return 'SH' // Schaffhausen
  if (code >= 8300 && code <= 8399) return 'ZH' // Kloten area
  if (code >= 8400 && code <= 8499) return 'ZH' // Winterthur
  if (code >= 8500 && code <= 8599) return 'TG' // Frauenfeld
  if (code >= 8600 && code <= 8699) return 'ZH' // Dübendorf area
  if (code >= 8700 && code <= 8799) return 'ZH' // Küsnacht area
  if (code >= 8800 && code <= 8899) return 'ZH' // Thalwil/Wädenswil area
  if (code >= 8900 && code <= 8999) return 'ZH' // Urdorf area
  if (code >= 9000 && code <= 9099) return 'SG' // St. Gallen
  if (code >= 9100 && code <= 9199) return 'AR' // Herisau
  if (code >= 9200 && code <= 9299) return 'TG' // Gossau SG area
  if (code >= 9300 && code <= 9399) return 'SG' // Wittenbach area
  if (code >= 9400 && code <= 9499) return 'SG' // Rorschach area
  if (code >= 9500 && code <= 9599) return 'SG' // Wil SG area
  if (code >= 9600 && code <= 9699) return 'SG' // Wattwil area
  if (code >= 9700 && code <= 9799) return 'SG' // Alt St. Johann area
  if (code >= 9800 && code <= 9899) return 'TG' // Tannzapfenland
  if (code >= 3960 && code <= 3969) return 'VS' // Sierre area
  if (code >= 1950 && code <= 1959) return 'VS' // Sion area
  if (code >= 6370 && code <= 6379) return 'NW' // Nidwalden
  if (code >= 6060 && code <= 6069) return 'OW' // Obwalden
  if (code >= 8750 && code <= 8759) return 'GL' // Glarus
  if (code >= 6460 && code <= 6469) return 'UR' // Uri
  
  return null
}

// Parse club name from raw data (remove postal code and rest)
function parseClubName(rawName: string, postalCode: string): string {
  // The raw name format is: "ClubName1234 TownKontakt: email@...Angebot..."
  // We need to extract just "ClubName" by finding where the postal code starts
  
  // Find the position of the postal code in the raw name
  const postalIndex = rawName.indexOf(postalCode);
  if (postalIndex > 0) {
    return rawName.substring(0, postalIndex).trim();
  }
  
  // Fallback: try to find any 4-digit number (postal code pattern)
  const match = rawName.match(/^(.+?)(\d{4})/);
  if (match) {
    return match[1].trim();
  }
  
  return rawName.trim();
}

// Parse league offerings
function parseLeagues(angebot: string): {
  hasNLAMen: boolean
  hasNLAWomen: boolean
  hasNLBMen: boolean
  hasNLBWomen: boolean
  has1LigaMen: boolean
  has1LigaWomen: boolean
  has2LigaMen: boolean
  has2LigaWomen: boolean
  has3LigaMen: boolean
  has3LigaWomen: boolean
  has4LigaMen: boolean
  has4LigaWomen: boolean
  has5LigaMen: boolean
  has5LigaWomen: boolean
  hasU23Men: boolean
  hasU23Women: boolean
  hasU20Men: boolean
  hasU20Women: boolean
  hasU18Men: boolean
  hasU18Women: boolean
} {
  const result = {
    hasNLAMen: false,
    hasNLAWomen: false,
    hasNLBMen: false,
    hasNLBWomen: false,
    has1LigaMen: false,
    has1LigaWomen: false,
    has2LigaMen: false,
    has2LigaWomen: false,
    has3LigaMen: false,
    has3LigaWomen: false,
    has4LigaMen: false,
    has4LigaWomen: false,
    has5LigaMen: false,
    has5LigaWomen: false,
    hasU23Men: false,
    hasU23Women: false,
    hasU20Men: false,
    hasU20Women: false,
    hasU18Men: false,
    hasU18Women: false,
  }

  // Check for men's leagues - "Männer (NLA – 5L)" means all leagues from NLA to 5L
  if (angebot.includes('Volleyball Männer') && angebot.includes('NLA')) {
    result.hasNLAMen = true
    result.hasNLBMen = true
    result.has1LigaMen = true
    result.has2LigaMen = true
    result.has3LigaMen = true
    result.has4LigaMen = true
    result.has5LigaMen = true
  }

  // Check for women's leagues - "Frauen (NLA – 5L)" means all leagues from NLA to 5L
  if (angebot.includes('Volleyball Frauen') && angebot.includes('NLA')) {
    result.hasNLAWomen = true
    result.hasNLBWomen = true
    result.has1LigaWomen = true
    result.has2LigaWomen = true
    result.has3LigaWomen = true
    result.has4LigaWomen = true
    result.has5LigaWomen = true
  }

  // Check for juniors - "Junioren (U23 – U13)" means U23, U20, U18
  if (angebot.includes('Volleyball Junioren') || angebot.includes('Junioren (U23')) {
    result.hasU23Men = true
    result.hasU20Men = true
    result.hasU18Men = true
  }

  // Check for juniorinnen - "Juniorinnen (U23 – U13)" means U23, U20, U18
  if (angebot.includes('Volleyball Juniorinnen') || angebot.includes('Juniorinnen (U23')) {
    result.hasU23Women = true
    result.hasU20Women = true
    result.hasU18Women = true
  }

  return result
}

async function importClubs() {
  console.log('Starting club import from raw data...')
  
  // Read the raw JSON file
  const dataPath = path.join(__dirname, '../data/swiss-volleyball-clubs-raw.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const rawClubs: RawClub[] = JSON.parse(rawData)
  
  console.log(`Found ${rawClubs.length} raw clubs to process`)
  
  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  
  for (const rawClub of rawClubs) {
    try {
      // Parse club name
      const name = parseClubName(rawClub.name, rawClub.postalCode)
      
      if (!name || name.length < 2) {
        console.log(`Skipping: Invalid name - ${rawClub.name.substring(0, 50)}`)
        skipped++
        continue
      }
      
      // Get canton from postal code
      const canton = getCantonFromPostalCode(rawClub.postalCode)
      
      if (!canton) {
        console.log(`Skipping: Unknown canton for postal code ${rawClub.postalCode} - ${name}`)
        skipped++
        continue
      }
      
      // Parse leagues
      const leagues = parseLeagues(rawClub.angebot)
      
      // Check if club already exists
      const existingClub = await prisma.club.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      })
      
      const clubData = {
        name,
        town: rawClub.town || '',
        canton: canton as any,
        website: rawClub.website || null,
        ...leagues
      }
      
      if (existingClub) {
        await prisma.club.update({
          where: { id: existingClub.id },
          data: clubData
        })
        console.log(`Updated: ${name}`)
        updated++
      } else {
        await prisma.club.create({
          data: clubData
        })
        console.log(`Created: ${name}`)
        created++
      }
    } catch (error) {
      console.error(`Error processing: ${rawClub.name.substring(0, 50)}`, error)
      errors++
    }
  }
  
  console.log('\n=== Import Summary ===')
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Errors: ${errors}`)
  console.log(`Total processed: ${rawClubs.length}`)
}

importClubs()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
