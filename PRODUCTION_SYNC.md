# How to Sync Clubs on Production

## Method 1: Using the Admin API Endpoint (Recommended)

The sync functionality is now available via a protected API endpoint.

### Steps:
1. Log in to the production site as an ADMIN user: https://www.habicht-volleyball.ch
2. Open your browser's Developer Console (F12)
3. Run this command in the console:

```javascript
fetch('/api/admin/sync-clubs', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Sync complete:', data))
.catch(err => console.error('Error:', err))
```

4. Check the console output for results

### Expected Output:
```json
{
  "totalPlayers": 3,
  "playersUpdated": 1,
  "playersCleared": 0,
  "playersSkipped": 2,
  "historyLinksUpdated": 1,
  "clubsNotFound": 0,
  "success": true
}
```

## Method 2: Direct Database Access

If you have direct access to the production database:

```bash
# Set the production database URL
$env:DATABASE_URL="postgresql://..."

# Run the sync script
npx tsx scripts/sync-current-clubs.ts
```

## What This Fixes

✅ **For ALL users (existing and new)**:
- Links players to their current club (makes them appear on club profiles)
- Makes club names clickable in career history
- Shows current club on player profiles
- Ensures data consistency

## When to Run

- After adding new clubs to the database
- After importing new players
- Periodically (e.g., once a week) to maintain consistency
- After any bulk data changes

## Automatic Updates

The system also updates automatically when:
- ✅ Players edit their profile and change club history
- ✅ New players register with club information
- ✅ Players mark a club as "current" in their career

So manual sync is only needed for:
- Existing data that hasn't been updated yet
- After bulk imports or database changes
