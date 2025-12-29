import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()

async function main() {
  // Remove logos that return wrong content type
  const result = await p.club.updateMany({
    where: { name: { in: ['STV Buttisholz', 'TSV Rechthalten'] } },
    data: { logo: null }
  })
  console.log('Removed invalid logos:', result.count)
  
  // Final count
  const withLogo = await p.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await p.club.count({ where: { logo: null } })
  
  console.log('\nFinal state:')
  console.log(`  Clubs with logo: ${withLogo}`)
  console.log(`  Clubs without logo: ${withoutLogo}`)
  
  await p.$disconnect()
}

main()
