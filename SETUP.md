# LearnLoop Setup Guide

Welcome to LearnLoop, a modern social learning platform for students to engage, create, and share educational content.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier available)
- pnpm package manager (or npm/yarn)

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env.local

# Update .env.local with your Supabase credentials
# See Supabase Dashboard > Settings > API
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Setup

The database schema has already been created with migrations. To verify:

1. Go to Supabase Dashboard > SQL Editor
2. Check that these tables exist:
   - `profiles`, `topics`, `posts`, `comments`
   - `post_votes`, `comment_votes`, `bookmarks`
   - `follows`, `topic_subscriptions`, `reshares`
   - `notifications`, `direct_messages`
   - `achievements`, `user_achievements`, `leaderboards`, `activity_streaks`
   - `collections`, `series`, `post_tags`, `mentions`
   - `blocked_users`, `reports`, `muted_topics`, `muted_users`

### 5. Create Admin & Bot Accounts

#### Step 1: Generate Secure Credentials

```bash
node scripts/setup-admin-bot.js
```

This will:
- Generate secure passwords for bot and admin accounts
- Display credentials and instructions
- Save credentials to `.admin-credentials.json` (restricted access)

#### Step 2: Create Accounts in Supabase

1. Open Supabase Dashboard > Authentication > Users
2. Click "Add user" button
3. Create BOT account:
   - Email: `bot@learnloop.app`
   - Password: (from generated credentials above)
   - Auto Confirm: Enable
4. Create ADMIN account:
   - Email: `admin@learnloop.app`
   - Password: (from generated credentials above)
   - Auto Confirm: Enable

#### Step 3: Get User IDs

1. In Supabase Dashboard > Authentication > Users
2. Copy the User ID (UUID) for both accounts
3. Update `scripts/008_seed_admin_bot_users.sql`:
   - Replace `00000000-0000-0000-0000-000000000001` with bot user ID
   - Replace `00000000-0000-0000-0000-000000000002` with admin user ID

#### Step 4: Run Seeding Migration

1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy contents of `scripts/008_seed_admin_bot_users.sql`
4. Run the query
5. Verify profiles were created

#### Step 5: Store Credentials Securely

```bash
# Copy credentials to your password manager or environment variables
cat .admin-credentials.json

# Then add to your deployment platform (Vercel, etc.):
# Settings > Environment Variables:
NEXT_PUBLIC_BOT_EMAIL=bot@learnloop.app
BOT_PASSWORD=[generated password]
NEXT_PUBLIC_ADMIN_EMAIL=admin@learnloop.app
ADMIN_PASSWORD=[generated password]
```

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Account Details

After setup, you'll have three types of accounts:

### Bot Account
- **Email:** `bot@learnloop.app`
- **Password:** [Generated - see `.admin-credentials.json`]
- **Role:** System bot for automated tasks
- **Uses:** Announcements, automated moderation, scheduled notifications
- **Badge:** Bot verification badge

### Admin Account
- **Email:** `admin@learnloop.app`
- **Password:** [Generated - see `.admin-credentials.json`]
- **Role:** Platform administrator
- **Uses:** Content moderation, user management, system settings
- **Badge:** System verification badge

### User Accounts
- Create via the Sign Up page: [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up)
- Email verification required
- Standard user verification badge when appropriate

## 🔐 Security Best Practices

1. **Change Default Passwords:** After setup, change admin and bot passwords immediately
2. **Secure Credentials:** Keep `.admin-credentials.json` safe
   - Add to `.gitignore` (already done)
   - Never commit to version control
   - Store in secure password manager
3. **Environment Variables:** Use your deployment platform's secrets management
   - Vercel: Settings > Environment Variables
   - Never expose in client-side code (use `NEXT_PUBLIC_` prefix carefully)
4. **RLS Policies:** All tables use Row Level Security
   - Verified in Supabase > Database > Policies
   - Ensure users can only access their own data
5. **Email Verification:** Required for new signups
   - Configure email settings in Supabase > Authentication > Email Templates

## 📚 Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── auth/              # Authentication pages (login, signup, password reset)
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profiles and followers/following
│   ├── posts/             # Post creation and detail views
│   ├── notifications/     # Notifications page
│   ├── messages/          # Direct messaging
│   ├── achievements/      # Achievements and badges
│   ├── leaderboard/       # Reputation leaderboards
│   ├── search/            # Search and discovery
│   ├── explore/           # Trending content
│   ├── settings/          # User settings and privacy
│   ├── admin/             # Admin moderation dashboard
│   ├── legal/             # Terms, Privacy, etc.
│   └── help/              # FAQ and support
├── components/
│   ├── posts/             # Post-related components
│   ├── users/             # User-related components
│   ├── messages/          # Messaging components
│   ├── notifications/     # Notification components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client setup
│   └── utils.ts           # Utility functions
├── scripts/
│   ├── 001-007_*.sql      # Database migrations
│   ├── 008_seed_*.sql     # Admin/bot seeding
│   └── setup-admin-bot.js # Credential generator
└── middleware.ts          # Next.js middleware for auth
```

## 🎯 Key Features

### Core Features
- ✅ User authentication with email verification
- ✅ User profiles with reputation tracking
- ✅ Post creation and management
- ✅ Comments with nested threading
- ✅ Voting system (upvote/downvote)
- ✅ Bookmarking and sharing
- ✅ Real-time notifications
- ✅ Direct messaging

### Community Features
- ✅ Follow system (users and topics)
- ✅ Personalized feed algorithm
- ✅ Trending topics and content
- ✅ User discovery and recommendations
- ✅ Full-text search

### Gamification
- ✅ Reputation points
- ✅ Achievements and badges
- ✅ Leaderboards (weekly, monthly, all-time)
- ✅ Activity streaks
- ✅ User verification system

### Safety & Moderation
- ✅ Content reporting system
- ✅ User blocking and muting
- ✅ Privacy settings
- ✅ Admin moderation dashboard
- ✅ Role-based access control

### Legal & Transparency
- ✅ Terms of Service
- ✅ Privacy Policy
- ✅ Code of Conduct
- ✅ DMCA Policy
- ✅ Cookie Policy
- ✅ About Us page
- ✅ Help & FAQ

## 🛠️ Customization

### Update Company Information

Edit `/app/about/page.tsx`:
```tsx
const COMPANY_INFO = {
  name: 'Cool Shot Systems',
  founded: '2024',
  mission: 'Empower students to learn collaboratively',
  // ... update other fields
}
```

### Customize Topics

Add default topics in `scripts/008_seed_admin_bot_users.sql`:
```sql
INSERT INTO public.topics VALUES (
  'Your Topic',
  'your-topic-slug',
  'Description',
  '#COLOR',
  admin_user_id
)
```

### Configure Email Verification

In Supabase Dashboard > Authentication > Email Templates:
- Update sender email
- Customize verification email content
- Set redirect URL for email confirmation

## 🚢 Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Import in Vercel Dashboard
# Add environment variables in Vercel Settings
# Deploy automatically on push
```

### Production Checklist

- [ ] Update company information
- [ ] Configure custom domain
- [ ] Set up email sending (SendGrid, Mailgun, etc.)
- [ ] Enable HTTPS
- [ ] Configure CORS for API
- [ ] Set up monitoring and logging
- [ ] Enable backup strategies
- [ ] Configure analytics
- [ ] Review RLS policies for security
- [ ] Set up CI/CD pipeline

## 📞 Support

For issues or questions:
1. Check Help & FAQ: `/help`
2. Review Supabase docs: [supabase.com/docs](https://supabase.com/docs)
3. Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)

## 📄 License

Copyright © 2024 Cool Shot Systems. All rights reserved.

---

**Created with ❤️ for students by Cool Shot Systems**
