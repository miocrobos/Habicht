# Swiss Customization Features - Habicht

## 🇨🇭 New Features Overview

This document describes the enhanced Swiss-specific features added to the Habicht platform.

## 1. Canton-Based Color Schemes

### Dynamic Theming
Every player profile now dynamically adjusts its color scheme based on their canton of residence. Each of Switzerland's 26 cantons has its official colors integrated:

**Example Canton Colors:**
- **Zürich (ZH)**: Blue & White (#0F05A0, #FFFFFF)
- **Bern (BE)**: Red & Gold (#FF0000, #FFD700)
- **Geneva (GE)**: Gold & Red (#FFD700, #FF0000)
- **St. Gallen (SG)**: Green & White (#009B77, #FFFFFF)

### Where It Applies:
- Player profile cover images (gradient backgrounds)
- Profile picture borders
- Statistics displays
- Quick stats highlights
- Player search cards

### Implementation:
```typescript
// lib/swissData.ts
export const CANTON_INFO = {
  ZH: {
    name: 'Zürich',
    colors: { primary: '#0F05A0', secondary: '#FFFFFF' },
    // ... more info
  },
  // ... all 26 cantons
}
```

## 2. Canton Flags

### Display
Canton flags appear as visual badges throughout the platform:
- **Player Profiles**: Top-right corner of cover image
- **Search Results**: Top-right of player cards
- **Lists**: Next to player names where relevant

### Sizes Available:
- `sm`: 8x6 pixels (32x24px) - For compact displays
- `md`: 12x9 pixels (48x36px) - Default size
- `lg`: 16x12 pixels (64x48px) - For profile headers

### Usage:
```tsx
import CantonFlag from '@/components/shared/CantonFlag'

<CantonFlag canton="ZH" size="lg" showName />
```

### Features:
- Two-color gradient representing canton flag
- Canton abbreviation overlay (ZH, BE, etc.)
- Optional full canton name display
- Rounded corners with shadow

## 3. Club Symbols & Badges

### Club Identity
Each major Swiss volleyball club has:
- **Official Colors**: Primary & secondary team colors
- **Logo Emoji**: Representative symbol (🦅, ⚡, 🎓, etc.)
- **Club Abbreviation**: 2-letter identifier (VA, VS, KS, etc.)

### Featured Clubs:
1. **Volley Amriswil** 🦅 - Red & Black (VA)
2. **Volley Schönenwerd** ⚡ - Blue & Gold (VS)
3. **VC Kanti Schaffhausen** 🎓 - Black & Gold (KS)
4. **Volley Toggenburg** 🏔️ - Green & White (VT)
5. **SM'Aesch Pfeffingen** 🔥 - Orange & Black (SM)
6. **VBC Cheseaux** ⭐ - Blue & White (CH)
7. **Volley Alpnach** ⛰️ - Blue & White (AL)

### Display:
- Circular badge with club colors
- Emoji symbol in center
- Optional club name alongside
- Colored border matching team colors

### Usage:
```tsx
import ClubBadge from '@/components/shared/ClubBadge'

<ClubBadge clubName="Volley Amriswil" size="md" showName />
```

## 4. Teammates Feature

### Overview
Players can list their current and former teammates, creating a network of connections within the Swiss volleyball community.

### Database Schema:
```prisma
model Teammate {
  id          String   @id
  playerId    String   // Current player
  teammateId  String   // Referenced teammate
  clubName    String   // Which club they played together
  season      String   // e.g., "2023-2024"
}
```

### Display Features:
- **Grouped by Club/Season**: Teammates organized by when/where you played together
- **Player Cards**: Mini profiles showing name, position, jersey number
- **Direct Links**: Click to view teammate's full profile
- **Visual Indicators**: Jersey numbers displayed prominently
- **Hover Effects**: Cards scale on hover for better UX

### API Endpoints:
- `GET /api/players/[id]/teammates` - Fetch player's teammates
- `POST /api/players/[id]/teammates` - Add new teammate

### Usage in Profile:
New "Teammates" tab in player profile showing all past and current team members.

## 5. Coaches Feature

### Overview
Comprehensive coach profiles linked to clubs, allowing players to showcase their coaching staff and maintain professional connections.

### Database Schema:
```prisma
model Coach {
  id              String   @id
  firstName       String
  lastName        String
  clubId          String
  role            String   // "Headcoach", "Assistant Coach", etc.
  specialization  String?  // "Attack & Tactics", "Defense", etc.
  email           String?
  phone           String?
  bio             String?
  photoUrl        String?
  yearsExperience Int?
  certifications  String[] // Array of qualifications
}
```

### Display Features:
- **Grouped by Club**: Coaches organized by which club they work for
- **Role Hierarchy**: Head coaches displayed before assistants
- **Specializations**: Shows what area they focus on
- **Experience**: Years of coaching displayed prominently
- **Contact Info**: Email links for direct contact
- **Profile Pictures**: Coach avatars with initials fallback

### Coach Roles:
- Headcoach / Cheftrainer
- Assistenztrainer / Assistant Coach
- Jugendtrainer / Youth Coach
- Konditionstrainer / Fitness Coach
- Videoanalyst / Video Analyst

### API Endpoints:
- `GET /api/coaches?clubId=[id]` - Fetch coaches for a club
- `POST /api/coaches` - Create new coach profile

### Usage in Profile:
New "Coaches" tab showing all coaches the player has worked with throughout their career.

## 6. Enhanced Player Profile Layout

### New Tabs:
The player profile now has 6 main sections:

1. **Übersicht** (Overview)
   - Personal info
   - Physical stats
   - Education
   - Achievements

2. **Videos**
   - Highlight reels
   - Game footage
   - Skills compilations

3. **Statistiken** (Statistics)
   - Season-by-season stats
   - Performance metrics
   - Progress charts

4. **Karriere** (Career/History)
   - Club timeline
   - Previous teams
   - Career progression

5. **Teammates** ⭐ NEW
   - Current teammates
   - Former teammates
   - Grouped by club/season

6. **Coaches** ⭐ NEW
   - Current coaches
   - Former coaches
   - Contact information

### Visual Enhancements:
- Canton-colored gradients on cover images
- Club badges with official colors
- Canton flags as profile badges
- Color-coordinated statistics
- Responsive design for all screen sizes

## 7. Enhanced Search Page

### Player Cards Improvements:
- **Canton Flag Badge**: Top-right corner of each card
- **Club Badge**: Integrated club symbol with colors
- **Dynamic Colors**: Stats use canton primary color
- **Better Club Display**: Club badge + name in compact format

### Color Coordination:
All elements on the card match the player's canton colors for immediate visual recognition.

## 8. Technical Implementation

### New Files Created:
```
lib/swissData.ts                          # Canton & club data
components/shared/CantonFlag.tsx          # Canton flag component
components/shared/ClubBadge.tsx           # Club badge component
components/player/TeammatesList.tsx       # Teammates display
components/player/CoachesList.tsx         # Coaches display
app/api/players/[id]/teammates/route.ts   # Teammates API
app/api/coaches/route.ts                  # Coaches API
```

### Updated Files:
```
prisma/schema.prisma                      # Added Coach & Teammate models
app/players/[id]/page.tsx                 # Enhanced profile with new tabs
app/players/page.tsx                      # Search with canton colors
tailwind.config.ts                        # Added canton color palette
```

## 9. Database Migrations

After pulling these changes, run:

```powershell
npm run db:push
```

This will create the new tables:
- `Coach` - For coach profiles
- `Teammate` - For player connections

## 10. Usage Examples

### Adding a Teammate:
```typescript
await axios.post(`/api/players/${playerId}/teammates`, {
  teammateId: 'other-player-id',
  clubName: 'Volley Amriswil',
  season: '2023-2024'
})
```

### Adding a Coach:
```typescript
await axios.post('/api/coaches', {
  firstName: 'Stefan',
  lastName: 'Hübscher',
  clubId: 'club-id',
  role: 'Headcoach',
  specialization: 'Attack & Tactics',
  yearsExperience: 15
})
```

### Using Canton Colors:
```typescript
import { getCantonInfo } from '@/lib/swissData'

const cantonInfo = getCantonInfo('ZH')
// Use cantonInfo.colors.primary and .secondary
```

## 11. Swiss Volleyball Integration

### Authenticity:
All features maintain authentic Swiss volleyball culture:
- Swiss-German terminology throughout
- Official canton colors and symbols
- Real Swiss club identities
- Local volleyball structure (NLA, NLB, etc.)

### Club Connections:
Each club link maintains connection to official websites:
- Volley Amriswil → https://www.volley-amriswil.ch
- And more for all clubs

## 12. Future Enhancements

Potential additions:
- Club-specific player statistics
- Team photos and group shots
- Coach ratings and testimonials
- Teammate endorsements
- Historical match data
- Canton-based tournaments
- Regional volleyball news

## 🎨 Design Philosophy

The platform now truly reflects Swiss volleyball identity:
- **Regional Pride**: Canton colors celebrate local identity
- **Team Unity**: Teammates feature builds community
- **Professional Network**: Coaches create career connections
- **Visual Consistency**: All elements use authentic Swiss colors
- **Cultural Authenticity**: Swiss-German terminology and structure

---

**Viel Erfolg! 🏐🇨🇭**

All features are production-ready and fully integrated with the existing platform.
