# Expanding Team Coverage for Web Scraping

## Current Status
The scraper currently covers:
- **NLA Men**: 9 teams
- **NLB Men**: 13 teams
- **1st Liga Men**: 11 teams
- **1st Liga Women**: 2 teams (started)
- **2nd Liga**: 0 teams
- **3rd Liga**: 0 teams  
- **4th Liga**: 0 teams

**Total**: 35 teams

## Goal
Scrape ALL Swiss volleyball clubs across all 6 league levels (~100-150 teams)

## Strategy

### 1. Use volleyball.ch Game Center
The official Swiss Volley website has complete league information:
- **Base URL**: https://www.volleyball.ch/de/game-center
- Filter by league using URL parameters:
  - `?gender=f&i_region=SV&i_league=6610` (1. Liga Women)
  - `?gender=m&i_region=SV&i_league=6612` (1. Liga Men)
  - Similar for 2. Liga, 3. Liga, 4. Liga

### 2. Extract Team Names from volleyball.ch
From the game center, we found teams like:
- **1. Liga Women Gruppe A**: VBC Cheseaux, Volley Espoirs Biel-Bienne, Rhone Volley, VBC Servette Star-Onex, Genève Volley, NNV FriSpike, TV Murten Volleyball, VBC Cossonay, VBC NUC, VBC Nendaz
- **1. Liga Women Gruppe B**: VB Therwil, BTV Aarau, TV Grenchen, Volley Köniz, VBC Lalden, Volley Möhlin, VBC Thun, VFM, Volley Münsingen, VBC Langenthal, VBC Münchenbuchsee
- **1. Liga Women Gruppe C**: NNV Eaglets Volley Aarau, VBC Kanti Baden, VBC Spada Academica, Volley Luzern, VB Neuenkirch, SAG Gordola, Volley Lugano, Volley Bellinzona, FC Luzern, SFG Stabio
- **1. Liga Women Gruppe D**: STV St.Gallen Volleyball, Volley Näfels, VBC Voléro Zürich, Volley Aadorf, VBC Züri Unterland, Raiffeisen Volley Toggenburg, Pallavolo Kreuzlingen, Volley Rüschlikon, VC Smash Winterthur, NNV Volleyball Academy, Appenzeller Bären, VC Kanti Schaffhausen

### 3. Search Each Team on Volleybox.net
For each team found on volleyball.ch:
1. Go to https://volleybox.net/search?q=[TEAM NAME]
2. Copy the team's Volleybox profile URL (e.g., `https://volleybox.net/[team-slug]-t[id]/players`)
3. Add to appropriate array in `scrape-volleybox.ts`

### 4. Teams Already Found on Volleybox
✅ VBC Cheseaux: `https://volleybox.net/vbc-cheseaux-t21629/players`
✅ VBC Cossonay: `https://volleybox.net/vbc-cossonay-t28778/players`
✅ VBC Thun: `https://volleybox.net/vbc-thun-t21497/players`
✅ TV Murten: `https://volleybox.net/tv-murten-volleyball-h1-t28767/players`
✅ Servette Star-Onex: `https://volleybox.net/servette-star-onex-vbc-ii-t20727/players`
✅ Volley Luzern: `https://volleybox.net/volley-luzern-t4517/players`

### 5. Check Women's Volleybox
Some teams might only exist on women.volleybox.net:
- Use https://women.volleybox.net/search?q=[TEAM NAME]
- Update scraper to handle both domains

### 6. Handle Missing Teams
Teams not on Volleybox:
- Document in a separate list
- Consider scraping directly from club websites
- Or mark as "manual entry required"

## Implementation Steps

### Step 1: Fetch All League Pages
```powershell
# Get all league/group pages from volleyball.ch
# Use browser dev tools to find league IDs
```

### Step 2: Extract All Team Names
Parse the HTML to get complete team lists for:
- 2. Liga Men/Women
- 3. Liga Men/Women
- 4. Liga Men/Women

### Step 3: Batch Search on Volleybox
Create a script to:
1. Read team names from JSON
2. Search each on Volleybox
3. Store found URLs in arrays
4. Log missing teams

### Step 4: Update scrape-volleybox.ts
Add all found URLs to the appropriate arrays:
```typescript
const FIRST_LIGA_WOMEN_TEAMS = [
  'https://volleybox.net/vbc-cheseaux-t21629/players',
  'https://volleybox.net/vbc-cossonay-t28778/players',
  'https://volleybox.net/vbc-thun-t21497/players',
  // ... add all 40+ teams
]

const SECOND_LIGA_TEAMS = [
  // Add discovered teams
]

const THIRD_LIGA_TEAMS = [
  // Add discovered teams
]

const FOURTH_LIGA_TEAMS = [
  // Add discovered teams
]
```

### Step 5: Update Town-Canton Mapping
Add any new towns discovered:
```typescript
const TOWN_TO_CANTON: Record<string, string> = {
  // ... existing mappings
  'Sursee': 'LU',
  'Olten': 'SO',
  // etc.
}
```

### Step 6: Test Scraping
```powershell
npx ts-node scripts/scrape-volleybox.ts
```

### Step 7: Import to Database
```powershell
npx ts-node scripts/import-volleybox-data.ts
```

## Notes
- **Rate Limiting**: Keep 2-second delay between requests
- **Error Handling**: Log teams that fail to scrape
- **Data Quality**: Verify canton mappings are correct
- **Women's Teams**: May need separate scraper for women.volleybox.net
- **Lower Leagues**: Teams in 3rd/4th Liga might not be on Volleybox at all

## Next Actions
1. ✅ Added Volley Luzern to 1st Liga Men
2. ✅ Started 1st Liga Women array with Cheseaux and Cossonay
3. ✅ Enhanced town-canton mapping with ~30 new towns
4. ⏳ Need to search remaining ~80 teams on Volleybox
5. ⏳ Add women.volleybox.net support for women's teams
6. ⏳ Create automated search script for batch processing
7. ⏳ Document teams not found on Volleybox
