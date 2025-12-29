import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.club.update({
    where: { id: 'cmjrbp8kf0000w58oezsykonp' },
    data: { 
      has4LigaWomen: true,
      // Also update description to include senior team info
      description: 'VB Binningen is a women\'s and girls\' volleyball club in Binningen, Basel-Landschaft. Originally part of Damenriege Binningen since 2003, they became an independent club in 2016. They field teams in 4. Liga (Damen 1), plus youth teams in U23, U20, U18, and Kids Volley, with over 120 active members.'
    }
  })
  
  console.log('✅ VB Binningen Updated!')
  console.log('='.repeat(50))
  console.log(`  Name: ${updated.name}`)
  console.log(`  Website: ${updated.website}`)
  console.log(`  Instagram: @${updated.instagram}`)
  console.log(`  Logo: ${updated.logo ? '✓' : '✗'}`)
  console.log(`  Canton: ${updated.canton}`)
  console.log(`  Town: ${updated.town}`)
  console.log(`  Founded: ${updated.founded}`)
  console.log('')
  console.log('  Senior Leagues:')
  console.log(`    4. Liga Women: ${updated.has4LigaWomen ? '✓' : '✗'}`)
  console.log('')
  console.log('  Youth Teams:')
  console.log(`    U23 Women: ${updated.hasU23Women ? '✓' : '✗'}`)
  console.log(`    U20 Women: ${updated.hasU20Women ? '✓' : '✗'}`)
  console.log(`    U18 Women: ${updated.hasU18Women ? '✓' : '✗'}`)
  console.log('='.repeat(50))
}

main()
  .finally(() => prisma.$disconnect())
