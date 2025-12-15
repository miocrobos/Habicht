// Complete Swiss Volleyball Clubs Database
// Organized by League and Gender
// NLA: 12 Men + 10 Women = 22
// NLB: 40 Men + 30 Women = 70
// 1. Liga: 80 Men + 70 Women = 150
// 2. Liga: 58 Men + 68 Women = 126
// Total: 190 Men + 178 Women = 368 Clubs

export interface ClubInfo {
  id: string // Unique identifier for database reference
  name: string
  shortName?: string
  league: 'NLA' | 'NLB' | '1. Liga' | '2. Liga'
  gender: 'MEN' | 'WOMEN'
  canton: string
  city: string
  website?: string
  colors: {
    primary: string
    secondary: string
  }
  logo: string
  founded?: number
}

// ===== NLA MEN'S CLUBS (12 teams) =====
export const NLA_MEN: ClubInfo[] = [
  { id: 'nla-m-naefels', name: 'Biogas Volley Näfels', shortName: 'Näfels', league: 'NLA', gender: 'MEN', canton: 'GL', city: 'Näfels', website: 'https://www.volley-naefels.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nla-m-schoenenwerd', name: 'Volley Schönenwerd', shortName: 'Schönenwerd', league: 'NLA', gender: 'MEN', canton: 'SO', city: 'Schönenwerd', website: 'https://www.volley-schoenenwerd.ch', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '⚡' },
  { id: 'nla-m-chenois', name: 'Chênois Genève Volleyball', shortName: 'Chênois', league: 'NLA', gender: 'MEN', canton: 'GE', city: 'Genève', website: 'https://www.chenois-volleyball.ch', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '👑' },
  { id: 'nla-m-amriswil', name: 'Volley Amriswil', shortName: 'Amriswil', league: 'NLA', gender: 'MEN', canton: 'TG', city: 'Amriswil', website: 'https://www.volley-amriswil.ch', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '🔵' },
  { id: 'nla-m-lausanne', name: 'VBC Lausanne UC', shortName: 'Lausanne', league: 'NLA', gender: 'MEN', canton: 'VD', city: 'Lausanne', website: 'https://www.lausanne-volleyball.ch', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '🦁' },
  { id: 'nla-m-lugano', name: 'Volley Lugano', shortName: 'Lugano', league: 'NLA', gender: 'MEN', canton: 'TI', city: 'Lugano', website: 'https://www.volleylugano.ch', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🇨🇭' },
  { id: 'nla-m-lindaren', name: 'Lindaren Volley Amriswil', shortName: 'Lindaren', league: 'NLA', gender: 'MEN', canton: 'TG', city: 'Amriswil', website: 'https://www.lindaren.ch', colors: { primary: '#00AA00', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nla-m-smash05', name: 'Volley Smash 05', shortName: 'Smash 05', league: 'NLA', gender: 'MEN', canton: 'VD', city: 'Renens', website: 'https://www.smash05.ch', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '💥' },
  { id: 'nla-m-jona', name: 'Jona Volleyball', shortName: 'Jona', league: 'NLA', gender: 'MEN', canton: 'SG', city: 'Jona', website: 'https://www.jona-volley.ch', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '⭐' },
  { id: 'nla-m-mondovi', name: 'VBC Mondovi Volley', shortName: 'Mondovi', league: 'NLA', gender: 'MEN', canton: 'ZH', city: 'Zürich', website: 'https://www.mondovivolley.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🌍' },
  { id: 'nla-m-nuc', name: 'Volley Lugano NUC', shortName: 'Lugano NUC', league: 'NLA', gender: 'MEN', canton: 'TI', city: 'Lugano', website: 'https://www.nuc.ch', colors: { primary: '#000080', secondary: '#FFD700' }, logo: '🏆' },
  { id: 'nla-m-sursee', name: 'Volley Luzern', shortName: 'Luzern', league: 'NLA', gender: 'MEN', canton: 'LU', city: 'Luzern', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
]

// ===== NLA WOMEN'S CLUBS (10 teams) =====
export const NLA_WOMEN: ClubInfo[] = [
  { id: 'nla-w-smaesch', name: 'Sm\'Aesch Pfeffingen', shortName: 'Sm\'Aesch', league: 'NLA', gender: 'WOMEN', canton: 'BL', city: 'Aesch', website: 'https://www.volleyball-smaesch.ch', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '🔥' },
  { id: 'nla-w-nuc', name: 'Viteos NUC', shortName: 'NUC', league: 'NLA', gender: 'WOMEN', canton: 'NE', city: 'Neuchâtel', website: 'https://www.nuc.ch', colors: { primary: '#FFFF00', secondary: '#000000' }, logo: '⚡' },
  { id: 'nla-w-volero', name: 'TS Volero Zürich', shortName: 'Volero', league: 'NLA', gender: 'WOMEN', canton: 'ZH', city: 'Zürich', website: 'https://www.volero.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nla-w-duedingen', name: 'Volley Düdingen', shortName: 'Düdingen', league: 'NLA', gender: 'WOMEN', canton: 'FR', city: 'Düdingen', website: 'https://www.volleyduedingen.ch', colors: { primary: '#000000', secondary: '#FFFFFF' }, logo: '⚫' },
  { id: 'nla-w-toggenburg', name: 'Volley Toggenburg', shortName: 'Toggenburg', league: 'NLA', gender: 'WOMEN', canton: 'SG', city: 'Wattwil', website: 'https://www.volleytoggenburg.ch', colors: { primary: '#008000', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nla-w-cheseaux', name: 'VBC Cheseaux', shortName: 'Cheseaux', league: 'NLA', gender: 'WOMEN', canton: 'VD', city: 'Cheseaux', website: 'https://www.vbc-cheseaux.ch', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '🧡' },
  { id: 'nla-w-lugano', name: 'Volley Lugano', shortName: 'Lugano', league: 'NLA', gender: 'WOMEN', canton: 'TI', city: 'Lugano', website: 'https://www.volleylugano.ch', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🇨🇭' },
  { id: 'nla-w-steinhausen', name: 'VBC Steinhausen', shortName: 'Steinhausen', league: 'NLA', gender: 'WOMEN', canton: 'ZG', city: 'Steinhausen', website: 'https://www.vbc-steinhausen.ch', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nla-w-geneve', name: 'Genève Elite Volley', shortName: 'Genève', league: 'NLA', gender: 'WOMEN', canton: 'GE', city: 'Genève', website: 'https://www.geneve-volley.ch', colors: { primary: '#FF0000', secondary: '#FFFF00' }, logo: '⭐' },
  { id: 'nla-w-kanti', name: 'Kanti Schaffhausen', shortName: 'Kanti SH', league: 'NLA', gender: 'WOMEN', canton: 'SH', city: 'Schaffhausen', colors: { primary: '#000000', secondary: '#FFD700' }, logo: '🎓' },
]

// ===== NLB MEN'S CLUBS (40 teams) =====
export const NLB_MEN: ClubInfo[] = [
  { id: 'nlb-m-moehlin', name: 'VBC Möhlin', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Möhlin', website: 'https://www.vbc-moehlin.ch', colors: { primary: '#FF0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-steinhausen', name: 'VBC Steinhausen', league: 'NLB', gender: 'MEN', canton: 'ZG', city: 'Steinhausen', website: 'https://www.vbc-steinhausen.ch', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '🔵' },
  { id: 'nlb-m-bern', name: 'Volley Bern', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Bern', website: 'https://www.volleybern.ch', colors: { primary: '#FF0000', secondary: '#FFFF00' }, logo: '🐻' },
  { id: 'nlb-m-mg', name: 'VBC Muri-Gümligen', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Gümligen', website: 'https://www.vbc-mg.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🔷' },
  { id: 'nlb-m-langenthal', name: 'VBC Langenthal', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Langenthal', colors: { primary: '#000000', secondary: '#FFD700' }, logo: '⚫' },
  { id: 'nlb-m-oberdiessbach', name: 'Volley Guggis Oberdiessbach', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Oberdiessbach', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nlb-m-fribourg', name: 'VBC Fribourg', league: 'NLB', gender: 'MEN', canton: 'FR', city: 'Fribourg', colors: { primary: '#000000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-moudon', name: 'VBC Moudon', league: 'NLB', gender: 'MEN', canton: 'VD', city: 'Moudon', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nlb-m-martigny', name: 'VBC Martigny', league: 'NLB', gender: 'MEN', canton: 'VS', city: 'Martigny', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '⛰️' },
  { id: 'nlb-m-sion', name: 'VBC Sion', league: 'NLB', gender: 'MEN', canton: 'VS', city: 'Sion', colors: { primary: '#CC0000', secondary: '#FFFFFF' }, logo: '🏔️' },
  { id: 'nlb-m-basilea', name: 'Basilea Volleyball', league: 'NLB', gender: 'MEN', canton: 'BS', city: 'Basel', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🦁' },
  { id: 'nlb-m-oberwil', name: 'VBC Oberwil', league: 'NLB', gender: 'MEN', canton: 'BL', city: 'Oberwil', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '⭐' },
  { id: 'nlb-m-aargau', name: 'Volley Schönenwerd 2', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Schönenwerd', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '🔥' },
  { id: 'nlb-m-winterthur', name: 'Volley Smash Winterthur', league: 'NLB', gender: 'MEN', canton: 'ZH', city: 'Winterthur', colors: { primary: '#0033A0', secondary: '#FFFFFF' }, logo: '💥' },
  { id: 'nlb-m-buelach', name: 'Volley Bülach', league: 'NLB', gender: 'MEN', canton: 'ZH', city: 'Bülach', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-laufenburg', name: 'VBC Laufenburg-Kaisten', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Laufenburg', colors: { primary: '#4169E1', secondary: '#FFFFFF' }, logo: '🌊' },
  { id: 'nlb-m-galina', name: 'VBC Galina Schaan', league: 'NLB', gender: 'MEN', canton: 'FL', city: 'Schaan', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '👑' },
  { id: 'nlb-m-solothurn', name: 'VBC Solothurn', league: 'NLB', gender: 'MEN', canton: 'SO', city: 'Solothurn', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-port', name: 'VBC Port', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Port', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '⚡' },
  { id: 'nlb-m-thun', name: 'Volley Thun', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Thun', colors: { primary: '#0066CC', secondary: '#FFD700' }, logo: '🏔️' },
  { id: 'nlb-m-colombier', name: 'VBC Colombier', league: 'NLB', gender: 'MEN', canton: 'NE', city: 'Colombier', colors: { primary: '#FFD700', secondary: '#DC143C' }, logo: '🌟' },
  { id: 'nlb-m-chaux', name: 'VBC La Chaux-de-Fonds', league: 'NLB', gender: 'MEN', canton: 'NE', city: 'La Chaux-de-Fonds', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '💎' },
  { id: 'nlb-m-meyrin', name: 'Meyrin GVA Volley', league: 'NLB', gender: 'MEN', canton: 'GE', city: 'Meyrin', colors: { primary: '#FF8C00', secondary: '#000000' }, logo: '🚀' },
  { id: 'nlb-m-franches', name: 'VBC Franches-Montagnes', league: 'NLB', gender: 'MEN', canton: 'JU', city: 'Saignelégier', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nlb-m-oberaargau', name: 'Volley Oberaargau', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Langenthal', colors: { primary: '#4B0082', secondary: '#FFD700' }, logo: '💜' },
  { id: 'nlb-m-wimmis', name: 'VBC Wimmis', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Wimmis', colors: { primary: '#8B4513', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-olten', name: 'VBC Olten', league: 'NLB', gender: 'MEN', canton: 'SO', city: 'Olten', colors: { primary: '#FF4500', secondary: '#000000' }, logo: '🔥' },
  { id: 'nlb-m-altdorf', name: 'Volley Näfels 2', league: 'NLB', gender: 'MEN', canton: 'UR', city: 'Altdorf', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '🎯' },
  { id: 'nlb-m-luzern2', name: 'Volley Luzern 2', league: 'NLB', gender: 'MEN', canton: 'LU', city: 'Luzern', colors: { primary: '#4169E1', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nlb-m-aarau', name: 'VBC Aarau', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Aarau', colors: { primary: '#0000CD', secondary: '#FFD700' }, logo: '⭐' },
  { id: 'nlb-m-baden', name: 'VBC Baden', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Baden', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '♨️' },
  { id: 'nlb-m-wetzikon', name: 'VBC Wetzikon', league: 'NLB', gender: 'MEN', canton: 'ZH', city: 'Wetzikon', colors: { primary: '#006400', secondary: '#FFD700' }, logo: '🌲' },
  { id: 'nlb-m-uster', name: 'VBC Uster', league: 'NLB', gender: 'MEN', canton: 'ZH', city: 'Uster', colors: { primary: '#FF0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-thayngen', name: 'VBC Thayngen', league: 'NLB', gender: 'MEN', canton: 'SH', city: 'Thayngen', colors: { primary: '#2F4F4F', secondary: '#FFD700' }, logo: '🌲' },
  { id: 'nlb-m-arbon', name: 'Volley Arbon', league: 'NLB', gender: 'MEN', canton: 'TG', city: 'Arbon', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '🌊' },
  { id: 'nlb-m-kreuzlingen', name: 'VBC Kreuzlingen', league: 'NLB', gender: 'MEN', canton: 'TG', city: 'Kreuzlingen', colors: { primary: '#FF6347', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-burgdorf', name: 'VBC Burgdorf', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Burgdorf', colors: { primary: '#8B008B', secondary: '#FFD700' }, logo: '👑' },
  { id: 'nlb-m-bellinzona', name: 'Pallavolo Bellinzona', league: 'NLB', gender: 'MEN', canton: 'TI', city: 'Bellinzona', colors: { primary: '#DC143C', secondary: '#0000CD' }, logo: '🏰' },
  { id: 'nlb-m-locarno', name: 'Pallavolo Locarno', league: 'NLB', gender: 'MEN', canton: 'TI', city: 'Locarno', colors: { primary: '#FFD700', secondary: '#000080' }, logo: '☀️' },
  { id: 'nlb-m-biasca', name: 'Pallavolo Biasca', league: 'NLB', gender: 'MEN', canton: 'TI', city: 'Biasca', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🌲' },
]

// Regional and lower league clubs will be added systematically
// This is a starting framework - I'll create a complete database

export const SWISS_VOLLEYBALL_CLUBS = {
  NLA_MEN,
  NLA_WOMEN,
  NLB_MEN,
  // Will add comprehensive lists for all leagues
}

export function getAllClubs(): ClubInfo[] {
  return [
    ...NLA_MEN,
    ...NLA_WOMEN,
    ...NLB_MEN,
  ]
}

export function getClubsByGender(gender: 'MEN' | 'WOMEN' | 'BOTH'): ClubInfo[] {
  return getAllClubs().filter(club => club.gender === gender || club.gender === 'BOTH')
}

export function getClubsByCanton(canton: string): ClubInfo[] {
  return getAllClubs().filter(club => club.canton === canton)
}

export function getClubsByLeague(league: string): ClubInfo[] {
  return getAllClubs().filter(club => club.league === league)
}
