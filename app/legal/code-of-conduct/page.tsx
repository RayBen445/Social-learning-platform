'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PublicNavbar } from '@/components/public-navbar'

export default function CodeOfConductPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">← Back</Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Community Code of Conduct</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Our Community Values</h2>
            <p className="text-muted-foreground mb-3">LearnLoop is committed to fostering an inclusive, respectful, and harassment-free community where all members can learn and grow.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Expected Behavior</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Be respectful and kind to all community members</li>
              <li>Provide constructive feedback and criticism</li>
              <li>Respect diverse viewpoints and experiences</li>
              <li>Contribute meaningfully to discussions</li>
              <li>Follow platform rules and policies</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Unacceptable Behavior</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Harassment, bullying, or threatening behavior</li>
              <li>Hate speech or discriminatory content</li>
              <li>Spam or promotional content without permission</li>
              <li>Sharing others' private information</li>
              <li>Illegal content or activities</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Reporting Violations</h2>
            <p className="text-muted-foreground">Report violations using the report button on posts or comments. Our moderation team will review and take appropriate action.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Enforcement</h2>
            <p className="text-muted-foreground">Violations may result in warnings, content removal, temporary suspension, or permanent ban from LearnLoop.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
