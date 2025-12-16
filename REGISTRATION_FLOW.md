# Registration Flow Documentation

## Overview
The registration system has been implemented with a multi-step flow that includes role selection, comprehensive profile creation, and consent/terms agreement.

## Registration Flow

### Step 1: Role Selection (`/auth/register`)
- **Location**: `app/auth/register/page.tsx`
- **Purpose**: User chooses between Player or Recruiter role
- **UI Features**:
  - Two-column card layout with hover effects
  - Player card (red theme) with Trophy icon
  - Recruiter card (blue theme) with Users icon
  - Link to login page for existing users

### Step 2A: Player Registration (`/auth/register/player`)
- **Location**: `app/auth/register/player/page.tsx`
- **Purpose**: Collect comprehensive player information in 3 steps

#### Player Registration Steps:

**Step 1: Account Information**
- Email (required)
- Password (8+ characters, must include number and special character)
- Password confirmation

**Step 2: Player Information**
- Personal Details:
  - First Name, Last Name (required)
  - Profile Image (required)
  - Gender, Nationality (required)
  - Date of Birth, Height, Weight
  - Spike Height, Block Height
  
- Volleyball Information:
  - Positions (multi-select, required - at least one)
  - Skills Self-Assessment (5 ratings):
    - Receiving
    - Serving
    - Attacking
    - Blocking
    - Defense
  
- Media & Social:
  - Instagram, TikTok, YouTube handles
  - Highlight Video upload
  - Swiss Volley License photo (optional)

**Step 3: Achievements & Experience**
- Achievements Section:
  - Free-text area for listing awards, championships, etc.
  
- Club Experience in Switzerland:
  - Add multiple clubs
  - For each club:
    - Club name (required)
    - Club logo upload (optional)
    - Year from / Year to
    - "Currently Playing Here" checkbox
  - Add/Remove clubs dynamically
  
- Looking for Club Toggle:
  - Checkbox to indicate active club search
  - Makes player visible to recruiters

### Step 2B: Recruiter Registration (`/auth/register/recruiter`)
- **Location**: To be implemented
- **Purpose**: Collect recruiter/coach information
- **Planned Fields**:
  - Organization/Club affiliation
  - Role/Position
  - Contact information
  - Looking for Members toggle

### Step 3: Consent & Terms (`/auth/consent`)
- **Location**: `app/auth/consent/page.tsx`
- **Purpose**: Obtain user consent for data processing and terms

#### Required Consents:
1. **Profile Visibility**
   - Allow profile information to be viewed by other users
   - Includes name, photo, stats, skills, club history, achievements

2. **Communication Consent**
   - Allow contact by clubs, coaches, recruiters
   - Through UniSports chat system

3. **Data Processing**
   - GDPR and Swiss Data Protection compliance
   - Processing of personal data, photos, videos, statistics

4. **Terms of Service**
   - Link to full terms document
   - Acceptable use, content guidelines, account responsibilities

5. **Privacy Policy**
   - Link to privacy policy document
   - Data collection, usage, sharing, and protection

#### Features:
- All consents must be checked to proceed
- Visual feedback on consent status
- Links to full terms and privacy documents
- Note about data rights (export, deletion, management)
- Age verification (16+ required)

### Step 4: Profile Created
- **Redirect**: User is redirected to home page (`/`)
- **Status**: Profile fully created with all information

## Database Schema Updates

### Player Model Additions:
- `achievements`: String[] array for achievement list
- `lookingForClub`: Boolean flag for recruitment visibility

### ClubHistory Model Updates:
- `clubId`: Made optional (nullable)
- `clubName`: String for manual club name entry
- `clubLogo`: String for base64/URL of uploaded club logo
- `currentClub`: Boolean flag for active club membership
- `league`: Made optional

### Recruiter Model Additions:
- `lookingForMembers`: Boolean flag for active recruiting status

## API Updates

### Registration Endpoint (`/api/auth/register`)
- **Location**: `app/api/auth/register/route.ts`
- **Enhanced Features**:
  - Handles new player fields (achievements, lookingForClub)
  - Creates club history entries with logos
  - Supports positions array
  - Stores all skill ratings and social media
  - Proper date handling for club history (year to Date conversion)

## File Structure
```
app/
  auth/
    register/
      page.tsx                    # Role selection
      player/
        page.tsx                  # Player registration (3 steps)
      recruiter/
        page.tsx                  # Recruiter registration (to be implemented)
    consent/
      page.tsx                    # Consent & terms page
    login/
      page.tsx                    # Login page
```

## Technologies Used
- **Frontend**: React 18, Next.js 14.2.35, TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: lucide-react
- **Database**: Prisma ORM with Neon PostgreSQL
- **Authentication**: bcryptjs for password hashing

## Components Used
- `ImageUpload`: Profile images, club logos, license photos
- `VideoUpload`: Highlight video upload (50MB limit)
- `StarRating`: 5-star skill assessment

## Form Validation
- Password strength: 8+ chars, number, special character
- Required fields: Email, password, profile image, gender, nationality, positions
- Position selection: At least one required
- Consent: All checkboxes must be checked

## Next Steps
1. ✅ Role selection page - COMPLETED
2. ✅ Player registration with all features - COMPLETED
3. ✅ Consent/terms page - COMPLETED
4. ✅ Database schema updates - COMPLETED
5. ✅ API updates for new fields - COMPLETED
6. ⏳ Recruiter registration page - PENDING
7. ⏳ Terms of Service page (`/terms`) - PENDING
8. ⏳ Privacy Policy page (`/privacy`) - PENDING
9. ⏳ Test complete registration flow - PENDING

## Testing Checklist
- [ ] Navigate to `/auth/register`
- [ ] Click Player card, verify redirect to `/auth/register/player`
- [ ] Complete Step 1 (Account Info), test password validation
- [ ] Complete Step 2 (Player Info), test all fields and validations
- [ ] Complete Step 3 (Achievements & Experience):
  - [ ] Add achievements text
  - [ ] Add club with logo upload
  - [ ] Add multiple clubs
  - [ ] Remove club
  - [ ] Toggle "Currently Playing Here"
  - [ ] Toggle "Looking For Club"
- [ ] Submit registration, verify redirect to `/auth/consent`
- [ ] Check all consent checkboxes
- [ ] Submit consent, verify redirect to home page
- [ ] Verify user created in database with all fields
- [ ] Verify club history records created with logos

## Notes
- All text is in English (proper capitalization)
- Dark mode fully supported throughout
- Responsive design with mobile considerations
- Loading states during API calls
- Error handling with user-friendly messages
- Back navigation between steps
- Step progress indicator (Step X of 3)
