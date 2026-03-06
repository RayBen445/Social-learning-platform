'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PublicNavbar } from '@/components/public-navbar'

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">← Back</Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">DMCA & Intellectual Property</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Copyright Policy</h2>
            <p className="text-muted-foreground mb-3">Cool Shot Systems respects intellectual property rights. Users must not upload or share content they don't own or have permission to use.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Content Ownership</h2>
            <p className="text-muted-foreground mb-3">By posting content to LearnLoop, you confirm that you own or have the right to share the content. Educational content citations and attributions are encouraged.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Fair Use</h2>
            <p className="text-muted-foreground mb-3">We recognize fair use principles for educational content, including limited excerpts, citations, and transformative use for learning purposes.</p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">DMCA Takedown</h2>
            <p className="text-muted-foreground mb-3">If you believe content on LearnLoop infringes your copyright, submit a DMCA notice to: legal@learnloop.com with:</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground mt-3">
              <li>Description of the copyrighted work</li>
              <li>Location of infringing content</li>
              <li>Your contact information</li>
              <li>Statement under penalty of perjury</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-3">Counter-Notice</h2>
            <p className="text-muted-foreground">If you receive a DMCA notice and believe it's in error, you can submit a counter-notice with similar information.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
