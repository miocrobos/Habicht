# Team Validation Strategy - Swiss Volleyball Clubs

## Multi-Source Validation Approach

### Phase 1: Volleybox.net Search ✅
For each team:
1. Search on `https://volleybox.net/search?q=[TEAM NAME]`
2. If found: Extract player roster URL → Add to scraper
3. If not found: Proceed to Phase 2

### Phase 2: Google Website Validation ✅ (NEW)
For teams not on Volleybox:
1. Google search: `[TEAM NAME] volleyball Switzerland site:.ch`
2. Look for official club website with `.ch` domain
3. If website found: **Team is validated as legitimate**
4. Store website URL for manual data entry or custom scraping

### Phase 3: volleyball.ch Cross-Reference
- Use official Swiss Volley game center for league confirmation
- Verify team appears in current season schedules
- Validate against official league standings

## Validation Criteria

### ✅ Valid Team
A team is considered valid if **any** of these are true:
- Has Volleybox profile with player roster
- Has established official website (`.ch` domain)
- Appears in volleyball.ch official league listings
- Found in current season match schedules

### ❌ Invalid/Inactive Team
- No Volleybox presence
- No official website found
- Not in current season leagues
- Website inactive or abandoned

## Data Collection Strategy

### Tier 1: Automated Scraping (Volleybox)
**Teams**: NLA, NLB, some 1. Liga (~40-50 teams)
**Method**: `scrape-volleybox.ts` script
**Data Quality**: ⭐⭐⭐⭐⭐ (Complete player profiles)

### Tier 2: Website-Validated Manual Entry
**Teams**: 1. Liga, 2. Liga with official sites (~30-40 teams)
**Method**: Manual entry via admin interface
**Data Quality**: ⭐⭐⭐⭐ (Club-provided info)

### Tier 3: Schedule-Based Discovery
**Teams**: Lower leagues discovered through match schedules
**Method**: Extract from volleyball.ch game center
**Data Quality**: ⭐⭐⭐ (Basic team info only)

### Tier 4: Community Submission
**Teams**: Regional/amateur clubs
**Method**: Club self-registration portal
**Data Quality**: ⭐⭐⭐ (Self-reported, needs verification)

## Implementation Status

### ✅ Completed
- Volleybox scraper for 40 teams
- Google website validation in search script
- Town-canton mapping for 60+ Swiss locations
- Multi-league support (NLA through 4. Liga)

### 🔄 In Progress
- Running batch search with website validation (45 teams)
- Building validated teams list with websites

### ⏳ Next Steps
1. Complete search to identify all valid teams
2. Run Volleybox scraper for teams with profiles
3. Create admin interface for website-validated teams
4. Build volleyball.ch schedule parser
5. Implement club self-registration portal

## Expected Coverage

### Immediate (Volleybox only)
- **40-50 teams** with complete player rosters
- Top 3 leagues (NLA, NLB, 1. Liga)
- ~300-500 players

### Short-term (+ Website validation)
- **70-90 teams** with mixed data quality
- Leagues 1-3
- ~700-1000 players

### Long-term (All sources)
- **100-150 teams** comprehensive coverage
- All 6 leagues (NLA through 4. Liga)
- ~1500-2500 players

## Website Examples Found

Teams with established websites (being discovered now):
- Volley Luzern: `volleyluzern.ch`
- VBC Thun: (likely `vbc-thun.ch`)
- Many others being validated via Google search...

## Automation vs Manual Work

| Source | Teams | Automation | Manual Work |
|--------|-------|------------|-------------|
| Volleybox | 40-50 | 100% | 0% |
| Official websites | 30-40 | 20% | 80% |
| volleyball.ch | 30-40 | 50% | 50% |
| Club submission | 20-30 | 0% | 100% |

**Recommendation**: Focus automation on Volleybox (best ROI), use manual entry for website-validated clubs, build self-service portal for remaining teams.

## Current Script Status

Running: `search-teams-volleybox.ts`
- Searching 45 teams from 1st Liga
- Validates via Volleybox first
- Falls back to Google website search
- Outputs two lists:
  1. Teams on Volleybox (ready to scrape)
  2. Teams with websites (need manual entry)

Results will be saved to: `scripts/volleybox-search-results.json`
