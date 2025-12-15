# Volleybox Web Scraper

Scripts to scrape Swiss volleyball player data from Volleybox.net and import into your database.

## Scripts

### 1. `scrape-volleybox.ts`
Scrapes player data from Swiss NLA Men's teams on Volleybox.net

**Features:**
- Scrapes 8 NLA Men's teams for 2025/26 season
- Extracts player names, positions, heights, jersey numbers
- Maps teams to Swiss cantons
- Respectful 2-second delay between requests
- Outputs to `data/volleybox-teams.json`

### 2. `import-volleybox-data.ts`
Imports the scraped data into your Prisma database

**Features:**
- Creates/updates clubs in database
- Creates new players or updates existing ones
- Links players to their clubs
- Handles errors gracefully

## Usage

### Step 1: Scrape Data
```bash
npx ts-node scripts/scrape-volleybox.ts
```

This will:
- Fetch data from 8 Swiss NLA teams
- Save to `data/volleybox-teams.json`
- Show progress and summary

### Step 2: Import to Database
```bash
npx ts-node scripts/import-volleybox-data.ts
```

This will:
- Read the scraped JSON file
- Create clubs and players in database
- Show import progress and summary

## Data Collected

For each team:
- Name, league, canton, town
- Founded year, website
- List of players with:
  - Full name (first/last)
  - Position, height, jersey number
  - Date of birth, nationality

## Teams Scraped (NLA Men's 2025/26)

1. Chênois Genève VB (GE)
2. Colombier Volley (NE)
3. Lausanne UC (VD)
4. STV St. Gallen (SG)
5. Volley Schönenwerd (SO)
6. Volley Amriswil (TG)
7. TSV Jona (SG)
8. Volley Näfels (GL)

## Important Notes

⚠️ **Legal Considerations:**
- Check Volleybox.net's terms of service before scraping
- The script includes delays to be respectful
- Consider contacting Volleybox for official API access

⚠️ **Database Requirements:**
- Ensure your Prisma schema is up to date
- Run `npm run db:push` before importing
- Players need associated user accounts for authentication

## Customization

To scrape additional leagues:

1. **NLB Teams:** Add URLs to the scraper
2. **Women's Teams:** Use `women.volleybox.net` URLs
3. **Lower Leagues:** Add 1. Liga, 2. Liga URLs

Example:
```typescript
const NLB_MEN_TEAMS = [
  'https://volleybox.net/team-url-1/players',
  'https://volleybox.net/team-url-2/players',
  // ... more teams
]
```

## Troubleshooting

**"volleybox-teams.json not found"**
- Run the scraper first: `npx ts-node scripts/scrape-volleybox.ts`

**"Module not found"**
- Install dependencies: `npm install axios cheerio @types/cheerio`

**Import errors**
- Check Prisma schema matches the data structure
- Ensure database is running: `npm run db:push`

## Output Example

```
Starting Volleybox scraper...
Scraping 8 teams from Swiss NLA Men's League 2025/26

Fetching: https://volleybox.net/chenois-geneve-vb-t1415/players
✓ Scraped Chênois Genève VB: 13 players

Fetching: https://volleybox.net/colombier-volley-t4040/players
✓ Scraped Colombier Volley: 12 players

...

✓ Scraping complete!
✓ Total teams scraped: 8
✓ Total players scraped: 95
✓ Data saved to: data/volleybox-teams.json
```
