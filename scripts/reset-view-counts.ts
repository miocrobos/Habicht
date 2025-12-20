import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetViewCounts() {
  try {
    console.log('Resetting all player view counts to 0...')
    
    // Delete all PlayerView records (clears view history)
    const deletedViews = await prisma.playerView.deleteMany({})
    console.log(`✅ Deleted ${deletedViews.count} PlayerView records`)
    
    // Reset all player view counts to 0
    const result = await prisma.player.updateMany({
      data: {
        views: 0
      }
    })

    console.log(`✅ Reset ${result.count} player view counts to 0`)
  } catch (error) {
    console.error('Error resetting view counts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetViewCounts()
  .then(() => {
    console.log('✅ View count reset complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Failed:', error)
    process.exit(1)
  })
