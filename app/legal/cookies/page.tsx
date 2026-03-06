'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PublicNavbar } from '@/components/public-navbar'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">← Back</Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
            <p className="text-muted-foreground">Cookies are small text files stored on your device that help websites remember your preferences and provide personalized experiences.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies We Use</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Essential Cookies:</strong> Required for authentication, security, and platform functionality</p>
              <p><strong>Preference Cookies:</strong> Remember your settings, theme preferences, and language choices</p>
              <p><strong>Analytics Cookies:</strong> Help us understand how users interact with LearnLoop to improve our service</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookie Duration</h2>
            <p className="text-muted-foreground">Session cookies are deleted when you close your browser. Persistent cookies remain until expiration or deletion.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Managing Cookies</h2>
            <p className="text-muted-foreground mb-3">You can control cookie settings in your browser preferences. Disabling cookies may affect platform functionality.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Third-Party Cookies</h2>
            <p className="text-muted-foreground">Some services may use their own cookies for analytics and functionality. See their privacy policies for details.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
