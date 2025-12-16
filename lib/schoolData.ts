// Swiss Schools and Universities Data with Logos

export interface SchoolInfo {
  name: string
  type: 'GYMNASIUM' | 'BERUFSSCHULE' | 'FH' | 'UNIVERSITY' | 'OTHER'
  canton: string
  logo: string
  website?: string
}

// Major Swiss Universities and Schools
export const SWISS_SCHOOLS: Record<string, SchoolInfo> = {
  // Universities
  'ETH Zürich': {
    name: 'ETH Zürich',
    type: 'UNIVERSITY',
    canton: 'ZH',
    logo: '🎓',
    website: 'https://ethz.ch'
  },
  'Universität Zürich': {
    name: 'Universität Zürich',
    type: 'UNIVERSITY',
    canton: 'ZH',
    logo: '🏛️',
    website: 'https://uzh.ch'
  },
  'Universität Bern': {
    name: 'Universität Bern',
    type: 'UNIVERSITY',
    canton: 'BE',
    logo: '🏛️',
    website: 'https://unibe.ch'
  },
  'Universität Basel': {
    name: 'Universität Basel',
    type: 'UNIVERSITY',
    canton: 'BS',
    logo: '🏛️',
    website: 'https://unibas.ch'
  },
  'Universität St. Gallen': {
    name: 'Universität St. Gallen (HSG)',
    type: 'UNIVERSITY',
    canton: 'SG',
    logo: '🎯',
    website: 'https://unisg.ch'
  },
  'Universität Lausanne': {
    name: 'Université de Lausanne',
    type: 'UNIVERSITY',
    canton: 'VD',
    logo: '🏛️',
    website: 'https://unil.ch'
  },
  'Universität Genf': {
    name: 'Université de Genève',
    type: 'UNIVERSITY',
    canton: 'GE',
    logo: '🏛️',
    website: 'https://unige.ch'
  },
  'EPFL': {
    name: 'EPFL Lausanne',
    type: 'UNIVERSITY',
    canton: 'VD',
    logo: '⚡',
    website: 'https://epfl.ch'
  },
  'Universität Luzern': {
    name: 'Universität Luzern',
    type: 'UNIVERSITY',
    canton: 'LU',
    logo: '🏛️',
    website: 'https://unilu.ch'
  },
  'Universität Fribourg': {
    name: 'Université de Fribourg',
    type: 'UNIVERSITY',
    canton: 'FR',
    logo: '🏛️',
    website: 'https://unifr.ch'
  },

  // Fachhochschulen (Universities of Applied Sciences)
  'ZHAW': {
    name: 'ZHAW Zürich',
    type: 'FH',
    canton: 'ZH',
    logo: '📘',
    website: 'https://zhaw.ch'
  },
  'FHNW': {
    name: 'FHNW',
    type: 'FH',
    canton: 'AG',
    logo: '📘',
    website: 'https://fhnw.ch'
  },
  'BFH': {
    name: 'BFH Bern',
    type: 'FH',
    canton: 'BE',
    logo: '📘',
    website: 'https://bfh.ch'
  },
  'HSLU': {
    name: 'HSLU Luzern',
    type: 'FH',
    canton: 'LU',
    logo: '📘',
    website: 'https://hslu.ch'
  },
  'OST': {
    name: 'OST - Ostschweizer Fachhochschule',
    type: 'FH',
    canton: 'SG',
    logo: '📘',
    website: 'https://ost.ch'
  },
  'SUPSI': {
    name: 'SUPSI',
    type: 'FH',
    canton: 'TI',
    logo: '📘',
    website: 'https://supsi.ch'
  },
  'HES-SO': {
    name: 'HES-SO',
    type: 'FH',
    canton: 'VD',
    logo: '📘',
    website: 'https://hes-so.ch'
  },
  'ZHDK': {
    name: 'ZHdK - Zürcher Hochschule der Künste',
    type: 'FH',
    canton: 'ZH',
    logo: '🎨',
    website: 'https://zhdk.ch'
  },
  'FHO': {
    name: 'FHO Fachhochschule Ostschweiz',
    type: 'FH',
    canton: 'SG',
    logo: '📘',
    website: 'https://fho.ch'
  },
  'FHGR': {
    name: 'FH Graubünden',
    type: 'FH',
    canton: 'GR',
    logo: '📘',
    website: 'https://fhgr.ch'
  },

  // Kantonsschulen (Gymnasiums) - Expanded
  'Kantonsschule Zürich Nord': {
    name: 'Kantonsschule Zürich Nord',
    type: 'GYMNASIUM',
    canton: 'ZH',
    logo: '🏫',
  },
  'Kantonsschule Enge': {
    name: 'Kantonsschule Enge Zürich',
    type: 'GYMNASIUM',
    canton: 'ZH',
    logo: '🏫',
  },
  'Kantonsschule Rämibühl': {
    name: 'Kantonsschule Rämibühl Zürich',
    type: 'GYMNASIUM',
    canton: 'ZH',
    logo: '🏫',
  },
  'Gymnasium Kirchenfeld': {
    name: 'Gymnasium Kirchenfeld Bern',
    type: 'GYMNASIUM',
    canton: 'BE',
    logo: '🏫',
  },
  'Gymnasium Bern Neufeld': {
    name: 'Gymnasium Neufeld Bern',
    type: 'GYMNASIUM',
    canton: 'BE',
    logo: '🏫',
  },
  'Kantonsschule Olten': {
    name: 'Kantonsschule Olten',
    type: 'GYMNASIUM',
    canton: 'SO',
    logo: '🏫',
  },
  'Kantonsschule Solothurn': {
    name: 'Kantonsschule Solothurn',
    type: 'GYMNASIUM',
    canton: 'SO',
    logo: '🏫',
  },
  'Gymnasium Basel': {
    name: 'Gymnasium am Münsterplatz Basel',
    type: 'GYMNASIUM',
    canton: 'BS',
    logo: '🏫',
  },
  'Kantonsschule Schaffhausen': {
    name: 'Kantonsschule Schaffhausen',
    type: 'GYMNASIUM',
    canton: 'SH',
    logo: '🏫',
  },
  'Kantonsschule St. Gallen': {
    name: 'Kantonsschule am Burggraben St. Gallen',
    type: 'GYMNASIUM',
    canton: 'SG',
    logo: '🏫',
  },
  'Kantonsschule Wattwil': {
    name: 'Kantonsschule Wattwil',
    type: 'GYMNASIUM',
    canton: 'SG',
    logo: '🏫',
  },
  'Gymnase de Lausanne': {
    name: 'Gymnase de la Cité Lausanne',
    type: 'GYMNASIUM',
    canton: 'VD',
    logo: '🏫',
  },
  'Collège Calvin': {
    name: 'Collège Calvin Genève',
    type: 'GYMNASIUM',
    canton: 'GE',
    logo: '🏫',
  },
  'Collège de Genève': {
    name: 'Collège de Genève',
    type: 'GYMNASIUM',
    canton: 'GE',
    logo: '🏫',
  },
  'Kollegium St. Fiden': {
    name: 'Kollegium St. Fiden',
    type: 'GYMNASIUM',
    canton: 'SG',
    logo: '🏫',
  },
  'Kantonsschule Wettingen': {
    name: 'Kantonsschule Wettingen',
    type: 'GYMNASIUM',
    canton: 'AG',
    logo: '🏫',
  },
  'Kantonsschule Aarau': {
    name: 'Kantonsschule Aarau',
    type: 'GYMNASIUM',
    canton: 'AG',
    logo: '🏫',
  },
  'Kantonsschule Baden': {
    name: 'Kantonsschule Baden',
    type: 'GYMNASIUM',
    canton: 'AG',
    logo: '🏫',
  },
  'Kantonsschule Wohlen': {
    name: 'Kantonsschule Wohlen',
    type: 'GYMNASIUM',
    canton: 'AG',
    logo: '🏫',
  },
  'Kantonsschule Zug': {
    name: 'Kantonsschule Zug',
    type: 'GYMNASIUM',
    canton: 'ZG',
    logo: '🏫',
  },
  'Kantonsschule Menzingen': {
    name: 'Kantonsschule Menzingen',
    type: 'GYMNASIUM',
    canton: 'ZG',
    logo: '🏫',
  },
  'Kantonsschule Luzern': {
    name: 'Kantonsschule Alpenquai Luzern',
    type: 'GYMNASIUM',
    canton: 'LU',
    logo: '🏫',
  },
  'Kantonsschule Reussbühl': {
    name: 'Kantonsschule Reussbühl Luzern',
    type: 'GYMNASIUM',
    canton: 'LU',
    logo: '🏫',
  },
  'Kantonsschule Willisau': {
    name: 'Kantonsschule Willisau',
    type: 'GYMNASIUM',
    canton: 'LU',
    logo: '🏫',
  },
  'Kantonsschule Sursee': {
    name: 'Kantonsschule Sursee',
    type: 'GYMNASIUM',
    canton: 'LU',
    logo: '🏫',
  },
  'Stiftsschule Einsiedeln': {
    name: 'Stiftsschule Einsiedeln',
    type: 'GYMNASIUM',
    canton: 'SZ',
    logo: '🏫',
  },
  'Kollegium Schwyz': {
    name: 'Kollegium Schwyz',
    type: 'GYMNASIUM',
    canton: 'SZ',
    logo: '🏫',
  },
  'Kantonsschule Uri': {
    name: 'Kantonsschule Uri Altdorf',
    type: 'GYMNASIUM',
    canton: 'UR',
    logo: '🏫',
  },
  'Kollegi Uri': {
    name: 'Kollegium Karl Borromäus Altdorf',
    type: 'GYMNASIUM',
    canton: 'UR',
    logo: '🏫',
  },
  'Gymnasium Oberwil': {
    name: 'Gymnasium Oberwil',
    type: 'GYMNASIUM',
    canton: 'BL',
    logo: '🏫',
  },
  'Gymnasium Liestal': {
    name: 'Gymnasium Liestal',
    type: 'GYMNASIUM',
    canton: 'BL',
    logo: '🏫',
  },
  'Gymnasium Muttenz': {
    name: 'Gymnasium Muttenz',
    type: 'GYMNASIUM',
    canton: 'BL',
    logo: '🏫',
  },
  'Kantonsschule Frauenfeld': {
    name: 'Kantonsschule Frauenfeld',
    type: 'GYMNASIUM',
    canton: 'TG',
    logo: '🏫',
  },
  'Kantonsschule Kreuzlingen': {
    name: 'Kantonsschule Kreuzlingen',
    type: 'GYMNASIUM',
    canton: 'TG',
    logo: '🏫',
  },
  'Kantonsschule Romanshorn': {
    name: 'Kantonsschule Romanshorn',
    type: 'GYMNASIUM',
    canton: 'TG',
    logo: '🏫',
  },
  'Kantonsschule Chur': {
    name: 'Bündner Kantonsschule Chur',
    type: 'GYMNASIUM',
    canton: 'GR',
    logo: '🏫',
  },
  'Evangelische Mittelschule Schiers': {
    name: 'Evangelische Mittelschule Schiers',
    type: 'GYMNASIUM',
    canton: 'GR',
    logo: '🏫',
  },
  'Lyceum Alpinum Zuoz': {
    name: 'Lyceum Alpinum Zuoz',
    type: 'GYMNASIUM',
    canton: 'GR',
    logo: '🏫',
  },
  'Collège St-Michel Fribourg': {
    name: 'Collège St-Michel Fribourg',
    type: 'GYMNASIUM',
    canton: 'FR',
    logo: '🏫',
  },
  'Collège du Sud Bulle': {
    name: 'Collège du Sud Bulle',
    type: 'GYMNASIUM',
    canton: 'FR',
    logo: '🏫',
  },
  'Gymnase de Bulle': {
    name: 'Gymnase de Bulle',
    type: 'GYMNASIUM',
    canton: 'FR',
    logo: '🏫',
  },
  'Lycée Cantonal Porrentruy': {
    name: 'Lycée Cantonal Porrentruy',
    type: 'GYMNASIUM',
    canton: 'JU',
    logo: '🏫',
  },
  'Lycée Denis-de-Rougemont Neuchâtel': {
    name: 'Lycée Denis-de-Rougemont Neuchâtel',
    type: 'GYMNASIUM',
    canton: 'NE',
    logo: '🏫',
  },
  'Gymnase français de Bienne': {
    name: 'Gymnase français de Bienne',
    type: 'GYMNASIUM',
    canton: 'BE',
    logo: '🏫',
  },
  'Gymnase de Beaulieu Lausanne': {
    name: 'Gymnase de Beaulieu Lausanne',
    type: 'GYMNASIUM',
    canton: 'VD',
    logo: '🏫',
  },
  'Gymnase de Renens': {
    name: 'Gymnase de Renens',
    type: 'GYMNASIUM',
    canton: 'VD',
    logo: '🏫',
  },
  'Gymnase de Morges': {
    name: 'Gymnase de Morges',
    type: 'GYMNASIUM',
    canton: 'VD',
    logo: '🏫',
  },
  'Gymnase de Nyon': {
    name: 'Gymnase de Nyon',
    type: 'GYMNASIUM',
    canton: 'VD',
    logo: '🏫',
  },
  'Collège Voltaire Genève': {
    name: 'Collège Voltaire Genève',
    type: 'GYMNASIUM',
    canton: 'GE',
    logo: '🏫',
  },
  'Collège Rousseau Genève': {
    name: 'Collège Rousseau Genève',
    type: 'GYMNASIUM',
    canton: 'GE',
    logo: '🏫',
  },
  'Collège Sismondi Genève': {
    name: 'Collège Sismondi Genève',
    type: 'GYMNASIUM',
    canton: 'GE',
    logo: '🏫',
  },
  'Lycée Collège de la Planta Sion': {
    name: 'Lycée Collège de la Planta Sion',
    type: 'GYMNASIUM',
    canton: 'VS',
    logo: '🏫',
  },
  'Liceo Cantonale Lugano': {
    name: 'Liceo Cantonale Lugano',
    type: 'GYMNASIUM',
    canton: 'TI',
    logo: '🏫',
  },
  'Liceo Cantonale Bellinzona': {
    name: 'Liceo Cantonale Bellinzona',
    type: 'GYMNASIUM',
    canton: 'TI',
    logo: '🏫',
  },
  'Liceo Cantonale Locarno': {
    name: 'Liceo Cantonale Locarno',
    type: 'GYMNASIUM',
    canton: 'TI',
    logo: '🏫',
  },
  'Liceo Cantonale Mendrisio': {
    name: 'Liceo Cantonale Mendrisio',
    type: 'GYMNASIUM',
    canton: 'TI',
    logo: '🏫',
  },
}

// Helper function to get all schools as an array for dropdowns
export function getAllSchools(): { value: string; label: string; type: string; canton: string }[] {
  return Object.entries(SWISS_SCHOOLS).map(([key, school]) => ({
    value: school.name,
    label: school.name,
    type: school.type,
    canton: school.canton,
  })).sort((a, b) => a.label.localeCompare(b.label));
}

export function getSchoolInfo(schoolName: string): SchoolInfo | null {
  // Try exact match first
  if (SWISS_SCHOOLS[schoolName]) {
    return SWISS_SCHOOLS[schoolName]
  }

  // Try partial match (case insensitive)
  const lowerSearchName = schoolName.toLowerCase()
  for (const [key, school] of Object.entries(SWISS_SCHOOLS)) {
    if (key.toLowerCase().includes(lowerSearchName) || 
        lowerSearchName.includes(key.toLowerCase())) {
      return school
    }
  }

  // Return generic school info based on keywords
  if (schoolName.toLowerCase().includes('eth')) {
    return { name: schoolName, type: 'UNIVERSITY', canton: 'ZH', logo: '🎓' }
  }
  if (schoolName.toLowerCase().includes('universität') || 
      schoolName.toLowerCase().includes('université') || 
      schoolName.toLowerCase().includes('università')) {
    return { name: schoolName, type: 'UNIVERSITY', canton: 'ZH', logo: '🏛️' }
  }
  if (schoolName.toLowerCase().includes('fachhochschule') || 
      schoolName.toLowerCase().includes('fh') ||
      schoolName.toLowerCase().includes('hes')) {
    return { name: schoolName, type: 'FH', canton: 'ZH', logo: '📘' }
  }
  if (schoolName.toLowerCase().includes('kantonsschule') || 
      schoolName.toLowerCase().includes('gymnasium') ||
      schoolName.toLowerCase().includes('gymnase') ||
      schoolName.toLowerCase().includes('collège')) {
    return { name: schoolName, type: 'GYMNASIUM', canton: 'ZH', logo: '🏫' }
  }

  // Default fallback
  return { name: schoolName, type: 'OTHER', canton: 'ZH', logo: '📚' }
}

export function getSchoolLogo(schoolName: string, schoolType?: string): string {
  const schoolInfo = getSchoolInfo(schoolName)
  if (schoolInfo) {
    return schoolInfo.logo
  }

  // Fallback based on type
  switch (schoolType) {
    case 'UNIVERSITY':
      return '🏛️'
    case 'FH':
      return '📘'
    case 'GYMNASIUM':
      return '🏫'
    case 'BERUFSSCHULE':
      return '📚'
    default:
      return '🎓'
  }
}
