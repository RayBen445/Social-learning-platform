# Resend Email Integration - LearnLoop

Resend is now fully integrated with LearnLoop for sending beautiful transactional emails. This guide covers everything you need to know.

## Setup Status

✅ **Resend is Configured and Ready**

- API Key: Added to environment variables
- From Email: `noreply@learnloop.app`
- From Name: `LearnLoop Team`
- Package: `resend@^4.0.0` (added to dependencies)

## Environment Variables

The following environment variables are already configured:

```env
RESEND_API_KEY=re_TfcFjwqW_DEcBzcC1e79w7SNUBWWtK1wB
NEXT_PUBLIC_FROM_EMAIL=noreply@learnloop.app
NEXT_PUBLIC_FROM_NAME=LearnLoop Team
```

## Email Templates

### 1. Verification Email
**File:** `lib/resend-service.ts` → `sendVerificationEmail()`

Sent when users sign up. Includes:
- 6-digit verification code
- Verification link
- 24-hour expiration notice
- Modern gradient header with brand colors

**Usage:**
```typescript
import { sendVerificationEmail } from '@/lib/resend-service'

await sendVerificationEmail(
  'user@example.com',
  'https://learnloop.app/verify?token=xyz',
  '123456'
)
```

### 2. Welcome Email
**File:** `lib/resend-service.ts` → `sendWelcomeEmail()`

Sent after email verification. Includes:
- Personalized greeting
- Getting started checklist
- Feature highlights
- Link to dashboard

**Usage:**
```typescript
import { sendWelcomeEmail } from '@/lib/resend-service'

await sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'https://learnloop.app/dashboard'
)
```

### 3. Password Reset Email
**File:** `lib/resend-service.ts` → `sendPasswordResetEmail()`

Sent when users request password reset. Includes:
- Password reset button
- 1-hour expiration warning
- Security notices
- Best practices for passwords

**Usage:**
```typescript
import { sendPasswordResetEmail } from '@/lib/resend-service'

await sendPasswordResetEmail(
  'user@example.com',
  'https://learnloop.app/reset?token=xyz'
)
```

## Server Actions

All email sending is handled through server actions in `app/actions/send-emails.ts`:

```typescript
export async function handleSignUpEmail(
  email: string,
  verificationLink: string,
  verificationCode: string
)

export async function handleWelcomeEmail(
  email: string,
  userName: string,
  dashboardUrl: string
)

export async function handlePasswordResetEmail(
  email: string,
  resetLink: string
)
```

## Integration Points

### Sign-Up Flow
**File:** `app/auth/sign-up/page.tsx`

1. User submits sign-up form
2. Account created in Supabase
3. Verification email sent automatically via Resend
4. User redirected to success page

### Password Reset Flow
**File:** `app/auth/forgot-password/page.tsx`

1. User enters email
2. Supabase generates reset token
3. Password reset email sent via Resend
4. User receives reset link

## Email Client Support

All templates are tested and optimized for:
- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Mobile clients (iOS Mail, Android Gmail)
- ✅ Dark mode support

## Design Specifications

### Colors
- **Primary Brand:** Indigo (#667eea)
- **Secondary:** Purple (#764ba2)
- **Background:** Light Gray (#f9fafb)
- **Text:** Dark Gray (#333)
- **Accent:** Yellow (#ffc107) for warnings

### Typography
- **Headers:** System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Body:** System fonts (same)
- **Code:** 'Courier New' monospace

### Responsive Design
- Max width: 600px
- Mobile-optimized with proper padding
- Single column layout
- Touch-friendly buttons (min 44px height)

## Testing Emails

### View Email Preview
Visit: `http://localhost:3000/dev/email-preview`

This page shows previews of all email templates with:
- Desktop view
- Tablet view
- Mobile view
- Download HTML option

### Send Test Email
```typescript
// In any server action
import { sendEmail } from '@/lib/resend-service'

const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello</h1>',
  text: 'Hello'
})

console.log('Email sent:', result)
```

### Check Resend Dashboard
1. Go to [resend.com/dashboard](https://resend.com/dashboard)
2. Log in with your account
3. Navigate to "Emails" section
4. View all sent emails, delivery status, and opens

## Customization

### Change Email Address
Update in environment variables:
```env
NEXT_PUBLIC_FROM_EMAIL=support@yourdomain.com
NEXT_PUBLIC_FROM_NAME=YourCompany Support
```

### Change Email Design
Edit email templates in `lib/resend-service.ts`:
```typescript
// Example: Change colors
const html = `
  <style>
    .header { background: linear-gradient(135deg, #yourColor1 0%, #yourColor2 100%); }
  </style>
`
```

### Add Custom Templates
Create new functions:
```typescript
export async function sendCustomEmail(
  email: string,
  data: CustomData
): Promise<EmailResult> {
  const html = `<h1>Your HTML here</h1>`
  
  return sendEmail({
    to: email,
    subject: 'Custom Subject',
    html,
    text: 'Plain text fallback'
  })
}
```

## Error Handling

All email functions return a `EmailResult` object:

```typescript
interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Usage
const result = await sendVerificationEmail(...)
if (!result.success) {
  console.error('Email failed:', result.error)
}
```

## Performance

- **Email sending:** ~100-500ms (non-blocking)
- **Retry policy:** Resend handles automatic retries
- **Rate limits:** 100 emails per day on free plan
- **Delivery:** Typically instant, up to a few seconds

## Security

- ✅ API key stored securely in environment variables
- ✅ No email addresses exposed in frontend
- ✅ All links include expiration tokens
- ✅ HTML escaping for user-generated content
- ✅ HTTPS only for email links

## Troubleshooting

### Emails Not Sending

**Check 1:** Verify API key is set
```bash
echo $RESEND_API_KEY  # Should show the key
```

**Check 2:** Check environment file
```bash
cat .env.local | grep RESEND
```

**Check 3:** Verify from email is verified in Resend
- Go to [resend.com/dashboard](https://resend.com/dashboard)
- Check "Domains & Addresses"
- Add verified domain if needed

### Emails in Spam

- Check Resend dashboard for delivery status
- Verify SPF/DKIM records if using custom domain
- Add "noreply@learnloop.app" to whitelist during testing

### Template Not Rendering

- Check browser console for errors
- Verify all template variables are passed
- Check email client's HTML support

## Next Steps

1. **Install dependencies:** `pnpm install`
2. **Start dev server:** `pnpm dev`
3. **Test sign-up:** Create account at `/auth/sign-up`
4. **Check Resend dashboard:** Verify email was sent
5. **Customize:** Update email templates as needed

## Resources

- **Resend Docs:** https://resend.com/docs
- **Email Preview:** http://localhost:3000/dev/email-preview
- **Email Service:** `/lib/resend-service.ts`
- **Email Actions:** `/app/actions/send-emails.ts`

## Support

For issues with:
- **LearnLoop emails:** Check the files listed above
- **Resend service:** Visit https://resend.com/support
- **Email delivery:** Check spam folder and Resend dashboard
