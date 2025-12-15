/**
 * Teams validated via official websites but not available on Volleybox
 * 
 * These teams have established club websites (ending in .ch) confirming they are legitimate,
 * active volleyball clubs in Switzerland. They will need manual data entry or custom scraping.
 */

export interface ValidatedClub {
  name: string
  website: string
  league: string
  canton?: string
  notes?: string
}

// Teams validated via official websites
export const TEAMS_WITH_WEBSITES: ValidatedClub[] = [
  // Will be populated by search-teams-volleybox.ts
  // Example:
  // {
  //   name: 'Volley Luzern',
  //   website: 'https://www.volleyluzern.ch',
  //   league: '1. Liga',
  //   canton: 'LU',
  //   notes: 'Uses ClubDesk platform'
  // }
]

/**
 * Import these teams into the database via manual entry or custom scrapers
 * Each club website may have different structure requiring custom parsing
 */
