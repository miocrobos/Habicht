import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const allClubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      canton: true,
      town: true,
      website: true,
      // Select league flags to check which leagues the club participates in
      hasNLAMen: true,
      hasNLAWomen: true,
      hasNLBMen: true,
      hasNLBWomen: true,
    },
    orderBy: { name: 'asc' }
  })

  // Group clubs by name
  const clubsByName: Record<string, any[]> = {}
  allClubs.forEach(club => {
    if (!clubsByName[club.name]) {
      clubsByName[club.name] = []
    }
    clubsByName[club.name].push(club)
  })

  // Find clubs with multiple teams
  const multiLeagueClubs = Object.entries(clubsByName)
    .filter(([name, teams]) => teams.length > 1)
    .map(([name, teams]) => ({
      name,
      teams: teams.map(t => ({ league: t.league, canton: t.canton, website: t.website }))
    }))

  console.log(`\nClubs with multiple teams: ${multiLeagueClubs.length}\n`)
  
  multiLeagueClubs.forEach(club => {
    console.log(`${club.name}:`)
    club.teams.forEach((team, idx) => {
      console.log(`  ${idx + 1}. ${team.league} (${team.canton})`)
    })
    console.log()
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(error => {
    console.error(error)
    prisma.$disconnect()
    process.exit(1)
  })
