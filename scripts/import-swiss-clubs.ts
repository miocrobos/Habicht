import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ClubData {
  name: string
  town: string
  canton: string
  website: string | null
  hasNLAMen?: boolean
  hasNLAWomen?: boolean
  hasNLBMen?: boolean
  hasNLBWomen?: boolean
  has1LigaMen?: boolean
  has1LigaWomen?: boolean
  has2LigaMen?: boolean
  has2LigaWomen?: boolean
  has3LigaMen?: boolean
  has3LigaWomen?: boolean
  has4LigaMen?: boolean
  has4LigaWomen?: boolean
  has5LigaMen?: boolean
  has5LigaWomen?: boolean
  hasU23Men?: boolean
  hasU23Women?: boolean
  hasU20Men?: boolean
  hasU20Women?: boolean
  hasU18Men?: boolean
  hasU18Women?: boolean
  logo?: string | null
}

async function importClubs() {
  console.log('Starting club import...')
  
  // Read the JSON file
  const dataPath = path.join(__dirname, '../data/swiss-volleyball-clubs.json')
  const rawData = fs.readFileSync(dataPath, 'utf-8')
  const data = JSON.parse(rawData)
  
  console.log(`Found ${data.clubs.length} clubs to import`)
  
  let created = 0
  let updated = 0
  let errors = 0
  
  for (const club of data.clubs as ClubData[]) {
    try {
      // Check if club already exists by name
      const existingClub = await prisma.club.findFirst({
        where: {
          name: {
            equals: club.name,
            mode: 'insensitive'
          }
        }
      })
      
      const clubData = {
        name: club.name,
        town: club.town,
        canton: club.canton as any,
        website: club.website || null,
        hasNLAMen: club.hasNLAMen || false,
        hasNLAWomen: club.hasNLAWomen || false,
        hasNLBMen: club.hasNLBMen || false,
        hasNLBWomen: club.hasNLBWomen || false,
        has1LigaMen: club.has1LigaMen || false,
        has1LigaWomen: club.has1LigaWomen || false,
        has2LigaMen: club.has2LigaMen || false,
        has2LigaWomen: club.has2LigaWomen || false,
        has3LigaMen: club.has3LigaMen || false,
        has3LigaWomen: club.has3LigaWomen || false,
        has4LigaMen: club.has4LigaMen || false,
        has4LigaWomen: club.has4LigaWomen || false,
        has5LigaMen: club.has5LigaMen || false,
        has5LigaWomen: club.has5LigaWomen || false,
        hasU23Men: club.hasU23Men || false,
        hasU23Women: club.hasU23Women || false,
        hasU20Men: club.hasU20Men || false,
        hasU20Women: club.hasU20Women || false,
        hasU18Men: club.hasU18Men || false,
        hasU18Women: club.hasU18Women || false,
      }
      
      if (existingClub) {
        // Update existing club
        await prisma.club.update({
          where: { id: existingClub.id },
          data: clubData
        })
        console.log(`Updated: ${club.name}`)
        updated++
      } else {
        // Create new club
        await prisma.club.create({
          data: clubData
        })
        console.log(`Created: ${club.name}`)
        created++
      }
    } catch (error) {
      console.error(`Error processing ${club.name}:`, error)
      errors++
    }
  }
  
  console.log('\n=== Import Summary ===')
  console.log(`Created: ${created}`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)
  console.log(`Total processed: ${data.clubs.length}`)
}

importClubs()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
