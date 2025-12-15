/**
 * Add U23, U19, U17, and lower league teams (2nd, 3rd, 4th Liga) for existing clubs
 * Based on real Swiss volleyball club structures
 */

import { PrismaClient, Canton, League } from '@prisma/client'

const prisma = new PrismaClient()

interface TeamToAdd {
  name: string
  canton: Canton
  league: League
  town: string
  founded?: number
}

const additionalTeams: TeamToAdd[] = [
  // Sm'Aesch Pfeffingen - Multiple teams
  { name: "Sm'Aesch Pfeffingen U23", canton: 'BL', league: 'YOUTH_U23', town: 'Aesch' },
  { name: "Sm'Aesch Pfeffingen U19", canton: 'BL', league: 'YOUTH_U19', town: 'Aesch' },
  { name: "Sm'Aesch Pfeffingen U17", canton: 'BL', league: 'YOUTH_U17', town: 'Aesch' },
  
  // Volley Amriswil - Multiple teams
  { name: 'Volley Amriswil U23', canton: 'TG', league: 'YOUTH_U23', town: 'Amriswil' },
  { name: 'Volley Amriswil U19', canton: 'TG', league: 'YOUTH_U19', town: 'Amriswil' },
  { name: 'Volley Amriswil U17', canton: 'TG', league: 'YOUTH_U17', town: 'Amriswil' },
  { name: 'Volley Amriswil 2', canton: 'TG', league: 'SECOND_LEAGUE', town: 'Amriswil' },
  
  // VFM (Franches-Montagnes) - Youth teams
  { name: 'VFM U19', canton: 'JU', league: 'YOUTH_U19', town: 'Saignelégier' },
  { name: 'VFM U17', canton: 'JU', league: 'YOUTH_U17', town: 'Saignelégier' },
  
  // Volley Luzern - Multiple teams
  { name: 'Volley Luzern U23', canton: 'LU', league: 'YOUTH_U23', town: 'Luzern' },
  { name: 'Volley Luzern U19', canton: 'LU', league: 'YOUTH_U19', town: 'Luzern' },
  { name: 'Volley Luzern U17', canton: 'LU', league: 'YOUTH_U17', town: 'Luzern' },
  { name: 'Volley Luzern 2', canton: 'LU', league: 'SECOND_LEAGUE', town: 'Luzern' },
  
  // Viteos NUC - Multiple teams
  { name: 'Viteos NUC U23', canton: 'NE', league: 'YOUTH_U23', town: 'Neuchâtel' },
  { name: 'Viteos NUC U19', canton: 'NE', league: 'YOUTH_U19', town: 'Neuchâtel' },
  { name: 'Viteos NUC U17', canton: 'NE', league: 'YOUTH_U17', town: 'Neuchâtel' },
  
  // Volley Düdingen - Youth teams
  { name: 'Volley Düdingen U19', canton: 'FR', league: 'YOUTH_U19', town: 'Düdingen' },
  { name: 'Volley Düdingen U17', canton: 'FR', league: 'YOUTH_U17', town: 'Düdingen' },
  
  // Lausanne UC - Multiple teams
  { name: 'Lausanne UC U23', canton: 'VD', league: 'YOUTH_U23', town: 'Lausanne' },
  { name: 'Lausanne UC U19', canton: 'VD', league: 'YOUTH_U19', town: 'Lausanne' },
  { name: 'Lausanne UC U17', canton: 'VD', league: 'YOUTH_U17', town: 'Lausanne' },
  { name: 'Lausanne UC 2', canton: 'VD', league: 'SECOND_LEAGUE', town: 'Lausanne' },
  
  // Volley Schönenwerd - Youth and lower teams
  { name: 'Volley Schönenwerd U23', canton: 'SO', league: 'YOUTH_U23', town: 'Schönenwerd' },
  { name: 'Volley Schönenwerd U19', canton: 'SO', league: 'YOUTH_U19', town: 'Schönenwerd' },
  { name: 'Volley Schönenwerd U17', canton: 'SO', league: 'YOUTH_U17', town: 'Schönenwerd' },
  { name: 'Volley Schönenwerd 2', canton: 'SO', league: 'SECOND_LEAGUE', town: 'Schönenwerd' },
  
  // STV St. Gallen - Multiple teams
  { name: 'STV St.Gallen U23', canton: 'SG', league: 'YOUTH_U23', town: 'St. Gallen' },
  { name: 'STV St.Gallen U19', canton: 'SG', league: 'YOUTH_U19', town: 'St. Gallen' },
  { name: 'STV St.Gallen U17', canton: 'SG', league: 'YOUTH_U17', town: 'St. Gallen' },
  { name: 'STV St.Gallen 2', canton: 'SG', league: 'SECOND_LEAGUE', town: 'St. Gallen' },
  
  // VBC Voléro Zürich - Youth teams
  { name: 'VBC Voléro Zürich U23', canton: 'ZH', league: 'YOUTH_U23', town: 'Zürich' },
  { name: 'VBC Voléro Zürich U19', canton: 'ZH', league: 'YOUTH_U19', town: 'Zürich' },
  { name: 'VBC Voléro Zürich U17', canton: 'ZH', league: 'YOUTH_U17', town: 'Zürich' },
  
  // Volley Köniz - Lower leagues
  { name: 'Volley Köniz 2', canton: 'BE', league: 'SECOND_LEAGUE', town: 'Köniz' },
  { name: 'Volley Köniz 3', canton: 'BE', league: 'THIRD_LEAGUE', town: 'Köniz' },
  { name: 'Volley Köniz U19', canton: 'BE', league: 'YOUTH_U19', town: 'Köniz' },
  
  // VBC Thun - Multiple teams
  { name: 'VBC Thun 2', canton: 'BE', league: 'SECOND_LEAGUE', town: 'Thun' },
  { name: 'VBC Thun 3', canton: 'BE', league: 'THIRD_LEAGUE', town: 'Thun' },
  { name: 'VBC Thun U19', canton: 'BE', league: 'YOUTH_U19', town: 'Thun' },
  
  // Volley Münsingen - Lower leagues  
  { name: 'Volley Münsingen 2', canton: 'BE', league: 'SECOND_LEAGUE', town: 'Münsingen' },
  { name: 'Volley Münsingen 3', canton: 'BE', league: 'THIRD_LEAGUE', town: 'Münsingen' },
  
  // VBC Langenthal - Lower leagues
  { name: 'VBC Langenthal 2', canton: 'BE', league: 'SECOND_LEAGUE', town: 'Langenthal' },
  { name: 'VBC Langenthal 3', canton: 'BE', league: 'THIRD_LEAGUE', town: 'Langenthal' },
  { name: 'VBC Langenthal U19', canton: 'BE', league: 'YOUTH_U19', town: 'Langenthal' },
  
  // BTV Aarau - Multiple teams
  { name: 'BTV Aarau 2', canton: 'AG', league: 'SECOND_LEAGUE', town: 'Aarau' },
  { name: 'BTV Aarau 3', canton: 'AG', league: 'THIRD_LEAGUE', town: 'Aarau' },
  { name: 'BTV Aarau U19', canton: 'AG', league: 'YOUTH_U19', town: 'Aarau' },
  
  // Volley Möhlin - Lower leagues
  { name: 'Volley Möhlin 2', canton: 'AG', league: 'SECOND_LEAGUE', town: 'Möhlin' },
  { name: 'Volley Möhlin 3', canton: 'AG', league: 'THIRD_LEAGUE', town: 'Möhlin' },
  
  // VBC Kanti Baden - Youth teams
  { name: 'VBC Kanti Baden U19', canton: 'AG', league: 'YOUTH_U19', town: 'Baden' },
  { name: 'VBC Kanti Baden U17', canton: 'AG', league: 'YOUTH_U17', town: 'Baden' },
  
  // VC Smash Winterthur - Lower leagues
  { name: 'VC Smash Winterthur 2', canton: 'ZH', league: 'SECOND_LEAGUE', town: 'Winterthur' },
  { name: 'VC Smash Winterthur 3', canton: 'ZH', league: 'THIRD_LEAGUE', town: 'Winterthur' },
  { name: 'VC Smash Winterthur U19', canton: 'ZH', league: 'YOUTH_U19', town: 'Winterthur' },
  
  // VBC Züri Unterland - Lower leagues
  { name: 'VBC Züri Unterland 2', canton: 'ZH', league: 'SECOND_LEAGUE', town: 'Bülach' },
  { name: 'VBC Züri Unterland 3', canton: 'ZH', league: 'THIRD_LEAGUE', town: 'Bülach' },
  
  // Volley Aadorf - Lower leagues
  { name: 'Volley Aadorf 2', canton: 'TG', league: 'SECOND_LEAGUE', town: 'Aadorf' },
  { name: 'Volley Aadorf 3', canton: 'TG', league: 'THIRD_LEAGUE', town: 'Aadorf' },
  
  // Raiffeisen Volley Toggenburg - Lower leagues
  { name: 'Raiffeisen Volley Toggenburg 2', canton: 'SG', league: 'SECOND_LEAGUE', town: 'Wattwil' },
  { name: 'Raiffeisen Volley Toggenburg 3', canton: 'SG', league: 'THIRD_LEAGUE', town: 'Wattwil' },
  
  // Volley Näfels - Lower leagues
  { name: 'Volley Näfels 2', canton: 'GL', league: 'SECOND_LEAGUE', town: 'Näfels' },
  { name: 'Volley Näfels 3', canton: 'GL', league: 'THIRD_LEAGUE', town: 'Näfels' },
  
  // VBC Spada Academica - Youth teams
  { name: 'VBC Spada Academica U19', canton: 'ZH', league: 'YOUTH_U19', town: 'Zürich' },
  { name: 'VBC Spada Academica U17', canton: 'ZH', league: 'YOUTH_U17', town: 'Zürich' },
  
  // Genève Volley - Youth teams
  { name: 'Genève Volley U19', canton: 'GE', league: 'YOUTH_U19', town: 'Genève' },
  { name: 'Genève Volley U17', canton: 'GE', league: 'YOUTH_U17', town: 'Genève' },
  { name: 'Genève Volley 2', canton: 'GE', league: 'SECOND_LEAGUE', town: 'Genève' },
  
  // VBC Servette Star-Onex - Lower leagues
  { name: 'VBC Servette Star-Onex 2', canton: 'GE', league: 'SECOND_LEAGUE', town: 'Onex' },
  { name: 'VBC Servette Star-Onex 3', canton: 'GE', league: 'THIRD_LEAGUE', town: 'Onex' },
  
  // VBC Cossonay - Lower leagues
  { name: 'VBC Cossonay 2', canton: 'VD', league: 'SECOND_LEAGUE', town: 'Cossonay' },
  { name: 'VBC Cossonay 3', canton: 'VD', league: 'THIRD_LEAGUE', town: 'Cossonay' },
  
  // VBC Cheseaux - Lower leagues
  { name: 'VBC Cheseaux 2', canton: 'VD', league: 'SECOND_LEAGUE', town: 'Cheseaux' },
  { name: 'VBC Cheseaux 3', canton: 'VD', league: 'THIRD_LEAGUE', town: 'Cheseaux' },
  
  // Volley Lugano - Youth and lower leagues
  { name: 'Volley Lugano 2', canton: 'TI', league: 'SECOND_LEAGUE', town: 'Lugano' },
  { name: 'Volley Lugano U19', canton: 'TI', league: 'YOUTH_U19', town: 'Lugano' },
  
  // SAG Gordola - Lower leagues
  { name: 'SAG Gordola 2', canton: 'TI', league: 'SECOND_LEAGUE', town: 'Gordola' },
  { name: 'SAG Gordola 3', canton: 'TI', league: 'THIRD_LEAGUE', town: 'Gordola' },
  
  // Volley Bellinzona - Lower leagues
  { name: 'Volley Bellinzona 2', canton: 'TI', league: 'SECOND_LEAGUE', town: 'Bellinzona' },
  { name: 'Volley Bellinzona 3', canton: 'TI', league: 'THIRD_LEAGUE', town: 'Bellinzona' },
  
  // VB Neuenkirch - Lower leagues
  { name: 'VB Neuenkirch 2', canton: 'LU', league: 'SECOND_LEAGUE', town: 'Neuenkirch' },
  { name: 'VB Neuenkirch 3', canton: 'LU', league: 'THIRD_LEAGUE', town: 'Neuenkirch' },
  
  // FC Luzern Volleyball - Youth teams
  { name: 'FC Luzern Volleyball U19', canton: 'LU', league: 'YOUTH_U19', town: 'Luzern' },
  { name: 'FC Luzern Volleyball U17', canton: 'LU', league: 'YOUTH_U17', town: 'Luzern' },
  
  // Volley Rüschlikon - Lower leagues
  { name: 'Volley Rüschlikon 2', canton: 'ZH', league: 'SECOND_LEAGUE', town: 'Rüschlikon' },
  { name: 'Volley Rüschlikon 3', canton: 'ZH', league: 'THIRD_LEAGUE', town: 'Rüschlikon' },
  
  // Pallavolo Kreuzlingen - Lower leagues
  { name: 'Pallavolo Kreuzlingen 2', canton: 'TG', league: 'SECOND_LEAGUE', town: 'Kreuzlingen' },
  { name: 'Pallavolo Kreuzlingen 3', canton: 'TG', league: 'THIRD_LEAGUE', town: 'Kreuzlingen' },
  
  // VC Kanti Schaffhausen - Youth teams
  { name: 'VC Kanti Schaffhausen U19', canton: 'SH', league: 'YOUTH_U19', town: 'Schaffhausen' },
  { name: 'VC Kanti Schaffhausen U17', canton: 'SH', league: 'YOUTH_U17', town: 'Schaffhausen' },
  
  // Appenzeller Bären - Lower leagues
  { name: 'Appenzeller Bären 2', canton: 'AI', league: 'SECOND_LEAGUE', town: 'Appenzell' },
  { name: 'Appenzeller Bären 3', canton: 'AI', league: 'THIRD_LEAGUE', town: 'Appenzell' },
  
  // VBC Lalden - Lower leagues
  { name: 'VBC Lalden 2', canton: 'VS', league: 'SECOND_LEAGUE', town: 'Lalden' },
  { name: 'VBC Lalden 3', canton: 'VS', league: 'THIRD_LEAGUE', town: 'Lalden' },
  
  // VBC Nendaz - Lower leagues
  { name: 'VBC Nendaz 2', canton: 'VS', league: 'SECOND_LEAGUE', town: 'Nendaz' },
  { name: 'VBC Nendaz 3', canton: 'VS', league: 'THIRD_LEAGUE', town: 'Nendaz' },
  
  // TV Murten - Lower leagues
  { name: 'TV Murten 2', canton: 'FR', league: 'SECOND_LEAGUE', town: 'Murten' },
  { name: 'TV Murten U19', canton: 'FR', league: 'YOUTH_U19', town: 'Murten' },
  
  // VB Therwil - Lower leagues
  { name: 'VB Therwil 2', canton: 'BL', league: 'SECOND_LEAGUE', town: 'Therwil' },
  { name: 'VB Therwil 3', canton: 'BL', league: 'THIRD_LEAGUE', town: 'Therwil' },
  
  // TV Grenchen - Lower leagues
  { name: 'TV Grenchen 2', canton: 'SO', league: 'SECOND_LEAGUE', town: 'Grenchen' },
  { name: 'TV Grenchen 3', canton: 'SO', league: 'THIRD_LEAGUE', town: 'Grenchen' },
]

async function addTeams() {
  console.log(`🏐 Adding ${additionalTeams.length} youth and lower league teams...\n`)
  
  let added = 0
  let skipped = 0
  
  for (const team of additionalTeams) {
    try {
      // Check if club already exists
      const existing = await prisma.club.findFirst({
        where: {
          name: team.name,
        },
      })
      
      if (existing) {
        console.log(`⏭️  Skipped: ${team.name} (already exists)`)
        skipped++
        continue
      }
      
      // Create the club
      await prisma.club.create({
        data: {
          name: team.name,
          town: team.town,
          canton: team.canton,
          league: team.league,
          founded: team.founded,
        },
      })
      
      console.log(`✅ Added: ${team.name} (${team.canton}, ${team.league})`)
      added++
    } catch (error) {
      console.error(`❌ Error adding ${team.name}:`, error)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`✅ Added: ${added} teams`)
  console.log(`⏭️  Skipped: ${skipped} teams`)
}

addTeams()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
