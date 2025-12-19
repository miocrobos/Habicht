# Club Sync Scripts

## sync-current-clubs.ts

This script syncs all players' current club associations and links club history entries to clubs in the database.

### What it does:
1. **Updates currentClubId**: Sets the player's `currentClubId` field based on their current club in club history
2. **Links club history**: Connects all club history entries to actual clubs in the database (makes club names clickable)
3. **Clears invalid data**: Removes `currentClubId` if the club is no longer current or doesn't exist in DB

### When to run:
- After importing new players
- After adding new clubs to the database
- After data migration
- Periodically to ensure data consistency

### How to run locally:
```bash
npx tsx scripts/sync-current-clubs.ts
```

### How to run on production (Vercel):
You need to run this with production database credentials.

Option 1 - Using Vercel CLI:
```bash
# Set production DB URL temporarily
$env:DATABASE_URL="your-production-db-url"
npx tsx scripts/sync-current-clubs.ts
```

Option 2 - Via a temporary API endpoint (recommended):
Create a protected API endpoint and trigger it via HTTP request.

### What gets updated:
- ✅ Player.currentClubId - for showing current club on profile
- ✅ ClubHistory.clubId - for making club history entries clickable
- 🧹 Clears stale currentClubId values

### Safety:
- ✅ Read-mostly operation (safe to run anytime)
- ✅ Only updates if values are different
- ✅ Uses case-insensitive matching for club names
- ✅ Logs all changes for verification
