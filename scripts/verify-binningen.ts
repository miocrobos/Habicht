import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  const club = await prisma.club.findFirst({
    where: { name: 'VB Binningen' }
  })
  
  if (club) {
    console.log('✅ VB Binningen is in the database!')
    console.log(JSON.stringify(club, null, 2))
  } else {
    console.log('❌ Club not found!')
  }
  
  await prisma.$disconnect()
}

verify()
