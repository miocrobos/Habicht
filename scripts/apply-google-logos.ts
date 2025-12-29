/**
 * Apply Google Image Logos - Verified
 * 
 * Some logos from Google search are wrong clubs, this applies only verified good ones
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Verified correct logos from Google Image search
const VERIFIED_LOGOS: { name: string; logo: string }[] = [
  {
    name: 'BIWI VFM',
    logo: 'https://www.vfm.ch/data/web/vfm2019.ch/uploads/logo_biwi-vfm_2022.png'
  },
  {
    name: 'BMV 92',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/be215a75373bbfafddc0752e2ce3f74bbe9cbd36/20134_BMV%2092.png'
  },
  {
    name: 'Bienne Volleyboys',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/b09fde5f138055b1e90eb5534be6936d6efb56f3/20102_Bienne%20Volleyboys.png'
  },
  {
    name: 'City Volley Basel',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/c67554ba46902df2ff03866ec5804ff14909a815/52082_City%20Volley%20Basel.png'
  },
  // Lindaren Volley - found Volley Luzern logo, WRONG
  {
    name: 'Lutry-Lavaux Volleyball',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/5c427a3c339e2f5a3282691153350ab540a9ec22/19846_Lutry-Lavaux%20VB.png'
  },
  {
    name: 'Pallavolo-Novaggio-Bedigliora',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/e348e4c7291e97249752799e7bf41406d8e078e6/22501_Pallavolo-Novaggio-Bedigliora.png'
  },
  // STV Buttisholz - white logo on white bg, might not work well
  {
    name: 'STV St. Gallen',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/e683541b8b263ed705439201b67310fa2ad720d3/22242_STV%20St.%20Gallen.png'
  },
  {
    name: "Sm'Aesch Pfeffingen",
    logo: 'https://smaeschpfeffingen.ch/wp-content/uploads/2024/07/typod_Logo.svg'
  },
  {
    name: 'TS Volero Zürich',
    logo: 'https://vbc.volero.ch/uploads/945/admin/website_settings/Logo_Volero_quadrat.jpg'
  },
  {
    name: 'TSV Rechthalten',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/6f09b9df443f73c0546c6ac7dc9ec0ea323fb2a0/20328_TSV%20Rechthalten.png'
  },
  {
    name: 'TV Hüttwilen',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/3b5b74f18f126bde65ebc9b05affd4923d7d3b8b/22144_TV%20H%C3%BCttwilen.png'
  },
  // Turnverein Horgen - found STV Wil logo, WRONG
  // VBC Avully - found VBC Swiss generic logo, WRONG
  // VBC Chênois Genève - found VBC Meyrin logo, WRONG
  // VBC Dietwil - found VBC Swiss generic logo, WRONG
  {
    name: 'VBC Küssnacht',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/61a5bcebc5c318a3b47cf24761e89669eda02f66/21554_VBC%20K%C3%BCssnacht.png'
  },
  {
    name: 'VBC Lengnau',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/bcca16c9559ea341bbcbd3a998d159b1fec30e25/28544_VBC%20Lengnau.png'
  },
  {
    name: 'VBC Lignieres',
    logo: 'http://vbc.bplaced.net/VBC_Lignieres/Accueil_files/VBC%20Lignieres_230911_064544%20%281%29.png'
  },
  {
    name: 'VBC Littau',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/631bb81cf7f12e07543dc5ba98c385b5ccd28e97/21559_VBC%20Littau.png'
  },
  // VBC Muri-Gümligen - found VBC Grosshöchstetten logo, WRONG
  // VBC Seftigen - found VBC Studen logo, WRONG  
  // VBC Sixieme 7 - found VBC Visp logo, WRONG
  {
    name: 'VBC Viamala Thusis',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/edd0f232ae404d522d7ed8539e396cba3d6de35f/22419_VBC%20Viamala%20Thusis.png'
  },
  {
    name: 'VBR Rickenbach',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/81e208bcfd2cccc9b1391e91213e6b3a67087c73/22182_VBR%20Rickenbach.png'
  },
  {
    name: 'Volley Amriswil',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/9d5fc5b4b7500979a87ef1a1177b341df41000df/22040_Volley%20Amriswil.png'
  },
  // Volley Bern - found Volley Uni Bern logo, might be wrong
  // Volley GraPa - found SwissVolley generic logo, WRONG
  {
    name: 'Volley Näfels',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/a0b3bcf3ec99582df6830109faefaf6805feb338/22390_Volley%20N%C3%A4fels.png'
  },
  {
    name: 'Volleyball Papiermühle',
    logo: 'https://volleymanager.volleyball.ch/_Resources/Persistent/98d608a10de79eef7ddaf9122624d9ecbd3d2836/Team_877_Volleyball%20Papierm%C3%BChle.jpg'
  },
  // Volleyball-Club Volketswil - found STV Wil logo, WRONG
]

async function main() {
  console.log('🔧 Applying Verified Google Image Logos\n')
  console.log('========================================\n')

  let updated = 0

  for (const item of VERIFIED_LOGOS) {
    const club = await prisma.club.findFirst({
      where: { name: item.name },
      select: { id: true, name: true, logo: true }
    })

    if (!club) {
      console.log(`❌ ${item.name}: NOT FOUND`)
      continue
    }

    if (club.logo) {
      console.log(`⚠️ ${item.name}: Already has logo, skipping`)
      continue
    }

    await prisma.club.update({
      where: { id: club.id },
      data: { logo: item.logo }
    })

    console.log(`✅ ${item.name}: Logo added`)
    updated++
  }

  console.log(`\n📊 Updated ${updated} clubs`)

  // Final count
  const withLogo = await prisma.club.count({ where: { logo: { not: null } } })
  const withoutLogo = await prisma.club.count({ where: { logo: null } })
  
  console.log('\n📊 Final Count:')
  console.log(`   Clubs with logo: ${withLogo}`)
  console.log(`   Clubs without logo: ${withoutLogo}`)

  await prisma.$disconnect()
}

main()
