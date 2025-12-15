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

  // Kantonsschulen (Gymnasiums)
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
