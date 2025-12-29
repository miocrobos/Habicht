import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBinningen() {
  console.log('='.repeat(60))
  console.log('Updating VB Binningen with Instagram & League Data')
  console.log('='.repeat(60))
  
  // Step 1: Update Instagram
  console.log('\n1. Adding Instagram handle...')
  await prisma.club.update({
    where: { id: 'cmjrbp8kf0000w58oezsykonp' },
    data: { instagram: 'volleyballbinningen' }
  })
  console.log('  ✓ Instagram: @volleyballbinningen')
  
  // Step 2: Check Swiss Volley Game Center for league participation
  console.log('\n2. Checking Swiss Volley Game Center for senior leagues...')
  
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  let has3LigaWomen = false
  let has4LigaWomen = false
  let has5LigaWomen = false
  
  // Check regional leagues in NWSV (Northwestern Switzerland - includes BL)
  const regions = ['NWSV'] // Northwestern Switzerland region where Basel-Landschaft is
  const leagues = ['3. Liga', '4. Liga', '5. Liga']
  
  for (const region of regions) {
    for (const league of leagues) {
      try {
        const url = `https://www.volleyball.ch/de/game-center?gender=f&i_region=${region}&i_league=${encodeURIComponent(league)}`
        console.log(`  Checking ${league} in ${region}...`)
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(3000)
        
        const content = await page.content()
        
        if (content.toLowerCase().includes('binningen')) {
          console.log(`  ✓ Found Binningen in ${league}!`)
          if (league === '3. Liga') has3LigaWomen = true
          if (league === '4. Liga') has4LigaWomen = true
          if (league === '5. Liga') has5LigaWomen = true
        }
      } catch (e: any) {
        console.log(`  Error checking ${league}: ${e.message?.substring(0, 50)}`)
      }
    }
  }
  
  // Also try searching directly for Binningen
  console.log('\n3. Searching directly for VB Binningen...')
  try {
    await page.goto('https://www.volleyball.ch/de/game-center', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Look for search input
    const searchInput = await page.$('input[type="search"], input[placeholder*="Suche"], .search-input')
    if (searchInput) {
      await searchInput.fill('Binningen')
      await page.waitForTimeout(2000)
      
      const results = await page.content()
      if (results.toLowerCase().includes('binningen')) {
        console.log('  ✓ Found Binningen in search results')
        
        // Click on any Binningen link
        const binningenLink = await page.$('a:has-text("Binningen")')
        if (binningenLink) {
          await binningenLink.click()
          await page.waitForTimeout(2000)
          
          const clubPage = await page.content()
          console.log('  Checking club page for league info...')
          
          if (clubPage.includes('3. Liga')) {
            has3LigaWomen = true
            console.log('  ✓ 3. Liga Women confirmed')
          }
          if (clubPage.includes('4. Liga')) {
            has4LigaWomen = true
            console.log('  ✓ 4. Liga Women confirmed')
          }
          if (clubPage.includes('5. Liga')) {
            has5LigaWomen = true
            console.log('  ✓ 5. Liga Women confirmed')
          }
        }
      }
    }
  } catch (e: any) {
    console.log(`  Error: ${e.message?.substring(0, 80)}`)
  }
  
  await browser.close()
  
  // Step 4: Update database with league info
  console.log('\n4. Updating database with league info...')
  
  const updated = await prisma.club.update({
    where: { id: 'cmjrbp8kf0000w58oezsykonp' },
    data: {
      has3LigaWomen,
      has4LigaWomen,
      has5LigaWomen,
    }
  })
  
  console.log('\n✅ Final club data:')
  console.log(`  Name: ${updated.name}`)
  console.log(`  Instagram: @${updated.instagram}`)
  console.log(`  Logo: ${updated.logo ? '✓' : '✗'}`)
  console.log(`  3. Liga Women: ${updated.has3LigaWomen}`)
  console.log(`  4. Liga Women: ${updated.has4LigaWomen}`)
  console.log(`  5. Liga Women: ${updated.has5LigaWomen}`)
  console.log(`  U23 Women: ${updated.hasU23Women}`)
  console.log(`  U20 Women: ${updated.hasU20Women}`)
  console.log(`  U18 Women: ${updated.hasU18Women}`)
}

updateBinningen()
  .catch(e => console.error('Error:', e))
  .finally(() => prisma.$disconnect())
