# Club Website URL Feature

## Overview
Added ability for players and scouts to provide a club website URL during registration. This URL is stored permanently and cannot be changed once set.

## Changes Made

### 1. Database Schema (prisma/schema.prisma)
Added `clubWebsiteUrl` field to `ClubHistory` model:
```prisma
model ClubHistory {
  // ... existing fields
  clubWebsiteUrl    String?     // Club website URL - set once during registration, immutable
  // ... other fields
}
```

### 2. Player Registration Form (app/auth/register/player/page.tsx)
- Updated `ClubExperience` interface to include `clubWebsiteUrl: string`
- Added website URL input field in club history section
- Field appears after league field with:
  - Label: "Vereins Websiite (Optional)"
  - Type: URL input
  - Placeholder: "https://www.verein-websiite.ch"
  - Help text: "Gib D Websiite Vom Verein II. Die Link Wird Nur Ei Mal Gsetzt Und Cha Nid Meh Gänderet Werde."

### 3. Registration API (app/api/auth/register/route.ts)
- Updated club history creation to include `clubWebsiteUrl` field
- Saves the URL provided during registration

### 4. Player Edit API (app/api/players/[id]/route.ts)
- **Immutability Logic**: When updating club history, the API:
  1. Fetches existing club history to get current website URLs
  2. Creates a map of club names to their existing website URLs
  3. When recreating club history entries, preserves the existing website URL if one was already set
  4. Only uses the new URL if no existing URL was found for that club name
- This ensures once a URL is set, it cannot be overwritten

### 5. Profile Edit Form (app/players/[id]/edit/page_full.tsx)
- Added `clubWebsiteUrl` field to club history form
- Website URL input includes:
  - Full-width input spanning 2 columns (md:col-span-2)
  - Disabled state when URL already exists (not for new clubs)
  - Warning message for existing URLs: "⚠️ D Websiite-URL Isch Bereits Gsetzt Und Cha Nüm Gänderet Werde."
  - Help text for empty URLs: "Gib D Websiite Vom Verein II. Die Link Wird Nur Ei Mal Gsetzt."

## Technical Details

### Immutability Implementation
The website URL is immutable after first save through this logic:
1. When editing, API fetches existing club history
2. Maps club names to their existing website URLs
3. When saving, uses existing URL if present, otherwise new URL
4. Frontend disables the input field if:
   - The club has an existing URL (not empty)
   - The club is not a newly added entry (ID doesn't start with "new-")

### Data Flow
```
Registration → clubWebsiteUrl saved → stored in database
                                           ↓
Edit Profile → API preserves URL → cannot be changed
                                           ↓
Profile Display → shows club link using saved URL
```

### Swiss German Labels
All UI text is in Swiss German (Schweizerdeutsch):
- "Vereins Websiite" (Club Website)
- "Gib D Websiite Vom Verein II" (Enter the club's website)
- "Die Link Wird Nur Ei Mal Gsetzt" (The link is only set once)

## Testing Checklist
- [x] Schema pushed to database successfully
- [ ] Register new player with club website URL
- [ ] Verify URL is saved in database
- [ ] Edit player profile and confirm URL field is disabled
- [ ] Try to change URL and verify it remains unchanged
- [ ] Add new club entry in edit form and verify URL field is editable
- [ ] Verify URL displays correctly on profile page

## Files Modified
1. `prisma/schema.prisma` - Added clubWebsiteUrl field
2. `app/auth/register/player/page.tsx` - Added URL input to registration
3. `app/api/auth/register/route.ts` - Save URL during registration
4. `app/api/players/[id]/route.ts` - Preserve URL during edits
5. `app/players/[id]/edit/page_full.tsx` - Added URL field to edit form
6. `app/players/[id]/edit/page.tsx` - Updated club history loading

## Usage Example
```typescript
// During registration
{
  clubName: "Volley Amriswil",
  league: "NLA",
  clubWebsiteUrl: "https://www.volley-amriswil.ch",
  // ... other fields
}

// In database (ClubHistory)
{
  id: "...",
  clubName: "Volley Amriswil",
  clubWebsiteUrl: "https://www.volley-amriswil.ch", // Immutable
  // ... other fields
}
```

## Future Enhancements
- Display club website link on player profile pages
- Add website link icon next to club name in club history display
- Validate URL format before saving
- Check if URL is reachable (optional)
