import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting club league migration...')
  
  // Get all clubs
  const clubs = await prisma.club.findMany()
  
  console.log(`Found ${clubs.length} clubs`)
  
  // Group clubs by name
  const clubsByName = new Map<string, any[]>()
  
  for (const club of clubs) {
    if (!clubsByName.has(club.name)) {
      clubsByName.set(club.name, [])
    }
    clubsByName.get(club.name)!.push(club)
  }
  
  console.log(`Found ${clubsByName.size} unique club names`)
  
  // For each unique club name, merge all instances
  for (const [name, clubInstances] of clubsByName.entries()) {
    console.log(`\nProcessing ${name} (${clubInstances.length} instances)`)
    
    // Pick the first instance as the base
    const baseClub = clubInstances[0]
    
    // Build the league flags based on all instances
    const leagueFlags: any = {
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
      hasU23Men: false,
      hasU23Women: false,
      hasU19Men: false,
      hasU19Women: false,
      hasU17Men: false,
      hasU17Women: false,
    }
    
    // Check all players' clubHistory to determine which leagues
    for (const clubInstance of clubInstances) {
      const clubHistory = await prisma.clubHistory.findMany({
        where: {
          clubName: name
        },
        include: {
          player: true
        }
      })
      
      for (const history of clubHistory) {
        const gender = history.player.gender
        const league = history.league
        
        if (league && gender) {
          const isMale = gender === 'MALE'
          
          switch (league) {
            case 'NLA':
              if (isMale) leagueFlags.hasNLAMen = true
              else leagueFlags.hasNLAWomen = true
              break
            case 'NLB':
              if (isMale) leagueFlags.hasNLBMen = true
              else leagueFlags.hasNLBWomen = true
              break
            case '1. Liga':
            case '1st Liga':
              if (isMale) leagueFlags.has1LigaMen = true
              else leagueFlags.has1LigaWomen = true
              break
            case '2. Liga':
            case '2nd Liga':
              if (isMale) leagueFlags.has2LigaMen = true
              else leagueFlags.has2LigaWomen = true
              break
            case '3. Liga':
            case '3rd Liga':
              if (isMale) leagueFlags.has3LigaMen = true
              else leagueFlags.has3LigaWomen = true
              break
            case '4. Liga':
            case '4th Liga':
              if (isMale) leagueFlags.has4LigaMen = true
              else leagueFlags.has4LigaWomen = true
              break
            case 'U23':
              if (isMale) leagueFlags.hasU23Men = true
              else leagueFlags.hasU23Women = true
              break
            case 'U19':
              if (isMale) leagueFlags.hasU19Men = true
              else leagueFlags.hasU19Women = true
              break
            case 'U17':
              if (isMale) leagueFlags.hasU17Men = true
              else leagueFlags.hasU17Women = true
              break
          }
        }
      }
    }
    
    // Collect best logo, website from all instances
    let bestLogo = baseClub.logo
    let bestWebsite = baseClub.website
    
    for (const instance of clubInstances) {
      if (!bestLogo && instance.logo) bestLogo = instance.logo
      if (!bestWebsite && instance.website) bestWebsite = instance.website
    }
    
    console.log(`  League flags:`, leagueFlags)
    console.log(`  Logo: ${bestLogo ? 'Yes' : 'No'}, Website: ${bestWebsite ? 'Yes' : 'No'}`)
  }
  
  console.log('\n✓ Analysis complete. Ready to apply changes.')
  console.log('\nTo proceed, update the Prisma schema and run this script again.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
