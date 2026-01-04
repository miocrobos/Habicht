const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // First, find the hybrid user by email
  const user = await prisma.user.findFirst({
    where: { 
      email: 'anshprasadiyer@gmail.com',
      role: 'HYBRID'
    }
  });
  
  console.log('User found:', JSON.stringify(user, null, 2));
  
  if (!user) {
    console.log('No hybrid user found');
    await prisma.$disconnect();
    return;
  }
  
  // Get the player profile
  const player = await prisma.player.findUnique({
    where: { userId: user.id },
    select: {
      firstName: true,
      lastName: true,
      canton: true,
      city: true,
      positions: true,
      profileImage: true,
      phone: true,
      instagram: true,
      bio: true,
      nationality: true,
      currentClubId: true,
      dateOfBirth: true,
    }
  });
  
  console.log('Player record:', JSON.stringify(player, null, 2));
  
  if (!player) {
    console.log('No player found');
    await prisma.$disconnect();
    return;
  }
  
  // Calculate age from dateOfBirth
  let age = null;
  if (player.dateOfBirth) {
    const birthDate = new Date(player.dateOfBirth);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }
  
  // Check if recruiter already exists
  const existingRecruiter = await prisma.recruiter.findUnique({
    where: { userId: user.id }
  });
  
  if (existingRecruiter) {
    console.log('Recruiter already exists:', JSON.stringify(existingRecruiter, null, 2));
    await prisma.$disconnect();
    return;
  }
  
  // Create recruiter profile using player data
  const recruiter = await prisma.recruiter.create({
    data: {
      userId: user.id,
      firstName: player.firstName,
      lastName: player.lastName,
      canton: player.canton,
      province: player.city,
      nationality: player.nationality,
      age: age,
      profileImage: player.profileImage,
      phone: player.phone,
      instagram: player.instagram,
      bio: player.bio,
      organization: 'Lutry-Lavaux Volleyball',
      coachRole: 'SCOUT',
      genderCoached: ['MALE'],
      positionsLookingFor: ['SETTER', 'OUTSIDE_HITTER', 'LIBERO', 'UNIVERSAL', 'OPPOSITE'],
      lookingForMembers: true,
      clubId: player.currentClubId,
    }
  });
  
  console.log('Created recruiter:', JSON.stringify(recruiter, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
