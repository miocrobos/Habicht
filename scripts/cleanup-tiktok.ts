/**
 * Clean up incorrect TikTok accounts
 * Remove TikToks that are clearly not the club's own account
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Generic/wrong TikTok accounts that got matched incorrectly
const INVALID_TIKTOKS = [
  'westsidevbc',
  'volleyballworld',
  'volleyballchannel_vbc',
  'ncaavolleyball',
  'usavolleyball_official',
  'pulse_athletics_vbc',
  'volleybox',
  'legavolleyfemminile',
  'raiffeisen',
  'tag',
  'deportes_audax',
  'volleykollen',
  'sv_schwaig_volleyball',
  'sportunion.at',
  'mauritiuswithbart',
  'tsv.volleyball.damen.1',
  'skstjohann',
  'rmitvolleyball',
  'metrovbc',
  'ncvolleyball',
  'emily_volleyball.1',
  'chloegvolleyball_3',
  'volleyvandals',
  'pmevolleyball',
  'dvv_volleyball',
  'volley.vibes70',
  'en',
  'thevolleyballroad',
  '305vbc',
  '365vbc',
  'brevardvolleyballclub',
  'dynamic_impact_vbc',
  'epic_vbc',
  'everlyvolleyball',
  'swatvolleyballclub1',
  'youngstarvolleyballclub4',
  'legacyvolleyballclub',
  'unitedvolleyballclub',
  'bennyvolleyball67',
  'selenas_volleyball_acc',
  'volleyballaaccont',
  'feminaforcevolleyvienna',
  'ktv_rhein_ahr_nette',
  'valpalavolley',
  'olten_fans',
  'sv08.steinach',
  'alexbrigantti',
  'charlet.burgdorf',
  '_vbg_',
  'volleybug',
  'ef.volley',
  // Additional invalid ones found
  'vbc.mcs',
  'nonavolleyballacademy',
  'swdpowervolleysdueren',
  'vbc_fully_f18',
  'martigny.1920',
  'mymontreux',
  'stvstgallenvolleyball',
  'volleyballch',
  'linktr.ee',
  'tvvolleyballmurte',
  'volleyvision50',
  'uriwomensclubvolleyball',
  'volley_naefels',
  'volleyeditx',
  'academyvolleyballl',
  'voltagevolleyballclub',
  'volleyrx',
  'mk_volley_balll',
  'emor.volley',
  'keinjax_volley',
  'zuzuzoe1',
  'graubuenden_official',
  'katiearbonn',
  'volley_wyz',
  'dragon_sportsmanagment',
  'volleycasoria',
  'volleyavery',
  'breevolleyball2029',
  'angoh_volley',
  'vfb_volleyball',
  'oikawa567',
  'sofascore_football',
  'coquivolleyballclub',
  'lk_volleyball',
  'stva_volleyball',
  'sportime_vbc',
  'europeanvolleyball',
  'volleybernhausen',
  'volley_wave',
  'pallavolistibrutti',
  'millenniumvbc',
  'volley_grail',
  // Remove more incorrectly matched
  'chenoisvolley',  // Genève Volley has this but it's Chênois
  'volleylugano',   // Only Volley Lugano should have this
  'vbcsion',        // Only VBC Sion should have this
  'volleyboysbienne', // Only Bienne Volleyboys should have
  'lyss_volleyball34',
  'team.hautlac',
  'kadettenschaffhausen',
  'tvlunkhofend1',
  'tsv_jona',
  'u20_vbcmartigny',
  'graubuenden_official',
  'linktr.ee'
]

async function main() {
  console.log('Cleaning up incorrect TikTok accounts...\n')
  
  let removed = 0
  
  for (const handle of INVALID_TIKTOKS) {
    const tiktokUrl = `https://tiktok.com/@${handle}`
    
    const updated = await prisma.club.updateMany({
      where: { tiktok: tiktokUrl },
      data: { tiktok: null }
    })
    
    if (updated.count > 0) {
      console.log(`Removed @${handle} from ${updated.count} club(s)`)
      removed += updated.count
    }
  }
  
  console.log(`\nTotal removed: ${removed}`)
  
  // Count remaining
  const remaining = await prisma.club.count({ where: { tiktok: { not: null } } })
  console.log(`Clubs with valid TikTok: ${remaining}`)
  
  // Show valid TikToks
  const validClubs = await prisma.club.findMany({
    where: { tiktok: { not: null } },
    select: { name: true, tiktok: true }
  })
  
  console.log('\nValid TikTok accounts:')
  for (const club of validClubs) {
    console.log(`  ${club.name}: ${club.tiktok}`)
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)
