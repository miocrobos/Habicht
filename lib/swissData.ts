// Swiss Canton Colors and Information
export const CANTON_INFO = {
  ZH: {
    name: 'Zürich',
    colors: { primary: '#0F05A0', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔵⚪',
  },
  BE: {
    name: 'Bern',
    colors: { primary: '#FF0000', secondary: '#FFD700' },
    flag: '🏴',
    flagEmoji: '🔴🟡',
  },
  LU: {
    name: 'Luzern',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔵⚪',
  },
  UR: {
    name: 'Uri',
    colors: { primary: '#FFD700', secondary: '#000000' },
    flag: '🏴',
    flagEmoji: '🟡⚫',
  },
  SZ: {
    name: 'Schwyz',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔴⚪',
  },
  OW: {
    name: 'Obwalden',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔴⚪',
  },
  NW: {
    name: 'Nidwalden',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔴⚪',
  },
  GL: {
    name: 'Glarus',
    colors: { primary: '#FF0000', secondary: '#000000' },
    flag: '🏴',
    flagEmoji: '🔴⚫',
  },
  ZG: {
    name: 'Zug',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔵⚪',
  },
  FR: {
    name: 'Fribourg',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '⚫⚪',
  },
  SO: {
    name: 'Solothurn',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔴⚪',
  },
  BS: {
    name: 'Basel-Stadt',
    colors: { primary: '#FFFFFF', secondary: '#000000' },
    flag: '🏴',
    flagEmoji: '⚪⚫',
  },
  BL: {
    name: 'Basel-Landschaft',
    colors: { primary: '#FFFFFF', secondary: '#FF0000' },
    flag: '🏴',
    flagEmoji: '⚪🔴',
  },
  SH: {
    name: 'Schaffhausen',
    colors: { primary: '#000000', secondary: '#FFD700' },
    flag: '🏴',
    flagEmoji: '⚫🟡',
  },
  AR: {
    name: 'Appenzell Ausserrhoden',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '⚫⚪',
  },
  AI: {
    name: 'Appenzell Innerrhoden',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '⚫⚪',
  },
  SG: {
    name: 'St. Gallen',
    colors: { primary: '#009B77', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🟢⚪',
  },
  GR: {
    name: 'Graubünden',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '⚫⚪',
  },
  AG: {
    name: 'Aargau',
    colors: { primary: '#000000', secondary: '#0066CC' },
    flag: '🏴',
    flagEmoji: '⚫🔵',
  },
  TG: {
    name: 'Thurgau',
    colors: { primary: '#009B77', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🟢⚪',
  },
  TI: {
    name: 'Ticino',
    colors: { primary: '#FF0000', secondary: '#0066CC' },
    flag: '🏴',
    flagEmoji: '🔴🔵',
  },
  VD: {
    name: 'Vaud',
    colors: { primary: '#009B77', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🟢⚪',
  },
  VS: {
    name: 'Valais',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔴⚪',
  },
  NE: {
    name: 'Neuchâtel',
    colors: { primary: '#009B77', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🟢⚪',
  },
  GE: {
    name: 'Genève',
    colors: { primary: '#FFD700', secondary: '#FF0000' },
    flag: '🏴',
    flagEmoji: '🟡🔴',
  },
  JU: {
    name: 'Jura',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    flag: '🏴',
    flagEmoji: '🔴⚪',
  },
}

// Club Colors and Logos
export const CLUB_INFO = {
  'Volley Amriswil': {
    colors: { primary: '#FF0000', secondary: '#000000' },
    logo: '🦅',
    symbol: 'VA',
  },
  'Volley Schönenwerd': {
    colors: { primary: '#0066CC', secondary: '#FFD700' },
    logo: '⚡',
    symbol: 'VS',
  },
  'VC Kanti Schaffhausen': {
    colors: { primary: '#000000', secondary: '#FFD700' },
    logo: '🎓',
    symbol: 'KS',
  },
  'Volley Toggenburg': {
    colors: { primary: '#009B77', secondary: '#FFFFFF' },
    logo: '🏔️',
    symbol: 'VT',
  },
  "SM'Aesch Pfeffingen": {
    colors: { primary: '#FF6600', secondary: '#000000' },
    logo: '🔥',
    symbol: 'SM',
  },
  'VBC Cheseaux': {
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '⭐',
    symbol: 'CH',
  },
  'Volley Alpnach': {
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '⛰️',
    symbol: 'AL',
  },
}

export const getCantonInfo = (canton: string) => {
  return CANTON_INFO[canton as keyof typeof CANTON_INFO] || CANTON_INFO.ZH
}

export const getClubInfo = (clubName: string) => {
  return CLUB_INFO[clubName as keyof typeof CLUB_INFO] || {
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '🏐',
    symbol: clubName.substring(0, 2).toUpperCase(),
  }
}
