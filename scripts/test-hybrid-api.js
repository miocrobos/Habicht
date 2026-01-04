async function main() {
  try {
    const response = await fetch('http://localhost:3000/api/hybrids/cmjx559jn00004j7jk6j3g4ak');
    const data = await response.json();
    
    console.log('API Response status:', response.status);
    console.log('\n=== Recruiter Data ===');
    console.log('genderCoached:', data.hybrid?.recruiter?.genderCoached);
    console.log('positionsLookingFor:', data.hybrid?.recruiter?.positionsLookingFor);
    console.log('lookingForMembers:', data.hybrid?.recruiter?.lookingForMembers);
    console.log('coachRole:', data.hybrid?.recruiter?.coachRole);
    console.log('organization:', data.hybrid?.recruiter?.organization);
    console.log('Full recruiter:', JSON.stringify(data.hybrid?.recruiter, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
