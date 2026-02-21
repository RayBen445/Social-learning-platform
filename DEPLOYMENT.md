# LearnLoop Deployment Guide

Complete guide for deploying LearnLoop to production on Vercel.

## Pre-Deployment Checklist

### Environment & Configuration
- [ ] All environment variables configured in Vercel
- [ ] Database URL and keys from Supabase
- [ ] Email service configured (SendGrid, Mailgun, etc.)
- [ ] Custom domain added to Vercel project
- [ ] DNS records updated for custom domain
- [ ] SSL certificate auto-configured (Vercel handles this)

### Admin & Bot Accounts
- [ ] Bot account created in Supabase Auth (bot@learnloop.app)
- [ ] Admin account created in Supabase Auth (admin@learnloop.app)
- [ ] User IDs added to environment variables
- [ ] Profiles created for both accounts via seeding script
- [ ] Verification badges applied correctly
- [ ] Test login with both accounts successful

### Database & Security
- [ ] All migrations executed successfully
- [ ] Row Level Security (RLS) policies verified
- [ ] Database backups configured in Supabase
- [ ] All tables created with correct schemas
- [ ] Indexes created for performance optimization
- [ ] Triggers functioning correctly

### Application Code
- [ ] All dependencies installed (`pnpm install`)
- [ ] Build successful (`pnpm build`)
- [ ] No console errors in development (`pnpm dev`)
- [ ] All pages accessible and functional
- [ ] Forms validation working
- [ ] Authentication flow tested end-to-end
- [ ] Responsive design verified on mobile

### Testing
- [ ] Sign up flow works with email verification
- [ ] Login works with correct credentials
- [ ] Password reset email works
- [ ] Create post and add comments
- [ ] Vote on posts and comments
- [ ] Follow/unfollow users
- [ ] Search and discovery working
- [ ] Notifications triggering correctly
- [ ] Direct messaging functional
- [ ] Admin moderation dashboard accessible

### Legal & Compliance
- [ ] Terms of Service page configured
- [ ] Privacy Policy updated with company info
- [ ] Code of Conduct displayed
- [ ] DMCA policy in place
- [ ] Cookie policy implemented
- [ ] About page with company information
- [ ] Help/FAQ populated with content
- [ ] Footer with legal links configured

### Performance & Monitoring
- [ ] Images optimized (use Next.js Image component)
- [ ] API routes have proper error handling
- [ ] Database queries optimized with indexes
- [ ] Response times acceptable (< 1s)
- [ ] Bundle size analyzed and optimized
- [ ] Lighthouse score acceptable (90+)

## Step-by-Step Deployment

### 1. Prepare Your Supabase Project

```bash
# Make sure all migrations are applied
# 1. Go to Supabase Dashboard > SQL Editor
# 2. Run all migration scripts (001-008)
# 3. Verify all tables and policies exist

# Create admin and bot accounts
node scripts/setup-admin-bot.js
# Follow instructions to create accounts in Supabase

# Seed initial data
# Run scripts/008_seed_admin_bot_users.sql in Supabase SQL Editor
```

### 2. Prepare Environment Variables

Create a `.env.production` file (never commit this):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# System Accounts
NEXT_PUBLIC_BOT_EMAIL=bot@learnloop.app
BOT_PASSWORD=your-bot-password
NEXT_PUBLIC_ADMIN_EMAIL=admin@learnloop.app
ADMIN_PASSWORD=your-admin-password
NEXT_PUBLIC_BOT_USER_ID=bot-user-uuid
NEXT_PUBLIC_ADMIN_USER_ID=admin-user-uuid

# Email (if using external service)
MAIL_API_KEY=your-email-api-key
NEXT_PUBLIC_MAIL_FROM=noreply@learnloop.app

# URLs
NEXT_PUBLIC_PROD_SUPABASE_REDIRECT_URL=https://your-domain.com/auth/callback

# Feature Flags
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_GAMIFICATION=true
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to:
# - Select/create Vercel project
# - Confirm environment variables
# - Deploy production
```

#### Option B: Connect GitHub Repository

```bash
# 1. Push code to GitHub
git add .
git commit -m "Deploy LearnLoop v1.0"
git push origin main

# 2. Go to vercel.com > New Project
# 3. Import your GitHub repository
# 4. Add environment variables
# 5. Click Deploy
```

### 4. Configure Vercel Environment Variables

In Vercel Dashboard > Settings > Environment Variables:

```
✅ Add all variables from .env.production
✅ Mark sensitive values as Sensitive
✅ Set Production environment for all
✅ Ensure BOT_PASSWORD and ADMIN_PASSWORD are marked as Sensitive
```

### 5. Configure Vercel Domains

1. Go to Vercel Project > Domains
2. Add your custom domain
3. Configure DNS:
   - **For subdomain** (www.learnloop.app): Add CNAME record
   - **For root domain** (learnloop.app): Add A record
4. Verify domain ownership

### 6. Configure Email Service

#### Using SendGrid

```bash
# 1. Create SendGrid account
# 2. Generate API key
# 3. Add to Vercel environment variables:
SENDGRID_API_KEY=your-api-key
NEXT_PUBLIC_MAIL_FROM=noreply@learnloop.app

# 4. Verify sender email in SendGrid dashboard
```

#### Using Supabase Auth Email

Supabase includes basic email support:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. Configure sender address
3. Customize email templates
4. Enable SMTP relay if needed

### 7. Test Production Deployment

```bash
# 1. Visit your production URL
https://your-domain.com

# 2. Test core flows:
✓ Sign up new account (verify email)
✓ Log in with credentials
✓ Password reset flow
✓ Create post
✓ Add comment and vote
✓ Follow user
✓ Send message
✓ View notifications

# 3. Test admin functions:
✓ Log in with admin account
✓ Access moderation dashboard
✓ View reports and pending content

# 4. Test bot functions:
✓ Bot profile visible
✓ Bot can create system announcements
✓ Bot badge displays correctly
```

### 8. Monitor Production

#### Vercel Analytics

1. Go to Vercel Dashboard > Analytics
2. Monitor:
   - Response times
   - Error rates
   - Deployment status
   - Traffic patterns

#### Supabase Monitoring

1. Go to Supabase Dashboard > Database
2. Check:
   - Active connections
   - Query performance
   - Storage usage
   - Realtime subscriptions

#### Application Monitoring (Optional)

Add monitoring services:
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Datadog](https://datadoghq.com) - Full monitoring

## Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs in Vercel and Supabase
- [ ] Test all major user flows
- [ ] Verify email notifications working
- [ ] Check site performance with Lighthouse
- [ ] Review server logs for issues

### Week 1
- [ ] Gather user feedback
- [ ] Monitor database performance
- [ ] Check for security vulnerabilities
- [ ] Update legal pages with production URLs
- [ ] Configure analytics (Google Analytics, Mixpanel, etc.)

### Month 1
- [ ] Review usage metrics
- [ ] Optimize database queries based on usage
- [ ] Configure automated backups
- [ ] Plan marketing launch
- [ ] Set up community guidelines enforcement
- [ ] Configure automated alerts for errors

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename = 'posts';
```

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image'

// ✅ Optimized
<Image src="/logo.png" alt="Logo" width={200} height={200} />

// ❌ Unoptimized
<img src="/logo.png" alt="Logo" />
```

### Bundle Size

```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer

# Build and analyze
npm run build
```

## Scaling Considerations

### When to Scale Up

Scale Supabase when you see:
- Response times > 200ms
- Database CPU > 80%
- Storage nearing limits
- Concurrent connections high

```bash
# Upgrade Supabase plan in Settings > Billing
# Select Pro or Enterprise plan
```

### Caching Strategy

Implement caching:

```tsx
// Cache API responses
export const revalidate = 60 // 60 seconds

async function getPosts() {
  const res = await fetch('...', {
    next: { revalidate: 60 }
  })
  return res.json()
}
```

### Database Optimization

- Use Connection Pooling (Vercel postgres-pooler)
- Add indexes to frequently queried columns
- Archive old data (notifications older than 30 days)
- Implement pagination for large datasets

## Rollback Procedure

If issues occur after deployment:

### Rollback on Vercel

```bash
# 1. Go to Vercel Dashboard > Deployments
# 2. Find the previous stable deployment
# 3. Click "..." > "Promote to Production"
# 4. Verify rollback successful

# Or via CLI:
vercel rollback
```

### Rollback Supabase Database

```bash
# 1. Go to Supabase Dashboard > Database
# 2. Create backup before major changes
# 3. If needed, restore from backup point

# Keep migrations in version control:
git log scripts/
git checkout [previous-commit] -- scripts/
```

## Security Checklist

- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS properly configured
- [ ] Rate limiting on API endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] CSRF protection enabled
- [ ] Secrets in environment variables (never in code)
- [ ] API keys rotated annually
- [ ] Database backups encrypted
- [ ] User passwords hashed (Supabase handles this)
- [ ] 2FA available for admin accounts

## Support & Troubleshooting

### Common Issues

**503 Service Unavailable**
- Check Vercel deployment status
- Verify database connection
- Check environment variables

**Database Connection Error**
- Verify SUPABASE_URL and keys
- Check IP whitelist if applicable
- Restart Supabase instance

**Email Not Sending**
- Verify email service credentials
- Check sender email is verified
- Review email logs in SendGrid/Mailgun

**Authentication Issues**
- Clear browser cookies
- Verify email confirmed in auth.users
- Check JWT token expiration

### Getting Help

1. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
2. **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
3. **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
4. **LearnLoop GitHub**: [Create an issue](https://github.com/learnloop)

---

**Deployment Version:** 1.0  
**Last Updated:** 2024  
**Maintained by:** Cool Shot Systems
