const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Find Ansh's user with player profile
  const user = await prisma.user.findFirst({
    where: { email: 'anshprasadiyer@gmail.com' },
    include: { 
      player: true,
      recruiter: true 
    }
  });
  
  console.log('User:', JSON.stringify(user, null, 2));
  
  if (user && !user.recruiter && user.player) {
    console.log('\nPlayer profile exists but no Recruiter profile!');
    console.log('Creating Recruiter profile for this HYBRID user...\n');
    
    // Find a default club to assign
    const defaultClub = await prisma.club.findFirst();
    
    if (!defaultClub) {
      console.log('No clubs found in database. Please create a club first.');
      return;
    }
    
    // Create a basic Recruiter profile using player data
    const recruiter = await prisma.recruiter.create({
      data: {
        userId: user.id,
        firstName: user.player.firstName,
        lastName: user.player.lastName,
        age: user.player.age || 18,
        nationality: user.player.nationality || 'Swiss',
        canton: user.player.canton || 'ZH',
        province: user.player.province,
        country: user.player.country || 'Switzerland',
        clubId: user.player.clubId || defaultClub.id,
        coachRole: 'Scout',
        genderCoached: user.player.gender ? [user.player.gender] : ['MALE'],
        positionsLookingFor: user.player.positions || [],
        organization: defaultClub.name,
        position: 'Scout',
        phone: user.player.phone,
        preferredLanguage: user.player.preferredLanguage,
        bio: user.player.bio,
        profileImage: user.player.profileImage,
        coverImage: user.player.coverImage,
        isActive: true,
        lookingForMembers: true,
      }
    });
    
    console.log('Created Recruiter profile:', JSON.stringify(recruiter, null, 2));
  } else if (user && user.recruiter) {
    console.log('\nRecruiter profile already exists!');
  } else if (user && !user.player) {
    console.log('\nNo Player profile exists either!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
