/**
 * League utility functions for converting between display names and enum values
 */

/**
 * Convert display league names to enum values with fault tolerance
 * Handles various input formats like "NLA", "NL A", "1. Liga", "1", etc.
 */
export function convertLeagueToEnum(league: string | null | undefined): string | undefined {
  if (!league || league === '') return undefined;
  
  const trimmed = league.trim();
  
  // Handle bare numbers (e.g., "1", "2", "3" for leagues)
  const bareNumberMap: { [key: string]: string } = {
    '1': 'FIRST_LEAGUE',
    '2': 'SECOND_LEAGUE',
    '3': 'THIRD_LEAGUE',
    '4': 'FOURTH_LEAGUE',
    '5': 'FIFTH_LEAGUE',
  };
  
  if (bareNumberMap[trimmed]) {
    return bareNumberMap[trimmed];
  }
  
  // Normalize input: trim, uppercase, remove extra spaces and dots
  const normalized = trimmed.toUpperCase().replace(/\s+/g, ' ').replace(/\.$/, '');
  
  // Try direct match first
  const leagueMap: { [key: string]: string } = {
    'NLA': 'NLA',
    'NL A': 'NLA',
    'NATIONAL LIGA A': 'NLA',
    'NLB': 'NLB',
    'NL B': 'NLB',
    'NATIONAL LIGA B': 'NLB',
    '1. LIGA': 'FIRST_LEAGUE',
    '1 LIGA': 'FIRST_LEAGUE',
    'ERSTE LIGA': 'FIRST_LEAGUE',
    '2. LIGA': 'SECOND_LEAGUE',
    '2 LIGA': 'SECOND_LEAGUE',
    'ZWEITE LIGA': 'SECOND_LEAGUE',
    '3. LIGA': 'THIRD_LEAGUE',
    '3 LIGA': 'THIRD_LEAGUE',
    'DRITTE LIGA': 'THIRD_LEAGUE',
    '4. LIGA': 'FOURTH_LEAGUE',
    '4 LIGA': 'FOURTH_LEAGUE',
    'VIERTE LIGA': 'FOURTH_LEAGUE',
    '5. LIGA': 'FIFTH_LEAGUE',
    '5 LIGA': 'FIFTH_LEAGUE',
    'FÜNFTE LIGA': 'FIFTH_LEAGUE',
    'U19 ELITE': 'U19_ELITE',
    'U-19 ELITE': 'U19_ELITE',
    'U17 ELITE': 'U17_ELITE',
    'U-17 ELITE': 'U17_ELITE',
    'U15 ELITE': 'U15_ELITE',
    'U-15 ELITE': 'U15_ELITE',
    'U19': 'U19',
    'U-19': 'U19',
    'U17': 'U17',
    'U-17': 'U17',
    'U15': 'U15',
    'U-15': 'U15',
    'U13': 'U13',
    'U-13': 'U13'
  };
  
  const mapped = leagueMap[normalized];
  if (mapped) return mapped;
  
  // Try pattern matching for common variations
  if (normalized.match(/^(NL\s*A|NATIONAL.*A)/)) return 'NLA';
  if (normalized.match(/^(NL\s*B|NATIONAL.*B)/)) return 'NLB';
  if (normalized.match(/^1[\.\s]*(LIGA|LIG)/)) return 'FIRST_LEAGUE';
  if (normalized.match(/^2[\.\s]*(LIGA|LIG)/)) return 'SECOND_LEAGUE';
  if (normalized.match(/^3[\.\s]*(LIGA|LIG)/)) return 'THIRD_LEAGUE';
  if (normalized.match(/^4[\.\s]*(LIGA|LIG)/)) return 'FOURTH_LEAGUE';
  if (normalized.match(/^5[\.\s]*(LIGA|LIG)/)) return 'FIFTH_LEAGUE';
  if (normalized.match(/^U[-\s]*19.*ELITE/)) return 'U19_ELITE';
  if (normalized.match(/^U[-\s]*17.*ELITE/)) return 'U17_ELITE';
  if (normalized.match(/^U[-\s]*15.*ELITE/)) return 'U15_ELITE';
  if (normalized.match(/^U[-\s]*19/)) return 'U19';
  if (normalized.match(/^U[-\s]*17/)) return 'U17';
  if (normalized.match(/^U[-\s]*15/)) return 'U15';
  if (normalized.match(/^U[-\s]*13/)) return 'U13';
  
  // Return original if no match (will be validated on save)
  return league;
}

/**
 * Get display label for a league enum value
 */
export function getLeagueLabel(league: string): string {
  const labels: { [key: string]: string } = {
    'NLA': 'NLA',
    'NLB': 'NLB',
    'FIRST_LEAGUE': '1. Liga',
    'SECOND_LEAGUE': '2. Liga',
    'THIRD_LEAGUE': '3. Liga',
    'FOURTH_LEAGUE': '4. Liga',
    'FIFTH_LEAGUE': '5. Liga',
    'U19_ELITE': 'U19 Elite',
    'U17_ELITE': 'U17 Elite',
    'U15_ELITE': 'U15 Elite',
    'U19': 'U19',
    'U17': 'U17',
    'U15': 'U15',
    'U13': 'U13',
  };
  return labels[league] || league;
}
