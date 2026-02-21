# LearnLoop Email Design System

## Design Philosophy

The LearnLoop email templates follow a modern, minimal aesthetic with strategic use of brand colors to create professional, approachable, and effective transactional emails.

---

## Design Specifications

### Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Primary | `#6366f1` (Indigo) | Buttons, links, accents |
| Secondary | `#8b5cf6` (Purple) | Header gradients |
| Success | `#10b981` (Emerald) | Positive actions, checkmarks |
| Warning | `#f59e0b` (Amber) | Cautions, important notes |
| Danger | `#dc2626` (Red) | Critical alerts, warnings |
| Background | `#f8f9fa` | Email body background |
| Dark | `#1f2937` (Gray-800) | Headings, primary text |
| Medium | `#6b7280` (Gray-600) | Body text, descriptions |
| Light | `#f3f4f6` (Gray-100) | Backgrounds, dividers |

### Typography

```
Headings:     -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
Body Text:    -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
Monospace:    Courier New (for codes)

Font Weights:
  Logo:       700 (bold)
  Headings:   600-700 (semibold to bold)
  Body:       400 (regular)
  Code:       700 (bold) for emphasis
```

### Sizing Guidelines

```
Logo:              28px
Main Heading:      24px (greeting in verify/reset), 28px (welcome)
Subheading:        16px
Body Text:         16px
Small Text:        14px
Extra Small:       12px
```

### Spacing

```
Header Padding:    40px vertical, 20px horizontal
Content Padding:   40px vertical, 20px horizontal
Section Spacing:   24-32px between sections
Element Spacing:   12-16px between elements
Button Padding:    14px vertical, 32px horizontal
```

---

## Template Components

### 1. Email Verification Template

**Purpose**: Confirm user email address during signup

**Key Sections**:
- **Header**: LearnLoop logo with gradient background
- **Greeting**: "Verify Your Email Address"
- **Introductory Copy**: Welcome message
- **Primary CTA**: "Verify Email" button
- **Fallback Code**: Manual verification code
- **Security Note**: Green callout box with security information
- **Expiration Notice**: Red text warning about 24-hour expiration
- **Footer**: Links and legal text

**Design Features**:
- Gradient header (Indigo to Purple)
- Large, easy-to-read verification code
- Security-focused messaging
- Clear expiration timeline
- Professional, trustworthy appearance

### 2. Welcome Email Template

**Purpose**: Onboard new users after email verification

**Key Sections**:
- **Header**: Logo with tagline "Where Learning Happens Together"
- **Greeting**: Personalized welcome
- **Introduction**: Value proposition
- **Features**: 3-column feature showcase with icons
- **Primary CTA**: "Go to Dashboard" button
- **Tips Section**: Getting started checklist
- **Support Text**: Links to help center
- **Footer**: Legal links

**Design Features**:
- Feature icons with color-coded backgrounds
- Action-oriented messaging
- Multiple engagement opportunities
- Positive, encouraging tone
- Clear next steps

### 3. Password Reset Template

**Purpose**: Securely guide user through password reset

**Key Sections**:
- **Header**: LearnLoop logo
- **Greeting**: "Reset Your Password"
- **Description**: Context for the request
- **Primary CTA**: "Reset Password" button
- **Warning Box**: Red callout for unauthorized resets
- **Steps Section**: Green callout with numbered instructions
- **Expiration Notice**: Yellow callout with time limit
- **Security Tip**: Password security best practices
- **Footer**: Support links

**Design Features**:
- Multiple security callouts
- Step-by-step guidance
- Clear expiration time (1 hour)
- Professional security messaging
- Warning for unauthorized access

---

## Responsive Design

All templates are fully responsive and tested on:

### Email Clients
- Gmail (Web, Mobile)
- Outlook (Web, Desktop, Mobile)
- Apple Mail (macOS, iOS)
- Thunderbird
- Yahoo Mail
- AOL Mail

### Responsive Breakpoints
```
Desktop:  600px (max-width for containers)
Tablet:   100% (full-width with padding)
Mobile:   320px - 480px (full-width, adjusted padding)
```

### Mobile Optimizations
- Font sizes adjusted for readability
- Padding reduced on mobile
- Single-column layouts
- Touch-friendly button sizes (minimum 44x44px)
- Text balancing for better readability

---

## Accessibility

### WCAG 2.1 Compliance

- **Color Contrast**: All text meets AA standards (4.5:1 minimum)
- **Focus States**: Interactive elements have clear focus indicators
- **Alt Text**: All images have descriptive alt text
- **Semantic HTML**: Proper heading hierarchy (h1, h2, h3)
- **Code Readability**: Monospace font for verification codes

### Email Client Support

- Works without CSS support
- Fallback fonts specified
- Images optional (readable without)
- Links properly formatted

---

## Customization Guide

### Update Logo

Replace in all templates:
```html
<div class="logo">LearnLoop</div>
```

With:
```html
<img src="https://your-domain.com/logo.png" alt="Your Company" style="width: 150px; height: auto;">
```

### Update Colors

Find and replace:
```
#6366f1  → Your primary color
#8b5cf6  → Your secondary color
#10b981  → Your success color
#f59e0b  → Your warning color
```

### Update Company Name

Replace:
```
Cool Shot Systems → Your Company Name
LearnLoop → Your Platform Name
```

### Update Links

Replace template variables:
```
{{verification_link}}     → Full verification link
{{reset_link}}           → Full password reset link
{{dashboard_link}}       → Dashboard URL
{{help_link}}           → Help center URL
{{privacy_link}}        → Privacy policy URL
{{support_link}}        → Support URL
```

### Add Images

```html
<img 
  src="{{image_url}}" 
  alt="Description" 
  style="max-width: 100%; height: auto; display: block; border-radius: 8px;"
/>
```

---

## Animation Considerations

Email templates do NOT include animations because:
1. **Email Client Support**: Most email clients don't support CSS animations
2. **Compatibility**: May cause rendering issues
3. **Professional Appearance**: Subtle, non-animated design is more trustworthy

If you need animations, consider:
- Using AMP for Email (limited support)
- Adding animated GIFs instead
- Creating follow-up emails with dynamic content

---

## Performance & Best Practices

### File Size
- Target: < 50KB per email
- Current: ~15-20KB per template
- All styles are inline (mobile-friendly)

### Loading Time
- All CSS is inline (no external stylesheets)
- No JavaScript (not supported in email)
- Images should be optimized (<100KB total)

### Deliverability
- Plain text alternative provided
- No suspicious links or formatting
- Proper sender identification
- Authentication (SPF, DKIM, DMARC)

---

## Testing Checklist

Before sending emails to users:

- [ ] Test in Gmail (Web and Mobile)
- [ ] Test in Outlook (Web and Desktop)
- [ ] Test in Apple Mail
- [ ] Test on mobile devices
- [ ] Verify all links work
- [ ] Check images load correctly
- [ ] Verify personalization variables
- [ ] Test dark mode compatibility
- [ ] Check spam folder (shouldn't land there)
- [ ] Verify plain text version readability

---

## Email Client Support Matrix

| Feature | Gmail | Outlook | Apple | Yahoo |
|---------|-------|---------|-------|-------|
| Inline CSS | ✅ | ✅ | ✅ | ✅ |
| Background Images | ⚠️ | ❌ | ✅ | ✅ |
| Gradients | ✅ | ⚠️ | ✅ | ✅ |
| Border Radius | ✅ | ⚠️ | ✅ | ✅ |
| Animations | ❌ | ❌ | ❌ | ❌ |
| Media Queries | ✅ | ❌ | ✅ | ✅ |
| Web Fonts | ⚠️ | ❌ | ✅ | ❌ |

---

## Brand Guidelines

### LearnLoop Email Standards

1. **Always Include**:
   - Company name (Cool Shot Systems or LearnLoop)
   - Support contact information
   - Unsubscribe link
   - Privacy policy link

2. **Tone of Voice**:
   - Friendly and approachable
   - Clear and direct
   - Action-oriented
   - Professional

3. **Content Guidelines**:
   - Keep subject lines under 50 characters
   - Use active voice
   - Include clear call-to-actions
   - Personalize when possible

4. **Visual Consistency**:
   - Use brand colors consistently
   - Maintain typography hierarchy
   - Use consistent spacing
   - Include company branding (logo, name)

---

## Resources

- [Email Client CSS Support](https://www.campaignmonitor.com/css/)
- [Email on Acid - Testing](https://www.emailonacid.com/)
- [MJML Framework](https://mjml.io/) - Advanced email templating
- [Figma Email Templates](https://www.figma.com/search?model_type=files&q=email%20template) - Design templates
- [Email Accessibility](https://www.emailstandards.org/)

---

## Questions?

For more information about email setup and integration, see `EMAIL_SETUP.md`
