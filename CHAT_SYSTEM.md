# Chat System Implementation Summary

## Overview
Complete chat system allowing coaches/recruiters to communicate with players. Recruiters MUST be associated with a club as a coach.

## Database Changes (Prisma Schema)

### New Enums
- `MessageStatus`: SENT, DELIVERED, READ
- `ChatRequestStatus`: PENDING, ACCEPTED, REJECTED

### Updated Models

**Recruiter Model** - Now requires club association:
- Added: `clubId` (required) - Must be associated with a club
- Added: `coachRole` - Head Coach, Assistant Coach, Scout, etc.
- Added: `canChat` - Permission to chat with players
- Added: `bio` - Coach biography

**Player Model** - Added chat relations:
- `chatRequests` - Requests sent to coaches
- `conversations` - Active conversations
- `sentMessages` - Messages sent by player

### New Models

**ChatRequest**:
- Player initiates request to coach
- Contains initial message
- Status: PENDING, ACCEPTED, REJECTED
- Once accepted, creates Conversation

**Conversation**:
- Links one player with one recruiter
- `isActive` - Can be closed
- `lastMessageAt` - For sorting

**Message**:
- Belongs to conversation
- Can be sent by PLAYER or RECRUITER
- Status tracking (SENT → DELIVERED → READ)
- Timestamp and read receipts

## Components Created

### 1. ChatWindow (`components/chat/ChatWindow.tsx`)
Full-featured chat interface:
- Real-time message display
- Auto-refresh (polls every 3 seconds)
- Read receipts (✓ sent, ✓✓ delivered, ✓✓ blue read)
- Timestamp display
- Send messages
- Scrolls to bottom automatically
- Modern WhatsApp-like design

### 2. RequestChatButton (`components/chat/RequestChatButton.tsx`)
For players to request contact with coaches:
- Modal with coach info
- Text area for initial message
- Success/error handling
- Professional design

## API Routes Created

### `/api/chat/requests`
**POST** - Create chat request (Player → Coach)
- Validates player ownership
- Checks for duplicate requests
- Creates ChatRequest record

**GET** - Get all requests
- For Players: Returns sent requests
- For Recruiters: Returns received requests
- Includes full participant details

### `/api/chat/requests/[id]`
**PATCH** - Accept or reject request (Coach only)
- Updates request status
- If ACCEPTED: Creates Conversation + initial Message
- Returns conversation ID

### `/api/chat/conversations` (TO BE CREATED)
**GET** - Get all conversations for current user
- Returns active chats with last message
- For both players and recruiters

### `/api/chat/conversations/[id]/messages` (TO BE CREATED)
**GET** - Get all messages in conversation
- Ordered by timestamp
- Marks messages as delivered

**POST** - Send new message
- Creates message record
- Updates conversation lastMessageAt

### `/api/chat/conversations/[id]/read` (TO BE CREATED)
**PATCH** - Mark messages as read
- Updates status to READ
- Sets readAt timestamp

## Clubs Database

Created comprehensive Swiss clubs database (`lib/clubsDatabase.ts`):
- **NLA Men**: 12 clubs (Näfels, Schönenwerd, Chênois, Amriswil, etc.)
- **NLA Women**: 10 clubs (Sm'Aesch, NUC, Volero Zürich, etc.)
- **NLB Men**: Starting list (Möhlin, Steinhausen, Volley Bern, etc.)
- Will expand to all 368 clubs

Each club includes:
- Name, short name, league, gender
- Canton, city
- Website URL
- Team colors
- Logo emoji
- Founded year

## Registration Updates Needed

### Recruiter Registration
Must now include:
1. Select club from dropdown (all 368 clubs)
2. Specify coach role (Head Coach, Assistant, Scout, etc.)
3. Phone number (for verification)
4. Bio/experience

### Player Registration
Already includes all necessary fields.

## Next Steps

1. Create remaining API routes for conversations/messages
2. Add chat interface to player profiles
3. Add chat requests dashboard for recruiters
4. Add notifications for new messages
5. Expand clubs database to all 368 clubs
6. Update recruiter registration form
7. Add chat list view (inbox)

## Usage Flow

### Player Perspective:
1. Browse player profiles or clubs
2. See coaches list for clubs
3. Click "Kontakt aufnehmen" (Request Contact)
4. Write initial message explaining interest
5. Wait for coach to accept
6. Once accepted, chat opens
7. Communicate directly with coach

### Coach Perspective:
1. Register as recruiter (must select club + role)
2. Receive chat requests from players
3. Review player profile + initial message
4. Accept or reject request
5. If accepted, chat opens automatically
6. Communicate with interested players

## Security Features
- Authentication required for all endpoints
- Players can only request for their own account
- Coaches can only respond to requests for them
- Conversations are private (only 2 participants)
- Messages can't be edited/deleted (audit trail)

## UI Features
- Modern WhatsApp-style interface
- Real-time updates
- Read receipts
- Typing indicators (future)
- Push notifications (future)
- Mobile responsive
