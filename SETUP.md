# Habicht - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Setup Database

#### Option A: Local PostgreSQL
```powershell
# Install PostgreSQL if not installed
# Download from: https://www.postgresql.org/download/windows/

# Create database
psql -U postgres
CREATE DATABASE habicht_db;
\q
```

#### Option B: Use Supabase (Free Cloud Database)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Use in DATABASE_URL

### 3. Configure Environment
```powershell
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your credentials
notepad .env.local
```

**Required settings:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

**Optional but recommended:**
- Cloudinary credentials (for video uploads)
- Swiss Volley API key (for club data)

### 4. Initialize Database
```powershell
npm run db:push
```

### 5. Run Development Server
```powershell
npm run dev
```

Visit: http://localhost:3000

## Cloudinary Setup (For Video Uploads)

### Free Account Setup
1. Sign up at https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)
2. Dashboard → Settings → Upload
3. Create upload preset:
   - Name: `habicht_videos`
   - Signing Mode: Unsigned
   - Folder: `habicht/player-videos`
   - Resource Type: Video
4. Copy credentials to `.env.local`:
   - Cloud Name
   - API Key
   - API Secret

## First User Setup

### Create Admin Account
1. Go to http://localhost:3000/auth/register
2. Register with your email
3. Role: Select "PLAYER" or "RECRUITER"

### Create Test Player Profile
Use Prisma Studio for direct database access:
```powershell
npm run db:studio
```
Opens at http://localhost:5555

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env.local
- Ensure database exists

### Cloudinary Upload Fails
- Verify all 3 credentials are set
- Check upload preset exists and is "Unsigned"
- Confirm folder name matches

### NextAuth Error
- Generate new NEXTAUTH_SECRET
- Set NEXTAUTH_URL to your current URL

## Production Deployment

### Vercel (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables for Production
- All .env.local variables
- Change NEXTAUTH_URL to production URL
- Use production database

## Need Help?

- Check the main README.md
- Open GitHub issue
- Review Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs

Good luck! 🏐
