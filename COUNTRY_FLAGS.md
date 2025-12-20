# Country Flags Feature

## Overview
This feature automatically displays country flags as placeholder logos for volleyball clubs outside of Switzerland. When a player has club history with international teams, the country's flag is shown if no custom logo is uploaded.

## Implementation

### Files Created/Modified

1. **lib/countryFlags.ts** (NEW)
   - Contains country code mappings for 30+ countries
   - Supports both English and German country names
   - Provides utility functions:
     - `getCountryCode(country)` - Convert country name to ISO code
     - `getCountryFlagUrl(code)` - Get GitHub URL for flag SVG
     - `getCountryFlagUrlByName(country)` - Convenience wrapper
     - `isSwissClub(country)` - Check if club is Swiss

2. **components/shared/ClubBadge.tsx** (UPDATED)
   - Added `country` prop to component interface
   - Updated rendering logic with new priority chain:
     1. Uploaded logo (if exists)
     2. Country flag (if club is not Swiss and no uploaded logo)
     3. Custom emoji logo (for Swiss clubs from database)
     4. Eagle logo (default fallback)
   - Shows country name below badge when `showName=true` and club is not Swiss

3. **components/player/ClubHistory.tsx** (UPDATED)
   - Uses ClubBadge component instead of custom image rendering
   - Passes `clubCountry` field from club history to ClubBadge
   - Defaults to 'Switzerland' if country is not specified

## Data Structure

Club history records in the database already have the `clubCountry` field:
```typescript
model ClubHistory {
  id                String      @id @default(cuid())
  playerId          String
  clubId            String?     // Optional - null if club not in database
  clubName          String?     // Manual club name entry
  clubLogo          String?     // Base64 or URL to uploaded club logo
  clubCountry       String      @default("Switzerland") // Country
  league            String?
  startDate         DateTime
  endDate           DateTime?
  currentClub       Boolean     @default(false)
}
```

## Flag Sources

Country flags are loaded from the GitHub repository:
- Repository: `hampusborgos/country-flags:main`
- URL format: `https://raw.githubusercontent.com/hampusborgos/country-flags/main/svg/{countryCode}.svg`
- Format: SVG (scalable vector graphics)
- Example: Switzerland → `https://raw.githubusercontent.com/hampusborgos/country-flags/main/svg/ch.svg`

## Supported Countries

The system supports 30+ countries including:
- **European**: Switzerland, Germany, France, Italy, Austria, Spain, Portugal, Netherlands, Belgium, Poland, Czech Republic, Slovakia, Slovenia, Croatia, Serbia, Turkey, Russia, Ukraine
- **Americas**: USA, Canada, Brazil, Argentina, Mexico
- **Asia-Pacific**: Japan, China, South Korea, Thailand, India, Australia, New Zealand

Both English and German country names are supported (e.g., "Germany" or "Deutschland").

## Usage Example

When a player edits their profile and adds club history:
1. Player enters club name (e.g., "Modena Volley")
2. Player selects country (e.g., "Italy" or "Italien")
3. If no logo is uploaded, the Italian flag will be displayed automatically
4. The flag shows in:
   - Player profile club history section
   - Club badges throughout the application

## Future Enhancements

- Add more countries as needed
- Support for regional flags (e.g., Catalonia, Scotland)
- Custom flag overrides for specific clubs
- Automatic country detection from club name
