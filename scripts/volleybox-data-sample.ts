/**
 * Sample data collected from Volleybox.net for Swiss Volleyball Clubs
 * 
 * Data structure based on volleybox.net information
 * 
 * Swiss League 2025/26 (NLA - Men):
 * - Chênois Genève VB
 * - Colombier Volley
 * - Lausanne UC
 * - STV St. Gallen
 * - Volley Schönenwerd
 * - Volley Amriswil
 * - TSV Jona
 * - Volley Näfels
 */

interface VolleyboxPlayer {
  name: string
  firstName?: string
  lastName?: string
  jerseyNumber: number
  position: 'Setter' | 'Opposite' | 'Outside Hitter' | 'Middle-blocker' | 'Libero'
  height: number // in cm
  dateOfBirth: string
  nationality: string
  profileUrl: string
}

interface VolleyboxTeam {
  name: string
  league: string
  season: string
  country: string
  town: string
  founded?: number
  website?: string
  profileUrl: string
  players: VolleyboxPlayer[]
}

// Sample data from Chênois Genève VB (2025/26 season)
export const chenosiGeneveVB_2025_26: VolleyboxTeam = {
  name: 'Chênois Genève VB',
  league: 'Swiss League (NLA)',
  season: '2025/26',
  country: 'Switzerland',
  town: 'Genève',
  founded: 1972,
  website: 'http://www.chenoisvolley.ch/',
  profileUrl: 'https://volleybox.net/chenois-geneve-vb-t1415/players',
  players: [
    {
      name: 'Clément Diverchy',
      firstName: 'Clément',
      lastName: 'Diverchy',
      jerseyNumber: 8,
      position: 'Setter',
      height: 193,
      dateOfBirth: '1998-01-01',
      nationality: 'France',
      profileUrl: 'https://volleybox.net/clement-diverchy-p18876/clubs'
    },
    {
      name: 'Nohan Grandjean',
      firstName: 'Nohan',
      lastName: 'Grandjean',
      jerseyNumber: 9,
      position: 'Setter',
      height: 193,
      dateOfBirth: '2007-01-01',
      nationality: 'Switzerland',
      profileUrl: 'https://volleybox.net/nohan-grandjean-p200463/clubs'
    },
    {
      name: 'Antonio Dos Santos',
      firstName: 'Antonio',
      lastName: 'Dos Santos',
      jerseyNumber: 2,
      position: 'Opposite',
      height: 197,
      dateOfBirth: '1999-01-01',
      nationality: 'Brazil',
      profileUrl: 'https://volleybox.net/antonio-dos-santos-p31881/clubs'
    },
    {
      name: 'James Norris',
      firstName: 'James',
      lastName: 'Norris',
      jerseyNumber: 4,
      position: 'Opposite',
      height: 195,
      dateOfBirth: '1999-01-01',
      nationality: 'USA',
      profileUrl: 'https://volleybox.net/james-norris-p94511/clubs'
    },
    {
      name: 'Joosep Kurik',
      firstName: 'Joosep',
      lastName: 'Kurik',
      jerseyNumber: 5,
      position: 'Outside Hitter',
      height: 203,
      dateOfBirth: '2007-01-01',
      nationality: 'Estonia',
      profileUrl: 'https://volleybox.net/joosep-kurik-p101354/clubs'
    },
    {
      name: 'Jovan Djokic',
      firstName: 'Jovan',
      lastName: 'Djokic',
      jerseyNumber: 14,
      position: 'Outside Hitter',
      height: 190,
      dateOfBirth: '1993-01-01',
      nationality: 'Switzerland',
      profileUrl: 'https://volleybox.net/jovan-djokic-p13520/clubs'
    },
    {
      name: 'Ervin Ozgur',
      firstName: 'Ervin',
      lastName: 'Ozgur',
      jerseyNumber: 18,
      position: 'Outside Hitter',
      height: 188,
      dateOfBirth: '2004-01-01',
      nationality: 'Switzerland',
      profileUrl: 'https://volleybox.net/ervin-ozgur-p259634/clubs'
    },
    {
      name: 'Nadir Douib',
      firstName: 'Nadir',
      lastName: 'Douib',
      jerseyNumber: 19,
      position: 'Outside Hitter',
      height: 183,
      dateOfBirth: '1996-01-01',
      nationality: 'France',
      profileUrl: 'https://volleybox.net/nadir-douib-p30503/clubs'
    },
    {
      name: 'Stefan Kovačević',
      firstName: 'Stefan',
      lastName: 'Kovačević',
      jerseyNumber: 3,
      position: 'Middle-blocker',
      height: 207,
      dateOfBirth: '1995-01-01',
      nationality: 'Serbia',
      profileUrl: 'https://volleybox.net/stefan-kovacevic-p43436/clubs'
    },
    {
      name: 'Damien Geneux',
      firstName: 'Damien',
      lastName: 'Geneux',
      jerseyNumber: 12,
      position: 'Middle-blocker',
      height: 193,
      dateOfBirth: '2003-01-01',
      nationality: 'Switzerland',
      profileUrl: 'https://volleybox.net/damien-geneux-p215859/clubs'
    },
    {
      name: 'Kévin Sejdija',
      firstName: 'Kévin',
      lastName: 'Sejdija',
      jerseyNumber: 15,
      position: 'Middle-blocker',
      height: 201,
      dateOfBirth: '2006-01-01',
      nationality: 'Switzerland',
      profileUrl: 'https://volleybox.net/kevin-sejdija-p259636/clubs'
    },
    {
      name: 'Dennis Del Valle',
      firstName: 'Dennis',
      lastName: 'Del Valle',
      jerseyNumber: 7,
      position: 'Libero',
      height: 175,
      dateOfBirth: '1989-01-01',
      nationality: 'Puerto Rico',
      profileUrl: 'https://volleybox.net/dennis-del-valle-p1929/clubs'
    },
    {
      name: 'Luan Abazi',
      firstName: 'Luan',
      lastName: 'Abazi',
      jerseyNumber: 10,
      position: 'Libero',
      height: 180,
      dateOfBirth: '2008-01-01',
      nationality: 'Switzerland',
      profileUrl: 'https://volleybox.net/luan-abazi-p282978/clubs'
    }
  ]
}

/**
 * URLs for other Swiss League (NLA) teams 2025/26:
 * 
 * Men's NLA Teams:
 * 1. Chênois Genève VB - https://volleybox.net/chenois-geneve-vb-t1415/players
 * 2. Colombier Volley - https://volleybox.net/colombier-volley-t4040/players
 * 3. Lausanne UC - https://volleybox.net/lausanne-uc-t1602/players
 * 4. STV St. Gallen - https://volleybox.net/stv-st-gallen-t6931/players
 * 5. Volley Schönenwerd - https://volleybox.net/volley-schonenwerd-t2365/players
 * 6. Volley Amriswil - https://volleybox.net/volley-amriswil-t1414/players
 * 7. TSV Jona - https://volleybox.net/tsv-jona-t26260/players
 * 8. Volley Näfels - https://volleybox.net/volley-nafels-t7506/players
 * 
 * Women's NLA Teams (from women.volleybox.net):
 * - Refer to: https://women.volleybox.net/search?q=Swiss+League
 * 
 * Swiss League B (NLB) 2025/26:
 * - https://volleybox.net/men-swiss-league-b-2025-26-o39055/classification
 * 
 * 1. Liga 2025/26:
 * - https://volleybox.net/men-swiss-championship-1ln-men-2025-26-o40172/classification
 */

export const swissVolleyballTeamURLs = {
  nla_men_2025_26: [
    'https://volleybox.net/chenois-geneve-vb-t1415/players',
    'https://volleybox.net/colombier-volley-t4040/players',
    'https://volleybox.net/lausanne-uc-t1602/players',
    'https://volleybox.net/stv-st-gallen-t6931/players',
    'https://volleybox.net/volley-schonenwerd-t2365/players',
    'https://volleybox.net/volley-amriswil-t1414/players',
    'https://volleybox.net/tsv-jona-t26260/players',
    'https://volleybox.net/volley-nafels-t7506/players'
  ],
  nlb_men_2025_26: 'https://volleybox.net/men-swiss-league-b-2025-26-o39055/classification',
  first_league_men_2025_26: 'https://volleybox.net/men-swiss-championship-1ln-men-2025-26-o40172/classification'
}

/**
 * To collect all data, you would need to:
 * 1. Fetch each team URL from the arrays above
 * 2. Parse the HTML/JSON to extract player information
 * 3. Map canton based on team town (Genève -> GE, St. Gallen -> SG, etc.)
 * 4. Import into your database
 * 
 * Note: Volleybox.net may have rate limiting and terms of service regarding data scraping.
 * Consider contacting them for official API access or data partnership.
 */
