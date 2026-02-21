# LearnLoop Email Setup Guide

## Overview

LearnLoop includes beautifully designed HTML email templates for transactional emails. These templates are built with modern design principles and are responsive across all email clients.

## Email Templates

### 1. **Email Verification** (`verify-email.html`)
- **Trigger**: User signs up
- **Purpose**: Confirms email ownership
- **Features**:
  - Direct verification link
  - Backup verification code
  - Security notes
  - 24-hour expiration

### 2. **Welcome Email** (`welcome.html`)
- **Trigger**: Email verified successfully
- **Purpose**: Onboards new users
- **Features**:
  - Personalized greeting
  - Feature overview with icons
  - Getting started tips
  - Links to dashboard and help center

### 3. **Password Reset** (`reset-password.html`)
- **Trigger**: User requests password reset
- **Purpose**: Securely resets password
- **Features**:
  - Reset link
  - Security warning if not requested
  - Step-by-step instructions
  - 1-hour expiration

---

## Setup Instructions

### Step 1: Choose Email Service Provider

Pick one of the following providers:

#### **Option A: Resend (Recommended)**
- Best for developers
- Easy integration
- Free tier available
- Great deliverability

```bash
npm install resend
```

Get API key: [resend.com](https://resend.com)

#### **Option B: SendGrid**
- Enterprise-grade
- Comprehensive features
- Large free tier

```bash
npm install @sendgrid/mail
```

Get API key: [sendgrid.com](https://sendgrid.com)

#### **Option C: Mailgun**
- Developer-friendly
- Good documentation
- Flexible pricing

```bash
npm install mailgun.js
```

Get API key: [mailgun.com](https://mailgun.com)

#### **Option D: Gmail (Testing Only)**
- Use for development/testing
- Not recommended for production
- Requires 2FA app password

### Step 2: Add Environment Variables

Add to `.env.local`:

```env
# Email Service (choose one)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# OR
MAILGUN_API_KEY=key-xxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.learnloop.app

# Email Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FROM_EMAIL=noreply@learnloop.app
NEXT_PUBLIC_FROM_NAME=LearnLoop Team
```

### Step 3: Install Email Service Integration

Choose your provider and add the implementation:

#### **Resend Implementation**

```typescript
// lib/email-providers/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const response = await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_FROM_NAME} <${process.env.NEXT_PUBLIC_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    })
    return { success: true, messageId: response.data?.id }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
```

#### **SendGrid Implementation**

```typescript
// lib/email-providers/sendgrid.ts
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const response = await sgMail.send({
      to,
      from: process.env.NEXT_PUBLIC_FROM_EMAIL!,
      subject,
      html,
      text,
      replyTo: 'support@learnloop.app',
    })
    return { success: true, messageId: response[0].headers['x-message-id'] }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
```

#### **Mailgun Implementation**

```typescript
// lib/email-providers/mailgun.ts
import FormData from 'form-data'
import Mailgun from 'mailgun.js'

const mailgun = new Mailgun(FormData)
const client = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY! })
const mg = client.domains.domain(process.env.MAILGUN_DOMAIN!)

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.NEXT_PUBLIC_FROM_EMAIL!,
      to,
      subject,
      html,
      text,
    })
    return { success: true, messageId: response.id }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}
```

### Step 4: Create Email Sending Utility

```typescript
// app/actions/send-email.ts
'use server'

import EmailService from '@/lib/email-service'
import { sendEmail as sendEmailProvider } from '@/lib/email-providers/resend' // or your chosen provider

export async function sendVerificationEmail(
  email: string,
  verificationLink: string,
  verificationCode: string
) {
  const html = EmailService.generateVerificationEmail(verificationLink, verificationCode)
  const text = EmailService.createPlainTextFallback('verify-email', {
    verification_link: verificationLink,
    verification_code: verificationCode,
  })
  const subject = EmailService.getEmailSubject('verify-email')

  return sendEmailProvider(email, subject, html, text)
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  const html = EmailService.generateWelcomeEmail(userName, dashboardLink)
  const text = EmailService.createPlainTextFallback('welcome', {
    user_name: userName,
    dashboard_link: dashboardLink,
  })
  const subject = EmailService.getEmailSubject('welcome')

  return sendEmailProvider(email, subject, html, text)
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const html = EmailService.generatePasswordResetEmail(resetLink)
  const text = EmailService.createPlainTextFallback('reset-password', {
    reset_link: resetLink,
  })
  const subject = EmailService.getEmailSubject('reset-password')

  return sendEmailProvider(email, subject, html, text)
}
```

### Step 5: Integrate with Supabase Auth

Update your sign-up handler to send verification email:

```typescript
// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { sendVerificationEmail } from './send-email'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string, username: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: '' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) throw error

  // Send verification email
  if (data.user?.email) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${data.session?.access_token}`
    await sendVerificationEmail(data.user.email, verificationLink, '000000')
  }

  redirect('/auth/sign-up-success')
}
```

---

## Email Template Customization

### Modify Templates

Edit HTML files directly:
- `/emails/verify-email.html`
- `/emails/welcome.html`
- `/emails/reset-password.html`

### Update Branding

Replace:
- `LearnLoop` → Your platform name
- Colors (currently: Indigo `#6366f1`, Purple `#8b5cf6`)
- Images and logos
- Copy and messaging

### Add New Template

1. Create new HTML file in `/emails/`
2. Add to `EmailTemplate` type in `lib/email-service.ts`
3. Create generator method in `EmailService` class

---

## Testing Emails Locally

### Option 1: Ethereal Email (Fake SMTP)

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'generated-email@ethereal.email',
    pass: 'generated-password',
  },
})

await transporter.sendMail({
  from: 'test@learnloop.app',
  to: 'test@example.com',
  subject: 'Test Email',
  html: emailHtml,
})
```

### Option 2: Mailhog (Local SMTP Server)

1. Install: `brew install mailhog`
2. Run: `mailhog`
3. Visit: http://localhost:1025 (admin), http://localhost:8025 (web UI)
4. Configure transporter to `smtp://localhost:1025`

### Option 3: Console Output

```typescript
// lib/email-providers/console.ts
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  console.log('=== EMAIL ===')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('HTML:', html)
  console.log('Text:', text)
  console.log('==============')
  return { success: true, messageId: 'test-' + Date.now() }
}
```

---

## Email Delivery Checklist

- [ ] Email service provider account created and API key added
- [ ] Email templates customized with your branding
- [ ] Environment variables configured
- [ ] Email sending functions integrated with auth flows
- [ ] Tested verification email sending
- [ ] Tested welcome email sending
- [ ] Tested password reset email sending
- [ ] Set up email logs/monitoring
- [ ] Added unsubscribe links (GDPR/CAN-SPAM compliance)
- [ ] Configured sender reputation (SPF, DKIM, DMARC)

---

## Production Deployment

### Before Going Live

1. **Verify Email Domain**
   - Add SPF record to DNS
   - Add DKIM record to DNS
   - Add DMARC record to DNS

2. **Test Deliverability**
   - Send test emails to different providers
   - Check spam folder
   - Verify sender reputation

3. **Monitor Bounces**
   - Set up bounce handling
   - Update email list on hard bounces
   - Log soft bounces

4. **Setup Email Logs**
   - Track sent, delivered, bounced, opened
   - Set up alerts for delivery issues

---

## Troubleshooting

### Emails Not Sending
- Check API key is correct
- Verify email domain is whitelisted
- Check rate limits
- Review email provider logs

### Emails Going to Spam
- Verify SPF/DKIM/DMARC records
- Check email content for spam triggers
- Use reputable email service
- Monitor sender reputation score

### Template Variables Not Replaced
- Ensure variable names match exactly (case-sensitive)
- Use correct format: `{{variable_name}}`
- Check EmailService.renderTemplate() method

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)
- [Mailgun Documentation](https://documentation.mailgun.com)
- [Email Standards (RFC 5322)](https://tools.ietf.org/html/rfc5322)
- [MJML Email Framework](https://mjml.io) - Advanced email templating
