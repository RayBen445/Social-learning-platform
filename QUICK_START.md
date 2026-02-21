# LearnLoop - Quick Start Guide

Get LearnLoop up and running in 5 minutes.

## 📋 Quick Checklist

- [ ] Clone/download project
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Create admin & bot accounts
- [ ] Start development server
- [ ] Visit http://localhost:3000

## ⚡ Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Fill in Supabase credentials
# Get these from Supabase Dashboard > Settings > API
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## 🔐 Create System Accounts

```bash
# Generate secure credentials for admin & bot accounts
pnpm run setup-credentials

# Output will show:
# - Bot account: bot@learnloop.app (password shown)
# - Admin account: admin@learnloop.app (password shown)
# - Credentials saved to .admin-credentials.json
```

## 🚀 Start Development

```bash
# Start dev server (hot reload enabled)
pnpm dev

# Open http://localhost:3000 in browser
# Landing page should load
```

## 📝 Create Database Accounts

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Authentication > Users
4. Click "Add user"
5. Create two accounts:
   - **Email:** bot@learnloop.app
   - **Email:** admin@learnloop.app
   - (Use passwords from the setup script)
6. Copy user IDs from the auth table
7. Update `.env.local` with user IDs

## 🧪 Test the Platform

### Sign Up
1. Go to `/auth/sign-up`
2. Enter email and password
3. Verify email (check console in dev mode)
4. Create account

### Create a Post
1. Go to `/dashboard` after login
2. Click "New Post"
3. Write content, select topics
4. Publish

### Interact
1. Vote on posts (upvote/downvote)
2. Add comments
3. Follow users
4. Send messages

## 🔧 Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Optional:**
```env
NEXT_PUBLIC_BOT_EMAIL=bot@learnloop.app
NEXT_PUBLIC_ADMIN_EMAIL=admin@learnloop.app
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_MESSAGING=true
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/auth/` | Authentication pages |
| `app/dashboard/` | Main app dashboard |
| `app/posts/create` | Create new post |
| `lib/animations.ts` | Motion presets |
| `SETUP.md` | Detailed setup guide |
| `ANIMATIONS.md` | Animation guide |
| `DEPLOYMENT.md` | Deployment guide |

## 🎨 Customize

### Change Company Name
Edit `app/about/page.tsx` and `app/page.tsx`:
```tsx
const COMPANY = 'Cool Shot Systems' // Change this
```

### Change Theme Colors
Edit `app/globals.css`:
```css
@theme {
  --color-primary: #3B82F6; /* Change primary color */
}
```

### Add Topics
Edit `scripts/008_seed_admin_bot_users.sql` and add topics before seeding.

## 🐛 Common Issues

### Database Connection Error
- Check SUPABASE_URL and ANON_KEY are correct
- Verify both exist in `.env.local`
- Restart dev server with `Ctrl+C` then `pnpm dev`

### Email Verification Not Working
- In dev mode, emails don't actually send
- Check browser console for email links
- In production, configure SendGrid or Mailgun

### Can't Log In
- Verify you created the account in Supabase Auth
- Ensure email is confirmed
- Check password is correct

### Animations Not Showing
- Verify Framer Motion is installed: `pnpm list framer-motion`
- Check components use `motion.*` from Framer Motion
- Ensure no CSS is overriding animations

## 📱 Test on Mobile

```bash
# See local network IP
ifconfig | grep "inet "

# On mobile, visit:
http://your_computer_ip:3000
```

## 🚢 Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "LearnLoop v1.0"
git push

# Go to vercel.com > New > Import repository
# Add environment variables
# Click Deploy
```

See DEPLOYMENT.md for complete instructions.

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| SETUP.md | Complete setup with screenshots |
| ANIMATIONS.md | Motion design system |
| DEPLOYMENT.md | Production deployment |
| PROJECT_SUMMARY.md | Full feature overview |

## 🆘 Need Help?

1. **Setup Issues** → See SETUP.md
2. **Animation Help** → See ANIMATIONS.md
3. **Deployment** → See DEPLOYMENT.md
4. **Feature Ideas** → See PROJECT_SUMMARY.md
5. **Supabase Help** → [supabase.com/docs](https://supabase.com/docs)
6. **Next.js Help** → [nextjs.org/docs](https://nextjs.org/docs)

## 🎯 Next Steps

1. ✅ Install & setup (you are here)
2. → Test features locally
3. → Customize for your needs
4. → Deploy to Vercel
5. → Launch to users

---

**Ready to go!** 🚀

Start with `pnpm dev` and explore the platform at http://localhost:3000
