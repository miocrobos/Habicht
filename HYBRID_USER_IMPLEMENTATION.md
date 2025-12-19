# HYBRID User Implementation Guide

## Overview
The HYBRID user role allows users to have both player and recruiter profiles, giving them dual functionality on the platform. This is useful for players who also coach or recruiters who also play.

## Features Implemented

### 1. User Role Enhancement
- ✅ Added `HYBRID` to `UserRole` enum in schema
- ✅ HYBRID users can access both player and recruiter features
- ✅ Registration system supports HYBRID role creation

### 2. CV Export System

#### For Players
- **Location**: Settings page → Account tab
- **Functionality**: Single button to export player CV
- **CV Content**: Personal info, positions, stats, club history, achievements, social media

#### For Recruiters
- **Location**: Settings page → Account tab
- **Functionality**: Single button to export recruiter CV
- **CV Content**: Coaching role, club affiliation, positions recruiting for, bio, achievements, social media

#### For Hybrid Users
- **Location**: Settings page → Account tab
- **Functionality**: Modal dialog to choose between Player CV or Recruiter CV
- **CV Content**: Can export either type based on selection
- **UI**: Orange gradient button indicating hybrid status

## Files Modified

### 1. Schema Changes
**File**: `prisma/schema.prisma`
```prisma
enum UserRole {
  PLAYER
  RECRUITER
  HYBRID    // NEW
  ADMIN
  CLUB_MANAGER
}
```

### 2. CV Generation Libraries

#### Player CV
**File**: `lib/generateCV.ts`
- Generates professional player CV in Swiss German
- Sections: Personal Profile, Athletic Data, Education, Club History, Social Media, Achievements
- Updated to include social media section (Instagram, TikTok, YouTube)

#### Recruiter CV  
**File**: `lib/generateRecruiterCV.ts` (NEW)
- Generates professional recruiter CV in Swiss German
- Sections: Personal Profile, Coaching Details, Current Club, Club History, Bio, Social Media, Achievements
- Includes coaching role, organization, positions looking for, gender coached
- Supports social media (Instagram, TikTok, YouTube, Facebook)

### 3. UI Components

#### CV Type Modal
**File**: `components/shared/CVTypeModal.tsx` (NEW)
- Modal dialog for hybrid users to select CV type
- Two options: Player CV (blue theme) or Recruiter CV (red theme)
- Loading state during PDF generation
- Auto-closes on successful export

### 4. Settings Page
**File**: `app/settings/page.tsx`
- Added CV export section in Account tab
- Fetches both player and recruiter data for hybrid users
- Shows appropriate button based on user role:
  - **PLAYER**: Blue button "Spieler Läbeslaauf Exportiere"
  - **RECRUITER**: Red button "Recruiter Läbeslaauf Exportiere"
  - **HYBRID**: Gradient button "CV Typ Wähle & Exportiere"
- Displays CV type modal for hybrid users

## User Experience Flow

### For Players
1. Navigate to Settings → Account tab
2. Scroll to "Läbeslaauf Exportiere" section
3. Click "Spieler Läbeslaauf Exportiere" button
4. PDF downloads automatically with player CV

### For Recruiters
1. Navigate to Settings → Account tab
2. Scroll to "Läbeslaauf Exportiere" section
3. Click "Recruiter Läbeslaauf Exportiere" button
4. PDF downloads automatically with recruiter CV

### For Hybrid Users
1. Navigate to Settings → Account tab
2. Scroll to "Läbeslaauf Exportiere" section
3. Click "CV Typ Wähle & Exportiere" button
4. Modal appears with two options:
   - 🏐 **Spieler CV**: Shows player profile data
   - 👔 **Recruiter CV**: Shows coaching/recruiting data
5. Click desired CV type
6. PDF downloads automatically
7. Modal closes

## CV Content Breakdown

### Player CV Includes
- Personal Profile (name, age, nationality, location, contact)
- Athletic Data (positions, height, weight, spike/block reach)
- Skills Ratings (receiving, serving, attacking, blocking, defense)
- Education (school name, employment status, occupation)
- Club History (clubs, leagues, years)
- Social Media (Instagram, TikTok, YouTube)
- Achievements & Awards
- Profile photo (if available)
- Habicht verification stamp

### Recruiter CV Includes
- Personal Profile (name, age, nationality, location, contact)
- Coaching Details (role, organization, position)
- Gender Coached (male, female teams)
- Positions Looking For (setter, outside hitter, etc.)
- Current Club (with logo if available)
- Club History (coaching roles at different clubs)
- Bio (about the coach)
- Social Media (Instagram, TikTok, YouTube, Facebook)
- Achievements & Awards
- Profile photo (if available)
- Habicht verification stamp

## PDF Styling

### Common Design Elements
- **Header**: Red banner (Habicht theme) with name and role
- **Logo**: Habicht eagle logo with "VERIFIZIERT VON HABICHT" text
- **Colors**: 
  - Primary: Red (#DC2626)
  - Dark Gray: #1F2937
  - Light Gray: #9CA3AF
- **Sections**: Bold red headings for each section
- **Footer**: Page numbers and Habicht branding
- **Font**: Helvetica (bold for headings, normal for content)

### Recruiter CV Specific
- Position subtitle below name (e.g., "Head Coach | Volley Zürich")
- Club logo display in club sections
- Role-specific translations (coach roles, positions)
- Professional coaching focus

## API Requirements

### Player Data Endpoint
**GET** `/api/players/[id]`
```typescript
{
  firstName, lastName, age, nationality, canton,
  positions, height, weight, spikeHeight, blockHeight,
  skillReceiving, skillServing, skillAttacking, skillBlocking, skillDefense,
  schoolName, employmentStatus, occupation,
  bio, achievements, instagram, tiktok, youtube,
  clubHistory: [{clubName, league, startDate, endDate}],
  user: {email},
  profileImage, currentClub: {name, logo}
}
```

### Recruiter Data Endpoint
**GET** `/api/recruiters/[id]`
```typescript
{
  firstName, lastName, age, nationality, canton, province,
  coachRole, organization, position,
  genderCoached: [], positionsLookingFor: [],
  bio, achievements, phone,
  instagram, tiktok, youtube, facebook,
  clubHistory: [{clubName, role, startDate, endDate}],
  club: {name, logo},
  user: {email},
  profileImage
}
```

## Registration Flow Updates Needed

### Current State
- Player registration: Creates User + Player profile
- Recruiter registration: Creates User + Recruiter profile

### Required Enhancement
- **Hybrid registration**: Must create User + Player profile + Recruiter profile
- Form should collect both player and recruiter information
- Set `user.role = 'HYBRID'`
- Link both profiles to same userId

## Deactivation/Deletion for Hybrid Users

### Deactivation
- Sets `Player.isActive = false` AND `Recruiter.isActive = false`
- Hides both profiles from public listings
- User can still log in but profiles are not visible

### Deletion
- Deletes User (cascade deletes Player and Recruiter due to schema)
- All related data removed (videos, messages, achievements)
- Permanent and irreversible

## Social Media Field Handling

### Player Social Media
- Instagram: `player.instagram` (handle with @)
- TikTok: `player.tiktok` (handle with @)
- YouTube: `player.youtube` (channel URL or handle)

### Recruiter Social Media
- Instagram: `recruiter.instagram` (handle with @)
- TikTok: `recruiter.tiktok` (handle with @)
- YouTube: `recruiter.youtube` (channel URL or handle)
- Facebook: `recruiter.facebook` (profile/page URL)

### CV Display Format
- Handles automatically prefixed with @ if not present
- Links formatted for easy copying
- Displayed in dedicated "SOCIAL MEDIA" section before achievements

## Next Steps / Future Enhancements

### 1. Hybrid Registration Page
- [ ] Create `/auth/register/hybrid` route
- [ ] Collect both player and recruiter information
- [ ] Create both profiles simultaneously
- [ ] Set appropriate default values for both profiles

### 2. Profile Management
- [ ] Allow hybrid users to switch between player and recruiter views
- [ ] Edit both profiles independently
- [ ] Toggle which profile is "primary" for display

### 3. Dashboard Enhancement
- [ ] Hybrid user dashboard showing both player and recruiter stats
- [ ] Quick toggle between player and recruiter mode
- [ ] Unified notification system

### 4. Search & Discovery
- [ ] Hybrid users appear in both player and recruiter searches
- [ ] Badge indicating hybrid status on profiles
- [ ] Filter option to show only hybrid users

## Testing Checklist

### Player CV Export
- [ ] Player can export CV from settings
- [ ] All sections display correctly
- [ ] Social media links formatted properly
- [ ] Profile photo displays (if present)
- [ ] PDF downloads with correct filename
- [ ] Works for players without optional fields

### Recruiter CV Export
- [ ] Recruiter can export CV from settings
- [ ] Coaching details display correctly
- [ ] Club history formatted properly
- [ ] Social media section displays
- [ ] PDF downloads with correct filename
- [ ] Works for recruiters without optional fields

### Hybrid CV Export
- [ ] Hybrid user sees modal when clicking export
- [ ] Modal displays both CV type options
- [ ] Player CV exports correctly when selected
- [ ] Recruiter CV exports correctly when selected
- [ ] Modal closes after successful export
- [ ] Loading state displays during generation
- [ ] Both CVs contain accurate data for the user

## Technical Notes

### PDF Generation
- Uses `jspdf` and `jspdf-autotable` libraries
- Async/await pattern for image loading
- Blob creation for download
- Timestamped filenames to prevent caching

### State Management
- Settings page uses React hooks for state
- Fetches data on mount based on user role
- Modal visibility controlled by `showCVModal` state
- Loading states prevent double-clicks

### Error Handling
- Try-catch blocks around all PDF generation
- User-friendly Swiss German error messages
- Console logging for debugging
- Graceful degradation if images fail to load

## Swiss German UI Text

### Settings Page
- **Section Title**: "Läbeslaauf Exportiere"
- **Player Button**: "Spieler Läbeslaauf Exportiere"
- **Recruiter Button**: "Recruiter Läbeslaauf Exportiere"
- **Hybrid Button**: "CV Typ Wähle & Exportiere"

### CV Type Modal
- **Title**: "CV Exportiere"
- **Subtitle**: "Wähl us, welli Art vo CV du hesch möchtest:"
- **Player Option**: "Spieler CV" - "Zeigt dini Spieler-Profile, Positione, Stats, Club-Gschicht, und Erfolge"
- **Recruiter Option**: "Recruiter CV" - "Zeigt dini Coaching-Rolle, Club-Affilierung, Positione wo du suechsch, und Erfahrig"
- **Loading**: "CV wird exportiert..."
- **Error**: "Fehler bim CV Export"

## Implementation Summary

✅ **Completed**:
1. Added HYBRID role to schema
2. Created recruiter CV generation function
3. Added social media to player CV
4. Created CV type selection modal
5. Updated settings page with CV export
6. Implemented role-based CV export logic

⏳ **In Progress**:
- None (all core features complete)

❌ **Not Started**:
1. Hybrid user registration flow
2. Hybrid user profile switching
3. Hybrid user dashboard

## Database Schema Status

### User Model
```prisma
role UserRole @default(PLAYER)  // Can be PLAYER, RECRUITER, HYBRID, ADMIN, CLUB_MANAGER
playerId String? @unique         // Links to Player profile
recruiterId String? @unique      // Links to Recruiter profile
```

### Migration Status
- Schema updated: ✅
- Applied to database: ✅ (via `prisma db push`)
- Production deployed: ✅

## Deployment Notes

### Environment Variables
No new environment variables required.

### Dependencies
```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.5.31"
}
```

### Build Process
1. Schema changes applied via `prisma db push`
2. No migration files needed (using db push)
3. Next.js build successful
4. Deployed to Vercel

## Support & Troubleshooting

### Common Issues

**Issue**: CV export button not showing
- **Solution**: Verify user has appropriate role and profile data exists

**Issue**: PDF not downloading
- **Solution**: Check browser console for errors, ensure data is loaded

**Issue**: Images not displaying in PDF
- **Solution**: Verify image URLs are accessible, check CORS settings

**Issue**: Hybrid modal not appearing
- **Solution**: Ensure both player and recruiter data are fetched

### Debug Commands
```bash
# Check user role
SELECT id, email, role, "playerId", "recruiterId" FROM "User" WHERE email = 'user@example.com';

# Check player profile
SELECT * FROM "Player" WHERE "userId" = 'user_id';

# Check recruiter profile  
SELECT * FROM "Recruiter" WHERE "userId" = 'user_id';
```

## Contact & Documentation
- **Platform**: Habicht Volleyball (www.habicht-volleyball.ch)
- **Tech Stack**: Next.js 14, Prisma, PostgreSQL (Neon), TypeScript
- **PDF Library**: jsPDF with autoTable plugin
- **Deployment**: Vercel
