// Swiss Cantons - multilingual data
// Used for dropdowns and filters across the application

export interface Canton {
  code: string;
  // Names will come from translations
}

// Canton codes in alphabetical order
export const CANTON_CODES = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU',
  'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS',
  'ZG', 'ZH'
];

// Helper to get canton translation key
export function getCantonKey(code: string): string {
  return `cantons.${code}`;
}
