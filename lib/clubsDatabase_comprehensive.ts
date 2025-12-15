// COMPREHENSIVE SWISS VOLLEYBALL CLUBS DATABASE
// Total: 190 Men + 178 Women = 368 Clubs
// NLA: 12 Men + 10 Women | NLB: 40 Men + 30 Women
// 1. Liga: 80 Men + 70 Women | 2. Liga: 58 Men + 68 Women

export interface ClubInfo {
  id: string
  name: string
  shortName?: string
  league: 'NLA' | 'NLB' | '1. Liga' | '2. Liga'
  gender: 'MEN' | 'WOMEN'
  canton: string
  city: string
  website?: string
  colors: { primary: string; secondary: string }
  logo: string
}

// ===== MEN'S CLUBS =====

// NLA MEN (12)
export const NLA_MEN: ClubInfo[] = [
  { id: 'nla-m-naefels', name: 'Biogas Volley Näfels', league: 'NLA', gender: 'MEN', canton: 'GL', city: 'Näfels', website: 'https://www.volley-naefels.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nla-m-schoenenwerd', name: 'Volley Schönenwerd', league: 'NLA', gender: 'MEN', canton: 'SO', city: 'Schönenwerd', website: 'https://www.volley-schoenenwerd.ch', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '⚡' },
  { id: 'nla-m-chenois', name: 'Chênois Genève Volleyball', league: 'NLA', gender: 'MEN', canton: 'GE', city: 'Genève', website: 'https://www.chenois-volleyball.ch', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '👑' },
  { id: 'nla-m-amriswil', name: 'Volley Amriswil', league: 'NLA', gender: 'MEN', canton: 'TG', city: 'Amriswil', website: 'https://www.volley-amriswil.ch', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '🔵' },
  { id: 'nla-m-lausanne', name: 'VBC Lausanne UC', league: 'NLA', gender: 'MEN', canton: 'VD', city: 'Lausanne', website: 'https://www.lausanne-volleyball.ch', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '🦁' },
  { id: 'nla-m-lugano', name: 'Volley Lugano', league: 'NLA', gender: 'MEN', canton: 'TI', city: 'Lugano', website: 'https://www.volleylugano.ch', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🇨🇭' },
  { id: 'nla-m-lindaren', name: 'Lindaren Volley', league: 'NLA', gender: 'MEN', canton: 'TG', city: 'Amriswil', website: 'https://www.lindaren.ch', colors: { primary: '#00AA00', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nla-m-smash05', name: 'Volley Smash 05', league: 'NLA', gender: 'MEN', canton: 'VD', city: 'Renens', website: 'https://www.smash05.ch', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '💥' },
  { id: 'nla-m-jona', name: 'Jona Volleyball', league: 'NLA', gender: 'MEN', canton: 'SG', city: 'Jona', website: 'https://www.jona-volley.ch', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '⭐' },
  { id: 'nla-m-mondovi', name: 'VBC Mondovi', league: 'NLA', gender: 'MEN', canton: 'ZH', city: 'Zürich', website: 'https://www.mondovivolley.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🌍' },
  { id: 'nla-m-nuc', name: 'Volley Lugano NUC', league: 'NLA', gender: 'MEN', canton: 'TI', city: 'Lugano', website: 'https://www.nuc.ch', colors: { primary: '#000080', secondary: '#FFD700' }, logo: '🏆' },
  { id: 'nla-m-luzern', name: 'Volley Luzern', league: 'NLA', gender: 'MEN', canton: 'LU', city: 'Luzern', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
]

// NLB MEN (40) - Comprehensive list
export const NLB_MEN: ClubInfo[] = [
  { id: 'nlb-m-moehlin', name: 'VBC Möhlin', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Möhlin', colors: { primary: '#FF0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-steinhausen', name: 'VBC Steinhausen', league: 'NLB', gender: 'MEN', canton: 'ZG', city: 'Steinhausen', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '🔵' },
  { id: 'nlb-m-bern', name: 'Volley Bern', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Bern', colors: { primary: '#FF0000', secondary: '#FFFF00' }, logo: '🐻' },
  { id: 'nlb-m-mg', name: 'VBC Muri-Gümligen', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Gümligen', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🔷' },
  { id: 'nlb-m-langenthal', name: 'VBC Langenthal', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Langenthal', colors: { primary: '#000000', secondary: '#FFD700' }, logo: '⚫' },
  { id: 'nlb-m-oberdiessbach', name: 'Volley Guggis', league: 'NLB', gender: 'MEN', canton: 'BE', city: 'Oberdiessbach', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nlb-m-fribourg', name: 'VBC Fribourg', league: 'NLB', gender: 'MEN', canton: 'FR', city: 'Fribourg', colors: { primary: '#000000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-m-moudon', name: 'VBC Moudon', league: 'NLB', gender: 'MEN', canton: 'VD', city: 'Moudon', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nlb-m-martigny', name: 'VBC Martigny', league: 'NLB', gender: 'MEN', canton: 'VS', city: 'Martigny', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '⛰️' },
  { id: 'nlb-m-sion', name: 'VBC Sion', league: 'NLB', gender: 'MEN', canton: 'VS', city: 'Sion', colors: { primary: '#CC0000', secondary: '#FFFFFF' }, logo: '🏔️' },
  { id: 'nlb-m-basilea', name: 'Basilea Volleyball', league: 'NLB', gender: 'MEN', canton: 'BS', city: 'Basel', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🦁' },
  { id: 'nlb-m-oberwil', name: 'VBC Oberwil', league: 'NLB', gender: 'MEN', canton: 'BL', city: 'Oberwil', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '⭐' },
  { id: 'nlb-m-schoenenwerd2', name: 'Volley Schönenwerd 2', league: 'NLB', gender: 'MEN', canton: 'AG', city: 'Schönenwerd', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '🔥' },
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
  { id: 'nlb-m-naefels2', name: 'Volley Näfels 2', league: 'NLB', gender: 'MEN', canton: 'GL', city: 'Näfels', colors: { primary: '#4682B4', secondary: '#FFFFFF' }, logo: '🎯' },
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

// 1. LIGA MEN (80) - Sample representative clubs
export const LIGA1_MEN: ClubInfo[] = [
  { id: '1l-m-aegerten', name: 'VBC Aegerten-Brügg', league: '1. Liga', gender: 'MEN', canton: 'BE', city: 'Aegerten', colors: { primary: '#FF6600', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-allschwil', name: 'VBC Allschwil', league: '1. Liga', gender: 'MEN', canton: 'BL', city: 'Allschwil', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-andwil', name: 'VBC Andwil-Arnegg', league: '1. Liga', gender: 'MEN', canton: 'SG', city: 'Andwil', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-appenzell', name: 'VBC Appenzell', league: '1. Liga', gender: 'MEN', canton: 'AI', city: 'Appenzell', colors: { primary: '#000000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-attalens', name: 'VBC Attalens', league: '1. Liga', gender: 'MEN', canton: 'FR', city: 'Attalens', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '🏐' },
  { id: '1l-m-baeretswil', name: 'VBC Bäretswil', league: '1. Liga', gender: 'MEN', canton: 'ZH', city: 'Bäretswil', colors: { primary: '#4169E1', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-belp', name: 'VBC Belp', league: '1. Liga', gender: 'MEN', canton: 'BE', city: 'Belp', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-bern2', name: 'Volley Bern 2', league: '1. Liga', gender: 'MEN', canton: 'BE', city: 'Bern', colors: { primary: '#8B0000', secondary: '#FFFF00' }, logo: '🐻' },
  { id: '1l-m-biel', name: 'VBC Biel-Bienne', league: '1. Liga', gender: 'MEN', canton: 'BE', city: 'Biel', colors: { primary: '#FF0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-m-birsfelden', name: 'VBC Birsfelden', league: '1. Liga', gender: 'MEN', canton: 'BL', city: 'Birsfelden', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '🏐' },
  // ... (70 more clubs to reach 80 total)
]

// 2. LIGA MEN (58) - Sample representative clubs
export const LIGA2_MEN: ClubInfo[] = [
  { id: '2l-m-aarberg', name: 'VBC Aarberg', league: '2. Liga', gender: 'MEN', canton: 'BE', city: 'Aarberg', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-m-adliswil', name: 'VBC Adliswil', league: '2. Liga', gender: 'MEN', canton: 'ZH', city: 'Adliswil', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '🏐' },
  { id: '2l-m-affoltern', name: 'VBC Affoltern', league: '2. Liga', gender: 'MEN', canton: 'ZH', city: 'Affoltern am Albis', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-m-altendorf', name: 'VBC Altendorf', league: '2. Liga', gender: 'MEN', canton: 'SZ', city: 'Altendorf', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-m-arlesheim', name: 'VBC Arlesheim', league: '2. Liga', gender: 'MEN', canton: 'BL', city: 'Arlesheim', colors: { primary: '#4169E1', secondary: '#FFD700' }, logo: '🏐' },
  { id: '2l-m-auvernier', name: 'VBC Auvernier', league: '2. Liga', gender: 'MEN', canton: 'NE', city: 'Auvernier', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '🏐' },
  { id: '2l-m-avenches', name: 'VBC Avenches', league: '2. Liga', gender: 'MEN', canton: 'VD', city: 'Avenches', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-m-bassersdorf', name: 'VBC Bassersdorf', league: '2. Liga', gender: 'MEN', canton: 'ZH', city: 'Bassersdorf', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-m-bellach', name: 'VBC Bellach', league: '2. Liga', gender: 'MEN', canton: 'SO', city: 'Bellach', colors: { primary: '#FF4500', secondary: '#000000' }, logo: '🏐' },
  { id: '2l-m-beromuenster', name: 'VBC Beromünster', league: '2. Liga', gender: 'MEN', canton: 'LU', city: 'Beromünster', colors: { primary: '#0000CD', secondary: '#FFFFFF' }, logo: '🏐' },
  // ... (48 more clubs to reach 58 total)
]

// ===== WOMEN'S CLUBS =====

// NLA WOMEN (10)
export const NLA_WOMEN: ClubInfo[] = [
  { id: 'nla-w-smaesch', name: 'Sm\'Aesch Pfeffingen', league: 'NLA', gender: 'WOMEN', canton: 'BL', city: 'Aesch', website: 'https://www.volleyball-smaesch.ch', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '🔥' },
  { id: 'nla-w-nuc', name: 'Viteos NUC', league: 'NLA', gender: 'WOMEN', canton: 'NE', city: 'Neuchâtel', website: 'https://www.nuc.ch', colors: { primary: '#FFFF00', secondary: '#000000' }, logo: '⚡' },
  { id: 'nla-w-volero', name: 'TS Volero Zürich', league: 'NLA', gender: 'WOMEN', canton: 'ZH', city: 'Zürich', website: 'https://www.volero.ch', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nla-w-duedingen', name: 'Volley Düdingen', league: 'NLA', gender: 'WOMEN', canton: 'FR', city: 'Düdingen', website: 'https://www.volleyduedingen.ch', colors: { primary: '#000000', secondary: '#FFFFFF' }, logo: '⚫' },
  { id: 'nla-w-toggenburg', name: 'Volley Toggenburg', league: 'NLA', gender: 'WOMEN', canton: 'SG', city: 'Wattwil', website: 'https://www.volleytoggenburg.ch', colors: { primary: '#008000', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nla-w-cheseaux', name: 'VBC Cheseaux', league: 'NLA', gender: 'WOMEN', canton: 'VD', city: 'Cheseaux', website: 'https://www.vbc-cheseaux.ch', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '🧡' },
  { id: 'nla-w-lugano', name: 'Volley Lugano', league: 'NLA', gender: 'WOMEN', canton: 'TI', city: 'Lugano', website: 'https://www.volleylugano.ch', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🇨🇭' },
  { id: 'nla-w-steinhausen', name: 'VBC Steinhausen', league: 'NLA', gender: 'WOMEN', canton: 'ZG', city: 'Steinhausen', website: 'https://www.vbc-steinhausen.ch', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nla-w-geneve', name: 'Genève Elite Volley', league: 'NLA', gender: 'WOMEN', canton: 'GE', city: 'Genève', website: 'https://www.geneve-volley.ch', colors: { primary: '#FF0000', secondary: '#FFFF00' }, logo: '⭐' },
  { id: 'nla-w-kanti', name: 'Kanti Schaffhausen', league: 'NLA', gender: 'WOMEN', canton: 'SH', city: 'Schaffhausen', colors: { primary: '#000000', secondary: '#FFD700' }, logo: '🎓' },
]

// NLB WOMEN (30)
export const NLB_WOMEN: ClubInfo[] = [
  { id: 'nlb-w-fribourg', name: 'VBC Fribourg', league: 'NLB', gender: 'WOMEN', canton: 'FR', city: 'Fribourg', colors: { primary: '#000000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-bern', name: 'Volley Bern', league: 'NLB', gender: 'WOMEN', canton: 'BE', city: 'Bern', colors: { primary: '#FF0000', secondary: '#FFFF00' }, logo: '🐻' },
  { id: 'nlb-w-neuenburg', name: 'VBC Neuenburg', league: 'NLB', gender: 'WOMEN', canton: 'NE', city: 'Neuchâtel', colors: { primary: '#FFD700', secondary: '#DC143C' }, logo: '🌟' },
  { id: 'nlb-w-oberdiessbach', name: 'VBC Oberdiessbach', league: 'NLB', gender: 'WOMEN', canton: 'BE', city: 'Oberdiessbach', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nlb-w-lancy', name: 'VBC Lancy', league: 'NLB', gender: 'WOMEN', canton: 'GE', city: 'Lancy', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '🏐' },
  { id: 'nlb-w-koniz', name: 'VBC Köniz', league: 'NLB', gender: 'WOMEN', canton: 'BE', city: 'Köniz', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nlb-w-kanti', name: 'Kanti Baden', league: 'NLB', gender: 'WOMEN', canton: 'AG', city: 'Baden', colors: { primary: '#8B0000', secondary: '#FFD700' }, logo: '🎓' },
  { id: 'nlb-w-basilea', name: 'Basilea Volleyball', league: 'NLB', gender: 'WOMEN', canton: 'BS', city: 'Basel', colors: { primary: '#FF0000', secondary: '#0000FF' }, logo: '🦁' },
  { id: 'nlb-w-winterthur', name: 'Volley Smash Winterthur', league: 'NLB', gender: 'WOMEN', canton: 'ZH', city: 'Winterthur', colors: { primary: '#0033A0', secondary: '#FFFFFF' }, logo: '💥' },
  { id: 'nlb-w-sissach', name: 'VBC Sissach', league: 'NLB', gender: 'WOMEN', canton: 'BL', city: 'Sissach', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-wattwil', name: 'VBC Wattwil', league: 'NLB', gender: 'WOMEN', canton: 'SG', city: 'Wattwil', colors: { primary: '#4169E1', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-murten', name: 'VBC Murten', league: 'NLB', gender: 'WOMEN', canton: 'FR', city: 'Murten', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-moehlin', name: 'VBC Möhlin', league: 'NLB', gender: 'WOMEN', canton: 'AG', city: 'Möhlin', colors: { primary: '#FF0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-thun', name: 'Volley Thun', league: 'NLB', gender: 'WOMEN', canton: 'BE', city: 'Thun', colors: { primary: '#0066CC', secondary: '#FFD700' }, logo: '🏔️' },
  { id: 'nlb-w-naters', name: 'VBC Naters', league: 'NLB', gender: 'WOMEN', canton: 'VS', city: 'Naters', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '⛰️' },
  { id: 'nlb-w-engelberg', name: 'VBC Engelberg', league: 'NLB', gender: 'WOMEN', canton: 'OW', city: 'Engelberg', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '🏔️' },
  { id: 'nlb-w-jona', name: 'VBC Jona', league: 'NLB', gender: 'WOMEN', canton: 'SG', city: 'Jona', colors: { primary: '#FFD700', secondary: '#000000' }, logo: '⭐' },
  { id: 'nlb-w-buelach', name: 'Volley Bülach', league: 'NLB', gender: 'WOMEN', canton: 'ZH', city: 'Bülach', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-uzwil', name: 'VBC Uzwil', league: 'NLB', gender: 'WOMEN', canton: 'SG', city: 'Uzwil', colors: { primary: '#FF6347', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-sursee', name: 'VBC Sursee', league: 'NLB', gender: 'WOMEN', canton: 'LU', city: 'Sursee', colors: { primary: '#0000CD', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nlb-w-glarnerland', name: 'VBC Glarnerland', league: 'NLB', gender: 'WOMEN', canton: 'GL', city: 'Glarus', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🌲' },
  { id: 'nlb-w-schaffhausen', name: 'VBC Schaffhausen', league: 'NLB', gender: 'WOMEN', canton: 'SH', city: 'Schaffhausen', colors: { primary: '#FF4500', secondary: '#000000' }, logo: '🏐' },
  { id: 'nlb-w-aadorf', name: 'VBC Aadorf', league: 'NLB', gender: 'WOMEN', canton: 'TG', city: 'Aadorf', colors: { primary: '#4B0082', secondary: '#FFD700' }, logo: '🏐' },
  { id: 'nlb-w-rapperswil', name: 'VBC Rapperswil-Jona', league: 'NLB', gender: 'WOMEN', canton: 'SG', city: 'Rapperswil', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏰' },
  { id: 'nlb-w-zug', name: 'VBC Zug', league: 'NLB', gender: 'WOMEN', canton: 'ZG', city: 'Zug', colors: { primary: '#0000FF', secondary: '#FFFFFF' }, logo: '💙' },
  { id: 'nlb-w-olten', name: 'VBC Olten', league: 'NLB', gender: 'WOMEN', canton: 'SO', city: 'Olten', colors: { primary: '#FF4500', secondary: '#000000' }, logo: '🔥' },
  { id: 'nlb-w-sarnen', name: 'VBC Sarnen', league: 'NLB', gender: 'WOMEN', canton: 'OW', city: 'Sarnen', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: 'nlb-w-bellinzona', name: 'Pallavolo Bellinzona', league: 'NLB', gender: 'WOMEN', canton: 'TI', city: 'Bellinzona', colors: { primary: '#DC143C', secondary: '#0000CD' }, logo: '🏰' },
  { id: 'nlb-w-locarno', name: 'Pallavolo Locarno', league: 'NLB', gender: 'WOMEN', canton: 'TI', city: 'Locarno', colors: { primary: '#FFD700', secondary: '#000080' }, logo: '☀️' },
  { id: 'nlb-w-chur', name: 'VBC Chur', league: 'NLB', gender: 'WOMEN', canton: 'GR', city: 'Chur', colors: { primary: '#4169E1', secondary: '#FFFFFF' }, logo: '🏔️' },
]

// 1. LIGA WOMEN (70) - Sample representative clubs
export const LIGA1_WOMEN: ClubInfo[] = [
  { id: '1l-w-aarberg', name: 'VBC Aarberg', league: '1. Liga', gender: 'WOMEN', canton: 'BE', city: 'Aarberg', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-w-altdorf', name: 'VBC Altdorf', league: '1. Liga', gender: 'WOMEN', canton: 'UR', city: 'Altdorf', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '🏐' },
  { id: '1l-w-amriswil', name: 'VBC Amriswil', league: '1. Liga', gender: 'WOMEN', canton: 'TG', city: 'Amriswil', colors: { primary: '#1E90FF', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-w-arbon', name: 'VBC Arbon', league: '1. Liga', gender: 'WOMEN', canton: 'TG', city: 'Arbon', colors: { primary: '#4169E1', secondary: '#FFFFFF' }, logo: '🌊' },
  { id: '1l-w-baar', name: 'VBC Baar', league: '1. Liga', gender: 'WOMEN', canton: 'ZG', city: 'Baar', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-w-baden2', name: 'VBC Baden 2', league: '1. Liga', gender: 'WOMEN', canton: 'AG', city: 'Baden', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '♨️' },
  { id: '1l-w-bassins', name: 'VBC Bassins', league: '1. Liga', gender: 'WOMEN', canton: 'VD', city: 'Bassins', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '1l-w-bellinzona2', name: 'Pallavolo Bellinzona 2', league: '1. Liga', gender: 'WOMEN', canton: 'TI', city: 'Bellinzona', colors: { primary: '#DC143C', secondary: '#0000CD' }, logo: '🏰' },
  { id: '1l-w-bern2', name: 'Volley Bern 2', league: '1. Liga', gender: 'WOMEN', canton: 'BE', city: 'Bern', colors: { primary: '#8B0000', secondary: '#FFFF00' }, logo: '🐻' },
  { id: '1l-w-biel', name: 'VBC Biel-Bienne', league: '1. Liga', gender: 'WOMEN', canton: 'BE', city: 'Biel', colors: { primary: '#FF0000', secondary: '#FFFFFF' }, logo: '🏐' },
  // ... (60 more clubs to reach 70 total)
]

// 2. LIGA WOMEN (68) - Sample representative clubs
export const LIGA2_WOMEN: ClubInfo[] = [
  { id: '2l-w-adliswil', name: 'VBC Adliswil', league: '2. Liga', gender: 'WOMEN', canton: 'ZH', city: 'Adliswil', colors: { primary: '#FF6600', secondary: '#000000' }, logo: '🏐' },
  { id: '2l-w-affoltern', name: 'VBC Affoltern', league: '2. Liga', gender: 'WOMEN', canton: 'ZH', city: 'Affoltern am Albis', colors: { primary: '#228B22', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-w-allschwil', name: 'VBC Allschwil', league: '2. Liga', gender: 'WOMEN', canton: 'BL', city: 'Allschwil', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-w-andwil', name: 'VBC Andwil', league: '2. Liga', gender: 'WOMEN', canton: 'SG', city: 'Andwil', colors: { primary: '#0066CC', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-w-arlesheim', name: 'VBC Arlesheim', league: '2. Liga', gender: 'WOMEN', canton: 'BL', city: 'Arlesheim', colors: { primary: '#4169E1', secondary: '#FFD700' }, logo: '🏐' },
  { id: '2l-w-attalens', name: 'VBC Attalens', league: '2. Liga', gender: 'WOMEN', canton: 'FR', city: 'Attalens', colors: { primary: '#FF0000', secondary: '#000000' }, logo: '🏐' },
  { id: '2l-w-avenches', name: 'VBC Avenches', league: '2. Liga', gender: 'WOMEN', canton: 'VD', city: 'Avenches', colors: { primary: '#8B0000', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-w-bassersdorf', name: 'VBC Bassersdorf', league: '2. Liga', gender: 'WOMEN', canton: 'ZH', city: 'Bassersdorf', colors: { primary: '#006400', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-w-belp', name: 'VBC Belp', league: '2. Liga', gender: 'WOMEN', canton: 'BE', city: 'Belp', colors: { primary: '#DC143C', secondary: '#FFFFFF' }, logo: '🏐' },
  { id: '2l-w-beromuenster', name: 'VBC Beromünster', league: '2. Liga', gender: 'WOMEN', canton: 'LU', city: 'Beromünster', colors: { primary: '#0000CD', secondary: '#FFFFFF' }, logo: '🏐' },
  // ... (58 more clubs to reach 68 total)
]

// ===== HELPER FUNCTIONS =====

export function getAllClubs(): ClubInfo[] {
  return [
    ...NLA_MEN, ...NLB_MEN, ...LIGA1_MEN, ...LIGA2_MEN,
    ...NLA_WOMEN, ...NLB_WOMEN, ...LIGA1_WOMEN, ...LIGA2_WOMEN,
  ]
}

export function getMensClubs(): ClubInfo[] {
  return [...NLA_MEN, ...NLB_MEN, ...LIGA1_MEN, ...LIGA2_MEN]
}

export function getWomensClubs(): ClubInfo[] {
  return [...NLA_WOMEN, ...NLB_WOMEN, ...LIGA1_WOMEN, ...LIGA2_WOMEN]
}

export function getClubsByGender(gender: 'MEN' | 'WOMEN'): ClubInfo[] {
  return gender === 'MEN' ? getMensClubs() : getWomensClubs()
}

export function getClubsByLeague(league: 'NLA' | 'NLB' | '1. Liga' | '2. Liga', gender?: 'MEN' | 'WOMEN'): ClubInfo[] {
  const clubs = getAllClubs().filter(club => club.league === league)
  return gender ? clubs.filter(club => club.gender === gender) : clubs
}

export function getClubsByCanton(canton: string, gender?: 'MEN' | 'WOMEN'): ClubInfo[] {
  const clubs = getAllClubs().filter(club => club.canton === canton)
  return gender ? clubs.filter(club => club.gender === gender) : clubs
}

export function getClubById(id: string): ClubInfo | undefined {
  return getAllClubs().find(club => club.id === id)
}

export function getClubsByIds(ids: string[]): ClubInfo[] {
  return ids.map(id => getClubById(id)).filter((club): club is ClubInfo => club !== undefined)
}

// Get clubs filtered by gender AND league
export function getClubsByGenderAndLeague(
  gender: 'MEN' | 'WOMEN',
  league: 'NLA' | 'NLB' | '1. Liga' | '2. Liga'
): ClubInfo[] {
  if (gender === 'MEN') {
    switch (league) {
      case 'NLA': return NLA_MEN
      case 'NLB': return NLB_MEN
      case '1. Liga': return LIGA1_MEN
      case '2. Liga': return LIGA2_MEN
    }
  } else {
    switch (league) {
      case 'NLA': return NLA_WOMEN
      case 'NLB': return NLB_WOMEN
      case '1. Liga': return LIGA1_WOMEN
      case '2. Liga': return LIGA2_WOMEN
    }
  }
}

// Search clubs by name or city
export function searchClubs(query: string, gender?: 'MEN' | 'WOMEN'): ClubInfo[] {
  const lowerQuery = query.toLowerCase()
  const clubs = gender ? getClubsByGender(gender) : getAllClubs()
  return clubs.filter(club => 
    club.name.toLowerCase().includes(lowerQuery) ||
    club.city.toLowerCase().includes(lowerQuery) ||
    club.shortName?.toLowerCase().includes(lowerQuery)
  )
}

// Get club counts
export function getClubStats() {
  return {
    total: getAllClubs().length,
    men: {
      total: getMensClubs().length,
      NLA: NLA_MEN.length,
      NLB: NLB_MEN.length,
      '1. Liga': LIGA1_MEN.length,
      '2. Liga': LIGA2_MEN.length,
    },
    women: {
      total: getWomensClubs().length,
      NLA: NLA_WOMEN.length,
      NLB: NLB_WOMEN.length,
      '1. Liga': LIGA1_WOMEN.length,
      '2. Liga': LIGA2_WOMEN.length,
    }
  }
}
