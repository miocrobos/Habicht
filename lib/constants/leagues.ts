// Swiss volleyball leagues - used across the application for multi-selection
export const SWISS_LEAGUES = [
  { value: 'NLA', label: 'NLA (Nationalliga A)' },
  { value: 'NLB', label: 'NLB (Nationalliga B)' },
  { value: '1. Liga', label: '1. Liga' },
  { value: '2. Liga', label: '2. Liga' },
  { value: '3. Liga', label: '3. Liga' },
  { value: '4. Liga', label: '4. Liga' },
  { value: '5. Liga', label: '5. Liga' },
  { value: 'U23 Elite', label: 'U23 Elite' },
  { value: 'U19 Elite', label: 'U19 Elite' },
  { value: 'U17 Elite', label: 'U17 Elite' },
  { value: 'U15 Elite', label: 'U15 Elite' },
  { value: 'Other', label: 'Other' },
] as const;

export type SwissLeague = typeof SWISS_LEAGUES[number]['value'];

// Get league label by value
export function getLeagueLabel(value: string): string {
  const league = SWISS_LEAGUES.find(l => l.value === value);
  return league?.label || value;
}

// Get multiple league labels formatted
export function formatLeagues(leagues: string[]): string {
  if (!leagues || leagues.length === 0) return '';
  return leagues.map(getLeagueLabel).join(', ');
}
