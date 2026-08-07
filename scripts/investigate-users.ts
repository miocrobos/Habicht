import { prisma } from '../lib/prisma'

// Read-only investigation of specific users we want to restore.
async function main() {
  const needles = ['kamsiyochukwuugoji', 'ansh', 'nik', 'jule']

  console.log('=== Users matching needles ===')
  for (const n of needles) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: n, mode: 'insensitive' } },
          { name: { contains: n, mode: 'insensitive' } },
        ],
      },
      include: {
        player: { select: { id: true, firstName: true, lastName: true } },
        recruiter: { select: { id: true, firstName: true, lastName: true } },
        hybrid: { select: { id: true } },
        clubManager: { select: { id: true } },
      },
    })
    console.log(`\n--- needle: "${n}" -> ${users.length} user(s) ---`)
    for (const u of users) {
      console.log({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        hasPlayer: !!u.player,
        player: u.player,
        hasRecruiter: !!u.recruiter,
        recruiter: u.recruiter,
        hasHybrid: !!u.hybrid,
        hasClubManager: !!u.clubManager,
      })
    }
  }

  console.log('\n\n=== Users with NO profile (player/recruiter/hybrid/clubManager) ===')
  const orphanUsers = await prisma.user.findMany({
    where: {
      player: null,
      recruiter: null,
      hybrid: null,
      clubManager: null,
      role: { not: 'ADMIN' },
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  console.log(`Count: ${orphanUsers.length}`)
  orphanUsers.forEach((u) => console.log(u))

  console.log('\n\n=== Totals ===')
  const [userCount, playerCount, recruiterCount, hybridCount, newsCount] = await Promise.all([
    prisma.user.count(),
    prisma.player.count(),
    prisma.recruiter.count(),
    prisma.hybrid.count(),
    prisma.news.count(),
  ])
  console.log({ userCount, playerCount, recruiterCount, hybridCount, newsCount })

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
