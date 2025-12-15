# Habicht - Swiss Volleyball Scouting Platform

**Habicht** (Hawk in Swiss German) is a comprehensive scouting platform for Swiss volleyball athletes from high school to university level. It provides a professional environment for players to showcase their talents, upload highlight videos, and connect with recruiters and university scouts.

## 🎯 Features

### For Players
- **Complete Player Profiles** - Showcase your volleyball career with detailed stats, physical attributes, and academic information
- **Video Highlights** - Upload gameplay videos directly or link from YouTube, Instagram, and TikTok
- **Club Integration** - Automatic linking to Swiss Volley and club websites (Volley Amriswil, Volley Schönenwerd, etc.)
- **Social Media Integration** - Connect your Instagram, TikTok, and YouTube accounts
- **Career Timeline** - Display your club history similar to Volleybox
- **Stats Tracking** - Track points, kills, aces, blocks, and more by season

### For Recruiters
- **Advanced Search** - Filter players by position, canton, league, height, and more
- **Scouting Notes** - Keep private notes and ratings on players
- **Favorites List** - Save and track promising athletes
- **Video Analysis** - Watch player highlights and game footage

### Swiss Volleyball Integration
- All 26 Swiss cantons supported
- Swiss Volley league system (NLA, NLB, 1. Liga, etc.)
- Integration with Swiss club websites
- Swiss-German interface ("Habicht" = Hawk)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary (for video/image uploads)
- **Video Players**: React Player (supports YouTube, Vimeo, TikTok, Instagram)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Cloudinary account (free tier available)
- Swiss Volley API key (optional, for enhanced club integration)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/miocrobos/UniSports.git
cd UniSports
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup

Create a PostgreSQL database:
```bash
# Using PowerShell
psql -U postgres
CREATE DATABASE habicht_db;
\q
```

### 4. Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/habicht_db"

# NextAuth (generate secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Cloudinary (sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Swiss Volley API (optional)
SWISS_VOLLEY_API_URL="https://www.volleyball.ch/api"
SWISS_VOLLEY_API_KEY="your-api-key-if-available"
```

### 5. Initialize Database

```bash
# Push Prisma schema to database
npm run db:push

# (Optional) Open Prisma Studio to view/edit data
npm run db:studio
```

### 6. Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Add upload preset
3. Create a preset named `habicht_videos` for video uploads
4. Set mode to "Unsigned" for easier uploads

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
UniSports/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── players/           # Player data endpoints
│   │   └── videos/            # Video upload endpoints
│   ├── auth/                   # Auth pages (login, register)
│   ├── players/               # Player pages
│   │   ├── [id]/             # Individual player profile
│   │   └── page.tsx          # Players search/browse
│   ├── dashboard/             # User dashboards
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
├── components/
│   ├── layout/                # Header, Footer
│   ├── player/                # Player-related components
│   │   ├── VideoUpload.tsx   # Video upload component
│   │   ├── VideoPlayer.tsx   # Video playback
│   │   ├── StatsDisplay.tsx  # Stats visualization
│   │   └── ClubHistory.tsx   # Career timeline
│   └── providers/             # Context providers
├── lib/
│   └── prisma.ts              # Prisma client
├── prisma/
│   └── schema.prisma          # Database schema
├── types/
│   └── next-auth.d.ts         # TypeScript definitions
├── .env.local                 # Environment variables (create this)
├── .env.example               # Environment template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

## 🎮 Usage

### Creating a Player Account

1. Go to `/auth/register`
2. Select "Spieler/in" (Player) as role
3. Complete registration
4. Fill out your player profile with:
   - Personal information (height, weight, position)
   - Academic details (school, GPA, graduation year)
   - Current club and league
   - Social media handles

### Uploading Videos

1. Navigate to your dashboard
2. Click "Video hinzufügen" (Add Video)
3. Choose upload method:
   - **Direct Upload**: Drag & drop MP4/MOV files (max 500MB)
   - **YouTube**: Paste YouTube video URL
   - **Instagram**: Paste Instagram video URL
   - **TikTok**: Paste TikTok video URL
4. Add title, description, and category
5. Submit

### For Recruiters

1. Register with "Recruiter" role
2. Search and filter players
3. View player profiles and videos
4. Add players to favorites
5. Keep private scouting notes

## 🌐 Swiss Club Integrations

The platform integrates with major Swiss volleyball clubs:

- **Volley Amriswil** - https://www.volley-amriswil.ch
- **Volley Schönenwerd** - https://www.volleyschoenenwerd.ch
- **VC Kanti Schaffhausen** - https://www.vckanti.ch
- **Volley Toggenburg** - https://www.volley-toggenburg.ch
- **SM'Aesch Pfeffingen** - https://www.smvolley.ch
- **VBC Cheseaux** - https://www.vbc-cheseaux.ch
- **Volley Alpnach** - https://www.volley-alpnach.ch

Players' club memberships automatically link to official club websites.

## 🔐 User Roles

- **PLAYER** - Create profile, upload videos, manage career information
- **RECRUITER** - Search players, save favorites, add scouting notes
- **CLUB_MANAGER** - Manage club rosters and player information
- **ADMIN** - Full system access

## 📊 Database Schema

Key models:
- **User** - Authentication and role management
- **Player** - Player profiles with stats and personal info
- **Club** - Swiss volleyball clubs
- **Video** - Player highlight videos (uploaded or external)
- **ClubHistory** - Career timeline
- **PlayerStats** - Season-by-season statistics
- **Achievement** - Trophies, awards, national team selections
- **Recruiter** - Recruiter profiles
- **Favorite** - Recruiter's saved players
- **RecruitmentNote** - Private scouting notes

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database Options

- **Vercel Postgres** - Integrated PostgreSQL
- **Supabase** - Free PostgreSQL hosting
- **Railway** - PostgreSQL with free tier
- **PlanetScale** - MySQL alternative (modify Prisma schema)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Adrian (miocrobos)**
- GitHub: [@miocrobos](https://github.com/miocrobos)

## 🙏 Acknowledgments

- Inspired by [Volleybox](https://www.volleybox.net)
- Swiss Volley for volleyball infrastructure
- All Swiss volleyball clubs and players

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Contact via project repository

---

**Habicht** - Empowering Swiss volleyball talent! 🏐🇨🇭
