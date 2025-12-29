/**
 * Verify all club logos are accessible
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const p = new PrismaClient();

async function checkLogo(url) {
  try {
    const response = await axios.head(url, { 
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return { ok: true, status: response.status };
  } catch (error) {
    // Try GET if HEAD fails
    try {
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        responseType: 'arraybuffer'
      });
      return { ok: true, status: response.status };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

async function run() {
  console.log('🔍 Verifying all club logos are accessible...\n');
  
  const clubs = await p.club.findMany({
    where: { logo: { not: null } },
    select: { id: true, name: true, logo: true }
  });
  
  console.log(`Checking ${clubs.length} club logos...\n`);
  
  let accessible = 0;
  let failed = [];
  
  // Check in batches of 10
  for (let i = 0; i < clubs.length; i += 10) {
    const batch = clubs.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(async (club) => {
        const result = await checkLogo(club.logo);
        return { club, result };
      })
    );
    
    for (const { club, result } of results) {
      if (result.ok) {
        accessible++;
      } else {
        failed.push({ name: club.name, logo: club.logo, error: result.error });
      }
    }
    
    // Progress
    process.stdout.write(`\r  Checked ${Math.min(i + 10, clubs.length)}/${clubs.length}...`);
  }
  
  console.log('\n\n📊 Results:');
  console.log(`   Accessible: ${accessible}`);
  console.log(`   Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed logos:');
    failed.forEach(f => {
      console.log(`   ${f.name}: ${f.error}`);
      console.log(`      ${f.logo.substring(0, 70)}...`);
    });
  } else {
    console.log('\n✅ All logos are accessible!');
  }
  
  await p.$disconnect();
}

run().catch(console.error);
