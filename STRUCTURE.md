# 📁 Project Structure - Habicht

```
UniSports/
│
├── 📄 README.md                          # Main project documentation
├── 📄 SETUP.md                           # Quick setup guide
├── 📄 PROJECT_SUMMARY.md                 # Comprehensive project summary
├── 📄 QUICK_REFERENCE.md                 # Command & API reference
├── 📄 package.json                       # Dependencies & scripts
├── 📄 tsconfig.json                      # TypeScript configuration
├── 📄 next.config.js                     # Next.js configuration
├── 📄 tailwind.config.ts                 # Tailwind CSS theme
├── 📄 postcss.config.js                  # PostCSS configuration
├── 📄 .gitignore                         # Git ignore rules
├── 📄 .env.example                       # Environment template
├── 📄 .env.local                         # Local environment (configure this)
├── 📄 setup.ps1                          # Automated setup script
│
├── 📁 prisma/
│   └── 📄 schema.prisma                  # Database schema (14 models)
│
├── 📁 app/                               # Next.js App Router
│   │
│   ├── 📄 layout.tsx                     # Root layout (Header + Footer)
│   ├── 📄 page.tsx                       # Homepage (Swiss-themed)
│   ├── 📄 globals.css                    # Global styles
│   │
│   ├── 📁 auth/                          # Authentication pages
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx              # Login page
│   │   └── 📁 register/
│   │       └── 📄 page.tsx              # Registration page
│   │
│   ├── 📁 players/                       # Player pages
│   │   ├── 📄 page.tsx                  # Players search/browse
│   │   └── 📁 [id]/
│   │       └── 📄 page.tsx              # Individual player profile
│   │
│   ├── 📁 clubs/
│   │   └── 📄 page.tsx                  # Swiss clubs directory
│   │
│   ├── 📁 about/
│   │   └── 📄 page.tsx                  # About page
│   │
│   └── 📁 api/                           # Backend API routes
│       │
│       ├── 📁 auth/
│       │   ├── 📁 [...nextauth]/
│       │   │   └── 📄 route.ts          # NextAuth configuration
│       │   └── 📁 register/
│       │       └── 📄 route.ts          # User registration API
│       │
│       ├── 📁 players/
│       │   └── 📄 route.ts              # Player search API
│       │
│       └── 📁 videos/
│           ├── 📁 upload/
│           │   └── 📄 route.ts          # Video file upload to Cloudinary
│           └── 📁 external/
│               └── 📄 route.ts          # External video linking
│
├── 📁 components/                        # React components
│   │
│   ├── 📁 layout/
│   │   ├── 📄 Header.tsx                # Navigation header
│   │   └── 📄 Footer.tsx                # Footer with links
│   │
│   ├── 📁 player/
│   │   ├── 📄 VideoUpload.tsx           # Video upload component
│   │   ├── 📄 VideoPlayer.tsx           # Video playback
│   │   ├── 📄 StatsDisplay.tsx          # Statistics visualization
│   │   └── 📄 ClubHistory.tsx           # Career timeline
│   │
│   └── 📁 providers/
│       └── 📄 AuthProvider.tsx          # NextAuth session provider
│
├── 📁 lib/
│   └── 📄 prisma.ts                     # Prisma client singleton
│
└── 📁 types/
    └── 📄 next-auth.d.ts                # NextAuth TypeScript definitions
```

## 🎯 Key Directories Explained

### `/app` - Next.js App Router
All pages and API routes. Uses file-based routing.

### `/components` - Reusable UI Components
Organized by feature (layout, player, providers)

### `/prisma` - Database
Schema definition with 14 models covering all features

### `/lib` - Utilities
Shared utilities like Prisma client

### `/types` - TypeScript
Type definitions for better DX

## 📊 File Statistics

| Category | Count | Description |
|----------|-------|-------------|
| **Pages** | 7 | Public pages users can visit |
| **API Routes** | 5 | Backend endpoints |
| **Components** | 7 | Reusable UI components |
| **Config Files** | 7 | Project configuration |
| **Documentation** | 4 | README, SETUP, etc. |
| **Database Models** | 14 | Prisma schema models |
| **Total Files** | 36+ | Complete project |

## 🔄 Data Flow

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
├─────────────────┤
│ • Pages         │
│ • Components    │
│ • Client State  │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│   API Routes    │
│   (Backend)     │
├─────────────────┤
│ • Auth          │
│ • Players       │
│ • Videos        │
└──────┬──────────┘
       │
       ├─────────────┐
       ↓             ↓
┌──────────┐   ┌──────────────┐
│ Prisma   │   │  Cloudinary  │
│   ORM    │   │   (Videos)   │
└────┬─────┘   └──────────────┘
     │
     ↓
┌──────────┐
│PostgreSQL│
│   DB     │
└──────────┘
```

## 🎨 Component Hierarchy

```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation
│   └── Auth Menu
│
├── Main Content
│   ├── Home Page
│   │   ├── Hero Section
│   │   ├── Features Grid
│   │   └── CTA Section
│   │
│   ├── Players Page
│   │   ├── Search Filters
│   │   └── Player Cards Grid
│   │
│   └── Player Profile
│       ├── Profile Header
│       ├── Tabs Navigation
│       ├── Overview Tab
│       ├── Videos Tab
│       │   └── Video Upload
│       ├── Stats Tab
│       │   └── Stats Display
│       └── History Tab
│           └── Club History
│
└── Footer
    ├── Links
    ├── Social Media
    └── Copyright
```

## 🗄️ Database Schema Overview

```
User (Auth)
├── Player
│   ├── PlayerStats (1:Many)
│   ├── Videos (1:Many)
│   ├── ClubHistory (1:Many)
│   ├── Achievements (1:Many)
│   └── RecruitmentNotes (1:Many)
│
├── Recruiter
│   ├── Favorites (1:Many)
│   └── RecruitmentNotes (1:Many)
│
└── ClubManager
    └── Club

Club
├── CurrentPlayers (1:Many to Player)
├── ClubHistory (1:Many)
└── Managers (1:Many to ClubManager)
```

## 🔐 Authentication Flow

```
Register → Hash Password → Create User → Assign Role → Redirect to Login
                                            ↓
Login → Verify Credentials → Create Session → JWT Token → Access Protected Routes
```

## 📹 Video Upload Flow

### Direct Upload
```
Select File → Drag/Drop → Upload to Cloudinary → Get URL → Save to DB → Display
```

### External Link
```
Paste URL → Validate → Extract Thumbnail → Save to DB → Embed Player
```

## 🔍 Player Search Flow

```
Enter Filters → API Request → Prisma Query → Filter Results → Return Players → Display Cards
```

## 🚀 Deployment Architecture

```
GitHub Repo
    ↓
Vercel (Hosting)
    ├→ Next.js App (Edge Network)
    └→ API Routes (Serverless Functions)
         ↓
    ┌────┴────┐
    ↓         ↓
Supabase   Cloudinary
(Database)  (Storage)
```

## 📦 npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## 🎯 Ready to Go!

Everything is organized, documented, and ready to use. Just configure your environment and start coding! 🚀

**Viel Erfolg! 🏐🇨🇭**
