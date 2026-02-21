'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">← Back</Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">We collect information you provide directly such as account details, profile information, posts, comments, and messages. We also automatically collect usage data including IP addresses, browser information, and activity logs.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use your information to provide and improve LearnLoop, personalize your experience, send notifications, enforce our policies, and protect against fraud and abuse.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
            <p className="text-muted-foreground">We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is completely secure.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">4. User Rights (GDPR/CCPA)</h2>
            <p className="text-muted-foreground">You have the right to access, modify, or delete your personal data. You can exercise these rights through your account settings or by contacting us directly.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services</h2>
            <p className="text-muted-foreground">LearnLoop uses Supabase for backend services. Please review their privacy policy for information about how they handle your data.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground">We use cookies for authentication and functionality. You can control cookie preferences in your browser settings.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground">For privacy concerns, contact: privacy@learnloop.com</p>
          </section>
        </div>
      </div>
    </div>
  )
}
