# HYBRID Account Implementation Guide

## Overview
Implementation of HYBRID account type that combines Player and Recruiter capabilities.

## Database Changes Required

### 1. Update Prisma Schema (`prisma/schema.prisma`)
```prisma
enum UserRole {
  PLAYER
  RECRUITER
  HYBRID  // Add this
  ADMIN
}
```

### 2. Run Migration
```bash
npx prisma migrate dev --name add-hybrid-role
npx prisma generate
```

## Files to Create/Update

### 1. Registration Page
- ✅ Created: `/app/auth/register/hybrid/page.tsx` (combines both forms)

### 2. Card Components
- Update `RecruiterCard.tsx` - Add orange background for HYBRID
- Update player cards - Add orange background for HYBRID

### 3. Filters
- Update all filter dropdowns to include HYBRID option
- `/app/players/men/page.tsx`
- `/app/players/women/page.tsx`
- `/app/players/page.tsx`
- `/app/recruiters/page.tsx`
- `/app/clubs/[id]/page.tsx`

### 4. API Routes
- `/app/api/auth/register/route.ts` - Add HYBRID handling
- `/app/api/players/route.ts` - Include HYBRID in queries
- `/app/api/recruiters/route.ts` - Include HYBRID in queries

### 5. Profile Pages
- HYBRID users should appear in both `/players` and `/recruiters` sections
- Profile page should show combined capabilities

### 6. Color Scheme
- HYBRID backdrop: Orange (`#f97316` / `#ea580c`)
- Gradient: `linear-gradient(135deg, #f97316 0%, #ea580c 100%)`

## Swiss German Translations Needed

All hardcoded English strings need Swiss German translation:
- Personal Information → Persönlichi Informatione
- Physical Attributes → Physischi Eigeschafte  
- Current Club → Aktuellä Verein
- Club History → Verein-Gschicht
- Education & Employment → Bildig & Beschäftigung
- Achievements → Erfolg
- Date of Birth → Geburtsdatum
- Age → Alter
- Gender → Gschlecht
- Male → Männlich
- Female → Weiblich
- Nationality → Nationalität
- Canton → Kanton
- Email → E-Mail
- Phone → Telefon
- Height → Grössi
- Weight → Gwicht
- Spike Reach → Sprungattacke-Riichwiiti
- Block Reach → Block-Riichwiiti

## Implementation Priority
1. ✅ CV PDF image positioning fixed
2. ✅ Registration page updated with HYBRID option
3. Database schema update (requires manual migration)
4. Create hybrid registration page
5. Update all filters
6. Update card components  
7. Swiss German translation sweep
8. Testing

## Notes
- HYBRID users have both `player` and `recruiter` records in database
- They appear in both player and recruiter listings
- Orange is the designated HYBRID color throughout
