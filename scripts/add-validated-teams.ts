/**
 * Add all 45 validated teams to the database
 * These teams appear in volleyball.ch official league listings
 */

import { PrismaClient, Canton, League } from '@prisma/client'

const prisma = new PrismaClient()

interface TeamData {
  name: string
  canton: Canton
  league: League
  town: string
  founded?: number
}

const VALIDATED_TEAMS: TeamData[] = [
  // 1. Liga Women - Gruppe A
  { name: 'Volley Espoirs Biel-Bienne', canton: 'BE', league: 'FIRST_LEAGUE', town: 'Biel' },
  { name: 'Rhone Volley', canton: 'VS', league: 'FIRST_LEAGUE', town: 'Martigny' },
  { name: 'VBC Servette Star-Onex', canton: 'GE', league: 'FIRST_LEAGUE', town: 'Genève' },
  { name: 'Genève Volley', canton: 'GE', league: 'FIRST_LEAGUE', town: 'Genève' },
  { name: 'NNV FriSpike', canton: 'FR', league: 'FIRST_LEAGUE', town: 'Fribourg' },
  { name: 'VBC NUC', canton: 'NE', league: 'FIRST_LEAGUE', town: 'Neuchâtel' },
  { name: 'VBC Nendaz', canton: 'VS', league: 'FIRST_LEAGUE', town: 'Nendaz' },
  { name: 'TV Murten Volleyball', canton: 'FR', league: 'FIRST_LEAGUE', town: 'Murten' },
  { name: 'VBC Cossonay', canton: 'VD', league: 'FIRST_LEAGUE', town: 'Cossonay' },
  { name: 'VBC Cheseaux', canton: 'VD', league: 'FIRST_LEAGUE', town: 'Cheseaux-sur-Lausanne' },
  
  // 1. Liga Women - Gruppe B
  { name: 'VB Therwil', canton: 'BL', league: 'FIRST_LEAGUE', town: 'Therwil' },
  { name: 'BTV Aarau', canton: 'AG', league: 'FIRST_LEAGUE', town: 'Aarau' },
  { name: 'TV Grenchen', canton: 'SO', league: 'FIRST_LEAGUE', town: 'Grenchen' },
  { name: 'Volley Köniz', canton: 'BE', league: 'FIRST_LEAGUE', town: 'Köniz' },
  { name: 'VBC Lalden', canton: 'VS', league: 'FIRST_LEAGUE', town: 'Lalden' },
  { name: 'Volley Möhlin', canton: 'AG', league: 'FIRST_LEAGUE', town: 'Möhlin' },
  { name: 'VBC Thun', canton: 'BE', league: 'FIRST_LEAGUE', town: 'Thun' },
  { name: 'VFM Volleyball Franches-Montagnes', canton: 'JU', league: 'FIRST_LEAGUE', town: 'Saignelégier' },
  { name: 'Volley Münsingen', canton: 'BE', league: 'FIRST_LEAGUE', town: 'Münsingen' },
  { name: 'VBC Langenthal', canton: 'BE', league: 'FIRST_LEAGUE', town: 'Langenthal' },
  { name: 'VBC Münchenbuchsee', canton: 'BE', league: 'FIRST_LEAGUE', town: 'Münchenbuchsee' },
  
  // 1. Liga Women - Gruppe C
  { name: 'NNV Eaglets Volley Aarau', canton: 'AG', league: 'FIRST_LEAGUE', town: 'Aarau' },
  { name: 'VBC Kanti Baden', canton: 'AG', league: 'FIRST_LEAGUE', town: 'Baden' },
  { name: 'VBC Spada Academica', canton: 'ZH', league: 'FIRST_LEAGUE', town: 'Zürich' },
  { name: 'Volley Luzern', canton: 'LU', league: 'FIRST_LEAGUE', town: 'Luzern' },
  { name: 'VB Neuenkirch', canton: 'LU', league: 'FIRST_LEAGUE', town: 'Neuenkirch' },
  { name: 'SAG Gordola', canton: 'TI', league: 'FIRST_LEAGUE', town: 'Gordola' },
  { name: 'Volley Lugano', canton: 'TI', league: 'FIRST_LEAGUE', town: 'Lugano' },
  { name: 'Volley Bellinzona', canton: 'TI', league: 'FIRST_LEAGUE', town: 'Bellinzona' },
  { name: 'FC Luzern Volleyball', canton: 'LU', league: 'FIRST_LEAGUE', town: 'Luzern' },
  { name: 'SFG Stabio', canton: 'TI', league: 'FIRST_LEAGUE', town: 'Stabio' },
  
  // 1. Liga Women - Gruppe D
  { name: 'STV St.Gallen Volleyball', canton: 'SG', league: 'FIRST_LEAGUE', town: 'St. Gallen' },
  { name: 'Volley Näfels', canton: 'GL', league: 'FIRST_LEAGUE', town: 'Näfels' },
  { name: 'VBC Voléro Zürich', canton: 'ZH', league: 'FIRST_LEAGUE', town: 'Zürich' },
  { name: 'Volley Aadorf', canton: 'TG', league: 'FIRST_LEAGUE', town: 'Aadorf' },
  { name: 'VBC Züri Unterland', canton: 'ZH', league: 'FIRST_LEAGUE', town: 'Kloten' },
  { name: 'Raiffeisen Volley Toggenburg', canton: 'SG', league: 'FIRST_LEAGUE', town: 'Wattwil' },
  { name: 'Pallavolo Kreuzlingen', canton: 'TG', league: 'FIRST_LEAGUE', town: 'Kreuzlingen' },
  { name: 'Volley Rüschlikon', canton: 'ZH', league: 'FIRST_LEAGUE', town: 'Rüschlikon' },
  { name: 'VC Smash Winterthur', canton: 'ZH', league: 'FIRST_LEAGUE', town: 'Winterthur' },
  { name: 'NNV Volleyball Academy', canton: 'AG', league: 'FIRST_LEAGUE', town: 'Aarau' },
  { name: 'Appenzeller Bären', canton: 'AI', league: 'FIRST_LEAGUE', town: 'Appenzell' },
  { name: 'VC Kanti Schaffhausen', canton: 'SH', league: 'FIRST_LEAGUE', town: 'Schaffhausen' },
  
  // NLA Teams (add key NLA teams)
  { name: 'Viteos NUC', canton: 'NE', league: 'NLA', town: 'Neuchâtel' },
  { name: 'Volley Düdingen', canton: 'FR', league: 'NLA', town: 'Düdingen' },
  { name: "Sm'Aesch Pfeffingen", canton: 'BL', league: 'NLA', town: 'Aesch' },
]

async function addTeams() {
  console.log('🏐 Adding 45 validated Swiss volleyball teams...\n')
  
  let added = 0
  let skipped = 0
  
  for (const team of VALIDATED_TEAMS) {
    try {
      const existing = await prisma.club.findFirst({
        where: { name: team.name }
      })
      
      if (existing) {
        console.log(`⏭️  Skipped (exists): ${team.name}`)
        skipped++
        continue
      }
      
      await prisma.club.create({
        data: {
          name: team.name,
          league: team.league,
          canton: team.canton,
          town: team.town,
          founded: team.founded,
          description: `Official ${team.league} team from ${team.town}, ${team.canton}`,
          website: `https://volleyball.ch/de/game-center?search=${encodeURIComponent(team.name)}`
        }
      })
      
      console.log(`✅ Added: ${team.name} (${team.canton}, ${team.league})`)
      added++
    } catch (error) {
      console.error(`❌ Error adding ${team.name}:`, error)
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`  ✅ Added: ${added} teams`)
  console.log(`  ⏭️  Skipped: ${skipped} teams`)
  console.log(`  📍 Total: ${VALIDATED_TEAMS.length} teams`)
}

addTeams()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
