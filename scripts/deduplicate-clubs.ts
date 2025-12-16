import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Normalize club name - remove trailing numbers/suffixes
function normalizeClubName(name: string): string {
  return name
    .replace(/\s+\d+$/, '')  // Remove " 2", " 3", etc. at end
    .replace(/\s+[IVX]+$/, '') // Remove Roman numerals at end
    .trim()
}

async function main() {
  console.log('Starting club deduplication...\n')
  
  // Get all clubs
  const clubs = await prisma.club.findMany({
    orderBy: { name: 'asc' }
  })
  
  console.log(`Found ${clubs.length} clubs\n`)
  
  // Group clubs by normalized name
  const clubGroups = new Map<string, any[]>()
  
  for (const club of clubs) {
    const normalized = normalizeClubName(club.name)
    if (!clubGroups.has(normalized)) {
      clubGroups.set(normalized, [])
    }
    clubGroups.get(normalized)!.push(club)
  }
  
  console.log(`Found ${clubGroups.size} unique club names\n`)
  
  // Find duplicates
  const duplicates = Array.from(clubGroups.entries()).filter(([_, clubs]) => clubs.length > 1)
  
  if (duplicates.length === 0) {
    console.log('No duplicates found!')
    return
  }
  
  console.log(`Found ${duplicates.length} club groups with duplicates:\n`)
  
  for (const [normalizedName, clubList] of duplicates) {
    console.log(`\n${normalizedName} (${clubList.length} instances):`)
    for (const club of clubList) {
      console.log(`  - ${club.name} (ID: ${club.id})`)
    }
    
    // Pick the main club (prefer one without number suffix, or the first one)
    const mainClub = clubList.find(c => c.name === normalizedName) || clubList[0]
    const duplicateClubs = clubList.filter(c => c.id !== mainClub.id)
    
    console.log(`  Main: ${mainClub.name}`)
    console.log(`  Merging: ${duplicateClubs.map(c => c.name).join(', ')}`)
    
    // Merge league flags
    const mergedFlags: any = {}
    for (const club of clubList) {
      if (club.hasNLAMen) mergedFlags.hasNLAMen = true
      if (club.hasNLAWomen) mergedFlags.hasNLAWomen = true
      if (club.hasNLBMen) mergedFlags.hasNLBMen = true
      if (club.hasNLBWomen) mergedFlags.hasNLBWomen = true
      if (club.has1LigaMen) mergedFlags.has1LigaMen = true
      if (club.has1LigaWomen) mergedFlags.has1LigaWomen = true
      if (club.has2LigaMen) mergedFlags.has2LigaMen = true
      if (club.has2LigaWomen) mergedFlags.has2LigaWomen = true
      if (club.has3LigaMen) mergedFlags.has3LigaMen = true
      if (club.has3LigaWomen) mergedFlags.has3LigaWomen = true
      if (club.has4LigaMen) mergedFlags.has4LigaMen = true
      if (club.has4LigaWomen) mergedFlags.has4LigaWomen = true
      if (club.hasU23Men) mergedFlags.hasU23Men = true
      if (club.hasU23Women) mergedFlags.hasU23Women = true
      if (club.hasU19Men) mergedFlags.hasU19Men = true
      if (club.hasU19Women) mergedFlags.hasU19Women = true
      if (club.hasU17Men) mergedFlags.hasU17Men = true
      if (club.hasU17Women) mergedFlags.hasU17Women = true
    }
    
    // Pick best logo and website
    const bestLogo = clubList.find(c => c.logo && c.logo !== '🏐')?.logo || mainClub.logo
    const bestWebsite = clubList.find(c => c.website)?.website || mainClub.website
    
    // Update main club with merged data and normalized name
    await prisma.club.update({
      where: { id: mainClub.id },
      data: {
        name: normalizedName,
        logo: bestLogo,
        website: bestWebsite,
        ...mergedFlags
      }
    })
    
    console.log(`  ✓ Updated ${normalizedName} with merged league flags`)
    
    // Update all references to duplicate clubs
    for (const dupClub of duplicateClubs) {
      // Update clubHistory references
      await prisma.clubHistory.updateMany({
        where: { clubId: dupClub.id },
        data: { 
          clubId: mainClub.id,
          clubName: normalizedName
        }
      })
      
      // Update clubHistory by name
      await prisma.clubHistory.updateMany({
        where: { clubName: dupClub.name },
        data: { clubName: normalizedName }
      })
      
      // Update current players
      await prisma.player.updateMany({
        where: { currentClubId: dupClub.id },
        data: { currentClubId: mainClub.id }
      })
      
      // Update coaches
      await prisma.coach.updateMany({
        where: { clubId: dupClub.id },
        data: { clubId: mainClub.id }
      })
      
      // Update club managers
      await prisma.clubManager.updateMany({
        where: { clubId: dupClub.id },
        data: { clubId: mainClub.id }
      })
      
      // Update recruiters
      await prisma.recruiter.updateMany({
        where: { clubId: dupClub.id },
        data: { clubId: mainClub.id }
      })
      
      // Delete duplicate club
      await prisma.club.delete({
        where: { id: dupClub.id }
      })
      
      console.log(`  ✓ Deleted duplicate: ${dupClub.name}`)
    }
  }
  
  console.log('\n✓ Deduplication complete!')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
