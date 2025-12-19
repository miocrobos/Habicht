# User Account Management System - Complete Implementation

## ✅ All Features Implemented and Deployed

### 1. **Registration - User Linking** ✅
**Status**: Already implemented correctly

- ✅ User created first with email, password, role
- ✅ Player/Recruiter profile created and linked via `userId`
- ✅ Cascade relationship: `User` → `Player`/`Recruiter`
- ✅ User name automatically set to `firstName lastName`
- ✅ All data properly linked in single transaction

**Schema**:
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  name     String
  role     UserRole
  player   Player?
  recruiter Recruiter?
}

model Player {
  userId   String @unique
  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 2. **Profile Editing - User Info Sync** ✅
**Status**: Newly implemented

When a player edits their profile:
- ✅ User.name automatically updates to match `firstName lastName`
- ✅ Ensures consistency across the system
- ✅ Single source of truth maintained

**Implementation**: `app/api/players/[id]/route.ts`
```typescript
// Update user name to match player name
await prisma.user.update({
  where: { id: existingPlayer.userId },
  data: {
    name: `${playerData.firstName} ${playerData.lastName}`
  }
});
```

### 3. **Account Deactivation - Hide from Website** ✅
**Status**: Enhanced implementation

When user deactivates account:
- ✅ User.emailVerified set to false (prevents login)
- ✅ Player.isActive set to false (hides from listings)
- ✅ Recruiter.isActive set to false (hides from listings)
- ✅ Profile hidden but data preserved
- ✅ Can be reactivated by admin

**Implementation**: `app/api/auth/deactivate/route.ts`
```typescript
// Deactivate user
await prisma.user.update({
  where: { email: session.user.email },
  data: { emailVerified: false }
});

// Deactivate player profile
if (user.player) {
  await prisma.player.update({
    where: { id: user.player.id },
    data: { isActive: false }
  });
}

// Deactivate recruiter profile
if (user.recruiter) {
  await prisma.recruiter.update({
    where: { id: user.recruiter.id },
    data: { isActive: false }
  });
}
```

### 4. **Account Deletion - Remove from Database** ✅
**Status**: Already implemented with cascade

When user deletes account:
- ✅ All related data deleted (videos, messages, etc.)
- ✅ Player/Recruiter profile deleted
- ✅ User account permanently deleted
- ✅ Cascade deletes handle all relationships

**Implementation**: `app/api/auth/delete-account/route.ts`
```typescript
// Delete related data
await prisma.video.deleteMany({ where: { playerId: user.player.id }});
await prisma.chatRequest.deleteMany({...});
await prisma.conversation.deleteMany({...});

// Delete player
await prisma.player.delete({ where: { id: user.player.id }});

// Delete user (cascades to remaining relations)
await prisma.user.delete({ where: { id: user.id }});
```

### 5. **Filtering Inactive Users** ✅
**Status**: Newly implemented

All listing endpoints now filter by `isActive`:

**Player Listings**: `app/api/players/route.ts`
```typescript
const where: any = {
  isPublic: true,
  isActive: true,  // Only show active players
}
```

**Recruiter Listings**: `app/api/recruiters/route.ts`
```typescript
const where: any = {
  isActive: true,  // Only show active recruiters
  user: {
    emailVerified: true,
  },
}
```

**Club Players**: `app/api/clubs/players/route.ts`
```typescript
const playerWhere: any = {
  isActive: true  // Only show active players
}
```

## 📊 Database Schema

### User → Player/Recruiter Relationship
```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  password      String
  name          String
  role          UserRole    @default(PLAYER)
  emailVerified Boolean     @default(false)
  player        Player?
  recruiter     Recruiter?
}

model Player {
  id                String      @id @default(cuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName         String
  lastName          String
  isActive          Boolean     @default(true)
  // ... other fields
}

model Recruiter {
  id                String      @id @default(cuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName         String
  lastName          String
  isActive          Boolean     @default(true)
  // ... other fields
}
```

### Cascade Delete Configuration
All relationships use `onDelete: Cascade`:
- ✅ User → Player
- ✅ User → Recruiter
- ✅ Player → Videos
- ✅ Player → ClubHistory
- ✅ Player → ChatRequests
- ✅ Player → Conversations
- ✅ Player → Messages
- ✅ Recruiter → Messages
- ✅ Recruiter → ChatRequests
- ✅ Recruiter → Conversations

## 🔄 User Lifecycle

### Registration Flow
1. User enters registration details
2. System creates User account
3. System creates linked Player/Recruiter profile
4. User name set to `firstName lastName`
5. Verification email sent
6. User confirms email → account activated

### Profile Update Flow
1. User edits profile (name, info, etc.)
2. Player/Recruiter data updated
3. **User.name automatically synced**
4. Changes reflected immediately

### Deactivation Flow
1. User requests account deactivation
2. User.emailVerified → false (can't login)
3. Player.isActive → false (hidden from site)
4. Recruiter.isActive → false (hidden from site)
5. Profile invisible but data preserved
6. Can be reactivated by admin

### Deletion Flow
1. User requests permanent deletion
2. All related data deleted (videos, chats, etc.)
3. Player/Recruiter profile deleted
4. User account deleted
5. All data permanently removed from database

## 🎯 Testing Checklist

- [x] New user registration creates proper User-Player link
- [x] Profile editing updates user name automatically
- [x] Deactivated accounts hidden from player listings
- [x] Deactivated accounts hidden from recruiter listings
- [x] Deactivated accounts hidden from club player lists
- [x] Deactivated users cannot login
- [x] Deleted accounts remove all data from database
- [x] Cascade deletes work properly
- [x] Only active profiles shown on website

## 📝 API Endpoints

### Account Management
- `POST /api/auth/register` - Create new account
- `POST /api/auth/deactivate` - Deactivate account (hide from site)
- `DELETE /api/auth/delete-account` - Permanently delete account

### Profile Management
- `PUT /api/players/[id]` - Update player profile (syncs user name)
- `GET /api/players` - List active players only
- `GET /api/recruiters` - List active recruiters only

## 🚀 Deployment Status

- ✅ Code committed to GitHub
- ✅ Schema changes applied (isActive for Recruiter)
- ✅ Database updated with `prisma db push`
- ✅ Deployed to Vercel production
- ✅ Live at: https://www.habicht-volleyball.ch

## 📚 Files Modified

1. `prisma/schema.prisma` - Added isActive to Recruiter
2. `app/api/players/route.ts` - Filter by isActive
3. `app/api/recruiters/route.ts` - Filter by isActive
4. `app/api/players/[id]/route.ts` - Sync user name on update
5. `app/api/auth/deactivate/route.ts` - Set isActive = false
6. `app/api/auth/delete-account/route.ts` - Already has cascade deletes

---

**Last Updated**: December 19, 2025
**Status**: ✅ Complete, Tested, and Deployed
