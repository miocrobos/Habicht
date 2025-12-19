import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get default gradient based on gender and role
 */
const getDefaultGradient = (gender: string | null, role: string): string => {
  if (role === 'HYBRID') {
    return 'linear-gradient(135deg, #f97316 0%, #ffffff 100%)' // Orange to white
  }
  if (role === 'RECRUITER') {
    return 'linear-gradient(135deg, #dc2626 0%, #ffffff 100%)' // Red to white
  }
  // Player role
  if (gender === 'FEMALE') {
    return 'linear-gradient(135deg, #ec4899 0%, #ffffff 100%)' // Pink to white
  }
  return 'linear-gradient(135deg, #2563eb 0%, #ffffff 100%)' // Blue to white for male (default)
}

async function updateGradientBackgrounds() {
  try {
    console.log('Starting gradient background migration...')
    
    // Get all players
    const players = await prisma.player.findMany({
      select: {
        id: true,
        userId: true,
        gender: true,
        coverImage: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    })

    console.log(`Found ${players.length} players to process`)

    let updatedCount = 0
    let skippedCount = 0

    for (const player of players) {
      // Skip players who already have a custom cover image
      if (player.coverImage && player.coverImage !== '') {
        console.log(`Skipping ${player.user.email} - already has custom cover image`)
        skippedCount++
        continue
      }

      // Determine the appropriate gradient
      const gradient = getDefaultGradient(player.gender, player.user.role)

      // Update the player
      await prisma.player.update({
        where: { id: player.id },
        data: {
          coverImage: gradient
        }
      })

      console.log(`✓ Updated ${player.user.email} (${player.user.role}, ${player.gender}) with gradient: ${gradient.substring(0, 40)}...`)
      updatedCount++
    }

    // Get all recruiters
    const recruiters = await prisma.recruiter.findMany({
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    })

    console.log(`\nFound ${recruiters.length} recruiters to process`)

    for (const recruiter of recruiters) {
      // Determine the appropriate gradient (red for recruiters)
      const gradient = getDefaultGradient(null, recruiter.user.role)

      // Since recruiters don't have a coverImage field, we might need to skip this
      // or implement it differently. For now, let's log it.
      console.log(`ℹ Recruiter ${recruiter.user.email} - gradient would be: ${gradient.substring(0, 40)}...`)
    }

    console.log('\n=== Migration Complete ===')
    console.log(`✓ Updated: ${updatedCount} players`)
    console.log(`⊘ Skipped: ${skippedCount} players (already had custom backgrounds)`)
    console.log(`Total players processed: ${players.length}`)

  } catch (error) {
    console.error('Error updating gradient backgrounds:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
updateGradientBackgrounds()
  .then(() => {
    console.log('\n✅ Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })
