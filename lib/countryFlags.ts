// Country code mapping for club flags
// Uses hampusborgos/country-flags repository
// Supports all 249 countries and territories with ISO 3166-1 codes

export interface CountryInfo {
  code: string
  name: string
  flagUrl: string
}

// Complete ISO 3166-1 alpha-2 country codes mapping
// Includes English and German names for all countries
const COUNTRY_CODES: Record<string, string> = {
  // A
  'Afghanistan': 'AF',
  'Åland Islands': 'AX',
  'Albania': 'AL',
  'Albanien': 'AL',
  'Algeria': 'DZ',
  'Algerien': 'DZ',
  'American Samoa': 'AS',
  'Andorra': 'AD',
  'Angola': 'AO',
  'Anguilla': 'AI',
  'Antarctica': 'AQ',
  'Antarktis': 'AQ',
  'Antigua and Barbuda': 'AG',
  'Argentina': 'AR',
  'Argentinien': 'AR',
  'Armenia': 'AM',
  'Armenien': 'AM',
  'Aruba': 'AW',
  'Australia': 'AU',
  'Australien': 'AU',
  'Austria': 'AT',
  'Österreich': 'AT',
  'Azerbaijan': 'AZ',
  'Aserbaidschan': 'AZ',
  
  // B
  'Bahamas': 'BS',
  'Bahrain': 'BH',
  'Bangladesh': 'BD',
  'Barbados': 'BB',
  'Belarus': 'BY',
  'Weissrussland': 'BY',
  'Belgium': 'BE',
  'Belgien': 'BE',
  'Belize': 'BZ',
  'Benin': 'BJ',
  'Bermuda': 'BM',
  'Bhutan': 'BT',
  'Bolivia': 'BO',
  'Bolivien': 'BO',
  'Bolivia, Plurinational State of': 'BO',
  'Bosnia and Herzegovina': 'BA',
  'Bosnien und Herzegowina': 'BA',
  'Botswana': 'BW',
  'Bouvet Island': 'BV',
  'Brazil': 'BR',
  'Brasilien': 'BR',
  'British Indian Ocean Territory': 'IO',
  'Brunei': 'BN',
  'Brunei Darussalam': 'BN',
  'Bulgaria': 'BG',
  'Bulgarien': 'BG',
  'Burkina Faso': 'BF',
  'Burundi': 'BI',
  
  // C
  'Cambodia': 'KH',
  'Kambodscha': 'KH',
  'Cameroon': 'CM',
  'Kamerun': 'CM',
  'Canada': 'CA',
  'Kanada': 'CA',
  'Cape Verde': 'CV',
  'Kap Verde': 'CV',
  'Caribbean Netherlands': 'BQ',
  'Cayman Islands': 'KY',
  'Kaimaninseln': 'KY',
  'Central African Republic': 'CF',
  'Zentralafrikanische Republik': 'CF',
  'Chad': 'TD',
  'Tschad': 'TD',
  'Chile': 'CL',
  'China': 'CN',
  "China (People's Republic of China)": 'CN',
  'Christmas Island': 'CX',
  'Weihnachtsinsel': 'CX',
  'Cocos (Keeling) Islands': 'CC',
  'Colombia': 'CO',
  'Kolumbien': 'CO',
  'Comoros': 'KM',
  'Komoren': 'KM',
  'Congo': 'CG',
  'Kongo': 'CG',
  'Republic of the Congo': 'CG',
  'Congo, the Democratic Republic of the': 'CD',
  'Cook Islands': 'CK',
  'Cookinseln': 'CK',
  'Costa Rica': 'CR',
  "Côte d'Ivoire": 'CI',
  'Ivory Coast': 'CI',
  'Elfenbeinküste': 'CI',
  'Croatia': 'HR',
  'Kroatien': 'HR',
  'Cuba': 'CU',
  'Kuba': 'CU',
  'Curaçao': 'CW',
  'Cyprus': 'CY',
  'Zypern': 'CY',
  'Czech Republic': 'CZ',
  'Tschechien': 'CZ',
  'Czechia': 'CZ',
  
  // D
  'Denmark': 'DK',
  'Dänemark': 'DK',
  'Djibouti': 'DJ',
  'Dschibuti': 'DJ',
  'Dominica': 'DM',
  'Dominican Republic': 'DO',
  'Dominikanische Republik': 'DO',
  
  // E
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'Ägypten': 'EG',
  'El Salvador': 'SV',
  'England': 'GB-ENG',
  'Equatorial Guinea': 'GQ',
  'Äquatorialguinea': 'GQ',
  'Eritrea': 'ER',
  'Estonia': 'EE',
  'Estland': 'EE',
  'Ethiopia': 'ET',
  'Äthiopien': 'ET',
  'Europe': 'EU',
  'Europa': 'EU',
  
  // F
  'Falkland Islands': 'FK',
  'Falkland Islands (Malvinas)': 'FK',
  'Falklandinseln': 'FK',
  'Faroe Islands': 'FO',
  'Färöer': 'FO',
  'Fiji': 'FJ',
  'Fidschi': 'FJ',
  'Finland': 'FI',
  'Finnland': 'FI',
  'France': 'FR',
  'Frankreich': 'FR',
  'French Guiana': 'GF',
  'Französisch-Guayana': 'GF',
  'French Polynesia': 'PF',
  'Französisch-Polynesien': 'PF',
  'French Southern Territories': 'TF',
  
  // G
  'Gabon': 'GA',
  'Gabun': 'GA',
  'Gambia': 'GM',
  'Georgia': 'GE',
  'Georgien': 'GE',
  'Germany': 'DE',
  'Deutschland': 'DE',
  'Ghana': 'GH',
  'Gibraltar': 'GI',
  'Greece': 'GR',
  'Griechenland': 'GR',
  'Greenland': 'GL',
  'Grönland': 'GL',
  'Grenada': 'GD',
  'Guadeloupe': 'GP',
  'Guam': 'GU',
  'Guatemala': 'GT',
  'Guernsey': 'GG',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Guyana': 'GY',
  
  // H
  'Haiti': 'HT',
  'Heard Island and McDonald Islands': 'HM',
  'Honduras': 'HN',
  'Hong Kong': 'HK',
  'Hongkong': 'HK',
  'Hungary': 'HU',
  'Ungarn': 'HU',
  
  // I
  'Iceland': 'IS',
  'Island': 'IS',
  'India': 'IN',
  'Indien': 'IN',
  'Indonesia': 'ID',
  'Indonesien': 'ID',
  'Iran': 'IR',
  'Iran, Islamic Republic of': 'IR',
  'Iraq': 'IQ',
  'Irak': 'IQ',
  'Ireland': 'IE',
  'Irland': 'IE',
  'Isle of Man': 'IM',
  'Israel': 'IL',
  'Italy': 'IT',
  'Italien': 'IT',
  
  // J
  'Jamaica': 'JM',
  'Jamaika': 'JM',
  'Japan': 'JP',
  'Jersey': 'JE',
  'Jordan': 'JO',
  'Jordanien': 'JO',
  
  // K
  'Kazakhstan': 'KZ',
  'Kasachstan': 'KZ',
  'Kenya': 'KE',
  'Kenia': 'KE',
  'Kiribati': 'KI',
  'Korea, Democratic People\'s Republic of': 'KP',
  'North Korea': 'KP',
  'Nordkorea': 'KP',
  'Korea, Republic of': 'KR',
  'South Korea': 'KR',
  'Südkorea': 'KR',
  'Kosovo': 'XK',
  'Kuwait': 'KW',
  'Kyrgyzstan': 'KG',
  'Kirgisistan': 'KG',
  
  // L
  'Laos': 'LA',
  'Laos (Lao People\'s Democratic Republic)': 'LA',
  'Latvia': 'LV',
  'Lettland': 'LV',
  'Lebanon': 'LB',
  'Libanon': 'LB',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libya': 'LY',
  'Libyen': 'LY',
  'Liechtenstein': 'LI',
  'Lithuania': 'LT',
  'Litauen': 'LT',
  'Luxembourg': 'LU',
  'Luxemburg': 'LU',
  
  // M
  'Macao': 'MO',
  'Macau': 'MO',
  'North Macedonia': 'MK',
  'Macedonia': 'MK',
  'Mazedonien': 'MK',
  'Madagascar': 'MG',
  'Madagaskar': 'MG',
  'Malawi': 'MW',
  'Malaysia': 'MY',
  'Maldives': 'MV',
  'Malediven': 'MV',
  'Mali': 'ML',
  'Malta': 'MT',
  'Marshall Islands': 'MH',
  'Marshallinseln': 'MH',
  'Martinique': 'MQ',
  'Mauritania': 'MR',
  'Mauretanien': 'MR',
  'Mauritius': 'MU',
  'Mayotte': 'YT',
  'Mexico': 'MX',
  'Mexiko': 'MX',
  'Micronesia': 'FM',
  'Micronesia, Federated States of': 'FM',
  'Mikronesien': 'FM',
  'Moldova': 'MD',
  'Moldova, Republic of': 'MD',
  'Moldawien': 'MD',
  'Monaco': 'MC',
  'Mongolia': 'MN',
  'Mongolei': 'MN',
  'Montenegro': 'ME',
  'Montserrat': 'MS',
  'Morocco': 'MA',
  'Marokko': 'MA',
  'Mozambique': 'MZ',
  'Mosambik': 'MZ',
  'Myanmar': 'MM',
  
  // N
  'Namibia': 'NA',
  'Namibien': 'NA',
  'Nauru': 'NR',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'Niederlande': 'NL',
  'New Caledonia': 'NC',
  'Neukaledonien': 'NC',
  'New Zealand': 'NZ',
  'Neuseeland': 'NZ',
  'Nicaragua': 'NI',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'Niue': 'NU',
  'Norfolk Island': 'NF',
  'Northern Ireland': 'GB-NIR',
  'Nordirland': 'GB-NIR',
  'Northern Mariana Islands': 'MP',
  'Nördliche Marianen': 'MP',
  'Norway': 'NO',
  'Norwegen': 'NO',
  
  // O
  'Oman': 'OM',
  
  // P
  'Pakistan': 'PK',
  'Palau': 'PW',
  'Palestine': 'PS',
  'Palästina': 'PS',
  'Panama': 'PA',
  'Papua New Guinea': 'PG',
  'Papua-Neuguinea': 'PG',
  'Paraguay': 'PY',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Philippinen': 'PH',
  'Pitcairn': 'PN',
  'Poland': 'PL',
  'Polen': 'PL',
  'Portugal': 'PT',
  'Puerto Rico': 'PR',
  
  // Q
  'Qatar': 'QA',
  'Katar': 'QA',
  
  // R
  'Réunion': 'RE',
  'Romania': 'RO',
  'Rumänien': 'RO',
  'Russia': 'RU',
  'Russian Federation': 'RU',
  'Russland': 'RU',
  'Rwanda': 'RW',
  'Ruanda': 'RW',
  
  // S
  'Saint Barthélemy': 'BL',
  'Saint Helena': 'SH',
  'Saint Helena, Ascension and Tristan da Cunha': 'SH',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Martin': 'MF',
  'Saint Pierre and Miquelon': 'PM',
  'Saint Vincent and the Grenadines': 'VC',
  'Samoa': 'WS',
  'San Marino': 'SM',
  'Sao Tome and Principe': 'ST',
  'Saudi Arabia': 'SA',
  'Saudi-Arabien': 'SA',
  'Scotland': 'GB-SCT',
  'Schottland': 'GB-SCT',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Serbien': 'RS',
  'Seychelles': 'SC',
  'Seychellen': 'SC',
  'Sierra Leone': 'SL',
  'Singapore': 'SG',
  'Singapur': 'SG',
  'Sint Maarten': 'SX',
  'Sint Maarten (Dutch part)': 'SX',
  'Slovakia': 'SK',
  'Slowakei': 'SK',
  'Slovenia': 'SI',
  'Slowenien': 'SI',
  'Solomon Islands': 'SB',
  'Salomonen': 'SB',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'Südafrika': 'ZA',
  'South Georgia and the South Sandwich Islands': 'GS',
  'South Sudan': 'SS',
  'Südsudan': 'SS',
  'Spain': 'ES',
  'Spanien': 'ES',
  'Sri Lanka': 'LK',
  'Sudan': 'SD',
  'Suriname': 'SR',
  'Svalbard and Jan Mayen Islands': 'SJ',
  'Sweden': 'SE',
  'Schweden': 'SE',
  'Switzerland': 'CH',
  'Schweiz': 'CH',
  'Syria': 'SY',
  'Syrian Arab Republic': 'SY',
  'Syrien': 'SY',
  
  // T
  'Taiwan': 'TW',
  'Taiwan (Republic of China)': 'TW',
  'Tajikistan': 'TJ',
  'Tadschikistan': 'TJ',
  'Tanzania': 'TZ',
  'Tanzania, United Republic of': 'TZ',
  'Tansania': 'TZ',
  'Thailand': 'TH',
  'Timor-Leste': 'TL',
  'East Timor': 'TL',
  'Osttimor': 'TL',
  'Togo': 'TG',
  'Tokelau': 'TK',
  'Tonga': 'TO',
  'Trinidad and Tobago': 'TT',
  'Tunisia': 'TN',
  'Tunesien': 'TN',
  'Turkey': 'TR',
  'Türkei': 'TR',
  'Republic of Türkiye': 'TR',
  'Turkmenistan': 'TM',
  'Turks and Caicos Islands': 'TC',
  'Tuvalu': 'TV',
  
  // U
  'Uganda': 'UG',
  'Ukraine': 'UA',
  'United Arab Emirates': 'AE',
  'Vereinigte Arabische Emirate': 'AE',
  'United Kingdom': 'GB',
  'Vereinigtes Königreich': 'GB',
  'UK': 'GB',
  'United States': 'US',
  'USA': 'US',
  'US Minor Outlying Islands': 'UM',
  'Uruguay': 'UY',
  'Uzbekistan': 'UZ',
  'Usbekistan': 'UZ',
  
  // V
  'Vanuatu': 'VU',
  'Vatican': 'VA',
  'Vatican City': 'VA',
  'Holy See (Vatican City State)': 'VA',
  'Vatikan': 'VA',
  'Venezuela': 'VE',
  'Venezuela, Bolivarian Republic of': 'VE',
  'Vietnam': 'VN',
  'Virgin Islands, British': 'VG',
  'Virgin Islands, U.S.': 'VI',
  
  // W
  'Wales': 'GB-WLS',
  'Wallis and Futuna': 'WF',
  'Wallis and Futuna Islands': 'WF',
  'Western Sahara': 'EH',
  'Westsahara': 'EH',
  
  // Y
  'Yemen': 'YE',
  'Jemen': 'YE',
  
  // Z
  'Zambia': 'ZM',
  'Sambia': 'ZM',
  'Zimbabwe': 'ZW',
  'Simbabwe': 'ZW',
  
  // Kingdom of Eswatini (formerly Swaziland)
  'Kingdom of Eswatini': 'SZ',
  'Eswatini': 'SZ',
  'Swaziland': 'SZ',
}

/**
 * Get country code from country name
 * @param country - Country name (English or German)
 * @returns ISO 3166-1 alpha-2 country code
 */
export function getCountryCode(country: string | null | undefined): string {
  if (!country) return 'CH' // Default to Switzerland
  
  const normalized = country.trim()
  return COUNTRY_CODES[normalized] || 'CH'
}

/**
 * Get country flag URL from GitHub repository
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns URL to flag SVG
 */
export function getCountryFlagUrl(countryCode: string): string {
  return `https://raw.githubusercontent.com/hampusborgos/country-flags/main/svg/${countryCode.toLowerCase()}.svg`
}

/**
 * Get country flag URL from country name
 * @param country - Country name (English or German)
 * @returns URL to flag SVG
 */
export function getCountryFlagUrlByName(country: string | null | undefined): string {
  const code = getCountryCode(country)
  return getCountryFlagUrl(code)
}

/**
 * Check if a country is Switzerland
 * @param country - Country name
 * @returns true if country is Switzerland
 */
export function isSwissClub(country: string | null | undefined): boolean {
  if (!country) return true // Default to Swiss
  const normalized = country.trim()
  return normalized === 'Switzerland' || normalized === 'Schweiz' || getCountryCode(country) === 'CH'
}

// Utility to get all countries with flags for dropdowns
export function getAllCountriesWithFlags(): { code: string, name: string, flagUrl: string, flagEmoji?: string }[] {
  // Remove duplicates by code, prefer English name
  const seen = new Set<string>();
  const countries: { code: string, name: string, flagUrl: string, flagEmoji?: string }[] = [];
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (!seen.has(code)) {
      seen.add(code);
      // Get emoji flag if possible
      const flagEmoji = code.length === 2
        ? String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
        : undefined;
      countries.push({
        code,
        name,
        flagUrl: getCountryFlagUrl(code),
        flagEmoji,
      });
    }
  }
  // Sort alphabetically by name
  countries.sort((a, b) => a.name.localeCompare(b.name));
  // Add 'Other' at the end
  countries.push({ code: 'OTHER', name: 'Other', flagUrl: '', flagEmoji: '🌍' });
  return countries;
}
