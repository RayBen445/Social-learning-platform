'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Back to Home
          </Button>
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">Last updated: February 2026</p>
          </div>

          <Card className="border-0 bg-muted/30 p-6">
            <p className="text-sm text-muted-foreground">
              By accessing and using LearnLoop, you accept and agree to be bound by
              the terms and provision of this agreement.
            </p>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              These Terms of Service constitute the entire agreement between you
              and Cool Shot Systems regarding your use of the LearnLoop platform.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on LearnLoop for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>
                Attempt to decompile or reverse engineer any software contained
                on LearnLoop
              </li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person or server</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. User Accounts</h2>
            <p className="text-muted-foreground">
              When you create an account on LearnLoop, you agree to provide
              accurate and complete information. You are responsible for
              maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. You agree to notify
              us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. User Content</h2>
            <p className="text-muted-foreground">
              You retain all rights to content you post on LearnLoop. By posting
              content, you grant us a non-exclusive, royalty-free license to use,
              distribute, and display such content on our platform. You are
              solely responsible for the content you post and agree not to post
              content that is illegal, harmful, or violates the rights of others.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Prohibited Conduct</h2>
            <p className="text-muted-foreground">
              You agree not to use LearnLoop to:
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Harass, abuse, or threaten other users</li>
              <li>Post illegal content or content that promotes illegal activity</li>
              <li>Spam or send unsolicited communications</li>
              <li>Attempt to hack or compromise platform security</li>
              <li>Post content containing hate speech or discrimination</li>
              <li>Violate intellectual property rights</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              LearnLoop is provided on an "AS IS" and "AS AVAILABLE" basis.
              Cool Shot Systems makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Limitations of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall Cool Shot Systems or its suppliers be liable for
              any damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on LearnLoop, even if Cool Shot
              Systems has been notified of the possibility of such damage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Modifications</h2>
            <p className="text-muted-foreground">
              Cool Shot Systems may revise these Terms of Service for our website
              at any time without notice. By using this website, you are agreeing
              to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms of Service are governed by and construed in accordance
              with the laws of the United States, and you irrevocably submit to
              the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please
              contact us at: support@learnloop.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
