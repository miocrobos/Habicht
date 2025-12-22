// Country code mapping for club flags
// Uses hampusborgos/country-flags repository

export interface CountryInfo {
  code: string
  name: string
  flagUrl: string
}

// ISO 3166-1 alpha-2 country codes
const COUNTRY_CODES: Record<string, string> = {
  // Europe
  'Switzerland': 'CH',
  'Schweiz': 'CH',
  'Germany': 'DE',
  'Deutschland': 'DE',
  'France': 'FR',
  'Frankreich': 'FR',
  'Italy': 'IT',
  'Italien': 'IT',
  'Austria': 'AT',
  'Österreich': 'AT',
  'Spain': 'ES',
  'Spanien': 'ES',
  'Portugal': 'PT',
  'Netherlands': 'NL',
  'Niederlande': 'NL',
  'Belgium': 'BE',
  'Belgien': 'BE',
  'Poland': 'PL',
  'Polen': 'PL',
  'Czech Republic': 'CZ',
  'Tschechien': 'CZ',
  'Slovakia': 'SK',
  'Slowakei': 'SK',
  'Slovenia': 'SI',
  'Slowenien': 'SI',
  'Croatia': 'HR',
  'Kroatien': 'HR',
  'Serbia': 'RS',
  'Serbien': 'RS',
  'Turkey': 'TR',
  'Türkei': 'TR',
  'Russia': 'RU',
  'Russland': 'RU',
  'Ukraine': 'UA',
  
  // Americas
  'United States': 'US',
  'USA': 'US',
  'Canada': 'CA',
  'Kanada': 'CA',
  'Brazil': 'BR',
  'Brasilien': 'BR',
  'Argentina': 'AR',
  'Argentinien': 'AR',
  'Mexico': 'MX',
  'Mexiko': 'MX',
  
  // Asia
  'Japan': 'JP',
  'China': 'CN',
  'South Korea': 'KR',
  'Südkorea': 'KR',
  'Thailand': 'TH',
  'India': 'IN',
  'Indien': 'IN',
  
  // Oceania
  'Australia': 'AU',
  'Australien': 'AU',
  'New Zealand': 'NZ',
  'Neuseeland': 'NZ',
  
  // Africa
  'Nigeria': 'NG',
  'South Africa': 'ZA',
  'Südafrika': 'ZA',
  'Egypt': 'EG',
  'Ägypten': 'EG',
  'Kenya': 'KE',
  'Kenia': 'KE',
  'Morocco': 'MA',
  'Marokko': 'MA',
  'Tunisia': 'TN',
  'Tunesien': 'TN',
  'Algeria': 'DZ',
  'Algerien': 'DZ',
  'Ghana': 'GH',
  'Cameroon': 'CM',
  'Kamerun': 'CM',
  'Senegal': 'SN',
  'Ethiopia': 'ET',
  'Äthiopien': 'ET',
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
