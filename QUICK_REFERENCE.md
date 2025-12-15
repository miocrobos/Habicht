# 🚀 Quick Reference - Habicht

## Essential Commands

```powershell
# Install dependencies
npm install

# Initialize database
npm run db:push

# Start development
npm run dev

# View database
npm run db:studio

# Build for production
npm run build

# Start production
npm start
```

## Project URLs

- **Development**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (when running `npm run db:studio`)

## Key Pages

- Home: `/`
- Players Search: `/players`
- Player Profile: `/players/[id]`
- Clubs: `/clubs`
- Login: `/auth/login`
- Register: `/auth/register`
- About: `/about`

## Environment Variables (Required)

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/habicht_db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

## Environment Variables (Optional)

```env
# Cloudinary (for video uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Swiss Volley API
SWISS_VOLLEY_API_KEY="your-api-key"
```

## Database Models

- **User** - Authentication & roles
- **Player** - Player profiles
- **Club** - Swiss volleyball clubs
- **Video** - Highlight videos
- **PlayerStats** - Season statistics
- **ClubHistory** - Career timeline
- **Achievement** - Awards & honors
- **Recruiter** - Recruiter profiles
- **Favorite** - Saved players
- **RecruitmentNote** - Private notes

## User Roles

- `PLAYER` - Athletes creating profiles
- `RECRUITER` - Scouts searching for talent
- `CLUB_MANAGER` - Club administrators
- `ADMIN` - Platform administrators

## Swiss Volleyball Leagues

- **NLA** - Nationalliga A (top tier)
- **NLB** - Nationalliga B
- **FIRST_LEAGUE** - 1. Liga
- **SECOND_LEAGUE** - 2. Liga
- **THIRD_LEAGUE** - 3. Liga
- **YOUTH_U19** - Under 19
- **YOUTH_U17** - Under 17
- **YOUTH_U15** - Under 15
- **HIGH_SCHOOL** - Kantonsschule

## Player Positions

- `OUTSIDE_HITTER` - Aussenspieler
- `OPPOSITE` - Diagonalspieler
- `MIDDLE_BLOCKER` - Mittelblocker
- `SETTER` - Zuspieler/Passeur
- `LIBERO` - Libero
- `UNIVERSAL` - Universal

## Video Types

- `UPLOADED` - Direct upload to Cloudinary
- `YOUTUBE` - YouTube video
- `INSTAGRAM` - Instagram video
- `TIKTOK` - TikTok video

## Highlight Categories

- FULL_MATCH
- HIGHLIGHTS
- SKILLS
- SERVING
- ATTACKING
- BLOCKING
- DEFENSE
- SETTING
- TRAINING

## Swiss Cantons (All 26)

ZH, BE, LU, UR, SZ, OW, NW, GL, ZG, FR, SO, BS, BL, SH, AR, AI, SG, GR, AG, TG, TI, VD, VS, NE, GE, JU

## Common Tasks

### Create First User
1. Run `npm run dev`
2. Go to http://localhost:3000/auth/register
3. Fill in details and select role
4. Login at http://localhost:3000/auth/login

### Add Test Data
```powershell
npm run db:studio
```
Opens Prisma Studio to manually add/edit records

### Reset Database
```powershell
# Warning: Deletes all data!
npx prisma db push --force-reset
```

### Generate Prisma Client
```powershell
npx prisma generate
```

### View Database Schema
```powershell
npx prisma studio
```

## API Endpoints

### Players
- `GET /api/players` - Search players
- Query params: search, position, canton, league, minHeight

### Videos
- `POST /api/videos/upload` - Upload video file
- `POST /api/videos/external` - Add external video

### Auth
- `POST /api/auth/register` - Register new user
- NextAuth handles login/logout

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Ensure database exists: `CREATE DATABASE habicht_db;`

### Prisma Error
```powershell
npx prisma generate
npx prisma db push
```

### Module Not Found
```powershell
rm -r node_modules
npm install
```

### Port Already in Use
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Free Services for Deployment

- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (Next.js optimized)
- **Storage**: Cloudinary (25GB free)
- **Domain**: Cloudflare (free DNS)

## Support

- 📖 **Docs**: README.md, SETUP.md
- 📋 **Summary**: PROJECT_SUMMARY.md
- 🐛 **Issues**: GitHub repository
- 📧 **Email**: info@habicht-volleyball.ch

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure .env.local
3. ✅ Set up database
4. ✅ Run `npm run db:push`
5. ✅ Start with `npm run dev`
6. 🎯 Create first user
7. 🎯 Add test clubs and players
8. 🚀 Deploy to production

**Ready to scout some talent! 🏐**
