# LearnLoop Email Verification Flow

## Overview
The LearnLoop platform uses a comprehensive email verification system with Supabase authentication and Resend email delivery.

## Verification Flow Diagram

```
User Signs Up
    ↓
Supabase creates auth user
    ↓
Resend sends verification email (with link & code)
    ↓
User clicks link in email
    ↓
Redirected to /auth/verify-email
    ↓
Verification page confirms with Supabase
    ↓
Email verified → User can log in
```

## Components

### 1. Sign-Up Page (`/app/auth/sign-up/page.tsx`)
- User provides: email, password, username, full name
- Calls Supabase `signUp()` with email redirect
- Sends verification email via `handleSignUpEmail()`
- Redirects to sign-up success page

### 2. Verification Email (`/emails/verify-email.html`)
- Contains verification link and code
- Gradient header with LearnLoop branding
- Security notes and expiration time
- Responsive design for all email clients

### 3. Auth Callback Route (`/app/auth/callback/route.ts`)
- Handles OAuth/Magic Link callbacks
- Redirects email verification to verify-email page
- Exchanges code for session on successful verification

### 4. Verification Page (`/app/auth/verify-email/page.tsx`)
- Shows loading state while verifying
- Displays success with link to login
- Shows error with retry option
- Uses Supabase `verifyOtp()` method

## Email Sending Actions (`/app/actions/send-emails.ts`)

### `handleSignUpEmail(email, link, code)`
Sends verification email with:
- Personalized greeting
- Clickable verification link
- 6-digit verification code
- Security information

### `handlePasswordResetEmail(email, link)`
Sends password reset email with:
- Reset link (valid for 1 hour)
- Security warnings
- Instructions for password change

### `handleWelcomeEmail(email, name)`
Sends welcome email with:
- Personalized greeting with user's name
- Getting started guide
- Link to dashboard
- Feature highlights

## Verification Links

### Format
```
https://learnloop.app/auth/callback?email={email}&type=email&token={token}
```

### Flow
1. User clicks link in email
2. Redirected to `/auth/callback`
3. Callback extracts email and token
4. Redirects to `/auth/verify-email?email={email}&token={token}`
5. Verification page calls `supabase.auth.verifyOtp()`
6. On success: Shows success screen with login link
7. On error: Shows error screen with retry option

## Security Features

✓ 24-hour email verification expiration
✓ 1-hour password reset expiration
✓ Code not stored in database (Supabase handles it)
✓ User metadata stored securely
✓ RLS policies protect data
✓ HTTPS only links
✓ No sensitive data in URLs (tokens handled by Supabase)

## Testing Verification

### Local Development
1. Start dev server: `pnpm dev`
2. Visit `http://localhost:3000/auth/sign-up`
3. Fill in signup form
4. Check Resend dashboard for sent email
5. Click verification link or use code

### With Resend
- All emails sent through Resend API
- Check email logs in Resend dashboard
- Test with multiple email addresses
- Verify HTML rendering across clients

### Manual Testing
Email Preview Page: `http://localhost:3000/dev/email-preview`
- View email templates
- Test on different screen sizes
- Download HTML for testing

## Redirect URLs

### After Email Verification
- Success → `/dashboard` (after login)
- Error → `/auth/sign-up` (to try again)

### After Password Reset
- Success → `/dashboard`
- Error → `/auth/forgot-password` (to retry)

## Customization

### Change Verification Expiration
Edit in Supabase Authentication Settings:
- Email confirmation window (default: 24 hours)
- Password reset validity (default: 1 hour)

### Customize Email Templates
Edit: `/emails/verify-email.html`, `/emails/reset-password.html`, `/emails/welcome.html`
- Update brand colors
- Modify messaging
- Add company logo

### Change Redirect URLs
Update in `/app/auth/callback/route.ts`:
```typescript
return NextResponse.redirect(new URL('/your-page', request.url))
```

## Troubleshooting

### Email Not Received
- Check Resend API key in environment variables
- Verify sender email is verified in Resend
- Check spam/junk folder
- Check Resend dashboard for delivery errors

### Verification Link Expired
- User needs to request new verification email
- Can be done from sign-up retry page
- Or via password reset for existing users

### Wrong Redirect URL
- Check callback route configuration
- Verify `emailRedirectTo` in sign-up options
- Check environment variables

## Production Deployment

1. Set `RESEND_API_KEY` in production environment variables
2. Update `NEXT_PUBLIC_FROM_EMAIL` to production domain
3. Verify sender email in Resend dashboard
4. Test verification flow in production
5. Monitor email deliverability

## Files Involved
- `/app/auth/sign-up/page.tsx` - Signup UI
- `/app/auth/verify-email/page.tsx` - Verification UI
- `/app/auth/forgot-password/page.tsx` - Password reset
- `/app/auth/callback/route.ts` - OAuth/verification callback
- `/app/actions/send-emails.ts` - Email sending actions
- `/lib/resend-service.ts` - Resend integration
- `/emails/verify-email.html` - Verification email template
- `/emails/reset-password.html` - Reset password template
