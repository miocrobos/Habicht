import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncBinningenLogo() {
  console.log('='.repeat(60))
  console.log('Syncing VB Binningen Logo to All Users')
  console.log('='.repeat(60))
  
  // Get the club with its current logo
  const club = await prisma.club.findFirst({
    where: { name: 'VB Binningen' }
  })
  
  if (!club) {
    console.log('❌ VB Binningen not found!')
    return
  }
  
  console.log(`\n✓ Found VB Binningen`)
  console.log(`  ID: ${club.id}`)
  console.log(`  Logo: ${club.logo ? club.logo.substring(0, 60) + '...' : 'None'}`)
  
  // Find all players with VB Binningen as their current club
  const playersWithClub = await prisma.player.findMany({
    where: { currentClubId: club.id },
    select: { id: true, firstName: true, lastName: true }
  })
  
  console.log(`\n📋 Players with VB Binningen as current club: ${playersWithClub.length}`)
  for (const p of playersWithClub) {
    console.log(`  - ${p.firstName} ${p.lastName}`)
  }
  
  // Find all ClubHistory entries for VB Binningen
  const historyWithClub = await prisma.clubHistory.findMany({
    where: { clubId: club.id },
    include: { player: { select: { firstName: true, lastName: true } } }
  })
  
  console.log(`\n📋 ClubHistory entries for VB Binningen: ${historyWithClub.length}`)
  
  // Update ClubHistory entries to use the club's current logo
  let updated = 0
  for (const h of historyWithClub) {
    if (h.clubLogo !== club.logo) {
      await prisma.clubHistory.update({
        where: { id: h.id },
        data: { clubLogo: club.logo }
      })
      console.log(`  ✓ Updated logo for ${h.player.firstName} ${h.player.lastName}'s history entry`)
      updated++
    }
  }
  
  // Also find ClubHistory entries by club name (for entries where clubId might be null)
  const historyByName = await prisma.clubHistory.findMany({
    where: { 
      clubName: { contains: 'Binningen', mode: 'insensitive' },
      clubId: null
    },
    include: { player: { select: { firstName: true, lastName: true } } }
  })
  
  console.log(`\n📋 ClubHistory entries by name "Binningen" (no clubId): ${historyByName.length}`)
  
  for (const h of historyByName) {
    if (h.clubLogo !== club.logo) {
      await prisma.clubHistory.update({
        where: { id: h.id },
        data: { 
          clubLogo: club.logo,
          clubId: club.id // Also link to the club
        }
      })
      console.log(`  ✓ Updated & linked ${h.player.firstName} ${h.player.lastName}'s history entry`)
      updated++
    }
  }
  
  console.log(`\n✅ Updated ${updated} ClubHistory entries with new logo`)
  console.log('\nNote: Player profiles that use player.currentClub.logo will automatically')
  console.log('      show the updated logo since it pulls from the Club table directly.')
}

syncBinningenLogo()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect())
