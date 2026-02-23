'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const problemItems = [
  'Class groups become chaotic',
  'Hard to find classmates by course',
  'Academic discussions get lost',
  "Most platforms aren't built for school life",
]

const solutionItems = [
  { emoji: '🎓', title: 'Verified Students', desc: 'Only real, school-verified students join the platform.' },
  { emoji: '📚', title: 'Academic Profiles', desc: 'School, course, level, and skills all in one place.' },
  { emoji: '👥', title: 'Course & Study Groups', desc: 'Built around classes and subjects, not popularity.' },
  { emoji: '💬', title: 'Focused Messaging', desc: 'Organized, context-aware conversations with classmates.' },
]

const steps = [
  { n: '1', title: 'Sign up as a student', desc: 'Create your account with your student details.' },
  { n: '2', title: 'Verify your school', desc: 'Confirm your institution to access your community.' },
  { n: '3', title: 'Complete your academic profile', desc: 'Add your courses, level, and skills.' },
  { n: '4', title: 'Connect with classmates and groups', desc: 'Find study groups and course peers instantly.' },
]

const trustItems = [
  { icon: '✅', label: 'Verification-first platform' },
  { icon: '🔒', label: 'Privacy-focused' },
  { icon: '📊', label: 'No follower pressure' },
  { icon: '🎓', label: 'Academic-first design' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Logo href="/" size="sm" showText={true} />
        <div className="hidden md:flex gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link>
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help</Link>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/sign-up">Sign Up</Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-background via-background to-primary/5 px-6 py-24 text-center md:py-36">
        <motion.div
          className="mx-auto max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-block rounded-full border border-indigo-400/50 bg-indigo-50/10 px-4 py-1.5 text-sm font-medium text-primary">
              🎓 School-Verified Platform
            </span>
          </motion.div>

          <motion.h1
            className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl"
            variants={fadeUp}
          >
            A Verified Social Space for Students
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl"
            variants={fadeUp}
          >
            Connect with real classmates, courses, and study groups — without the noise of regular social media.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            variants={fadeUp}
          >
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">How It Works</Link>
            </Button>
          </motion.div>

          <motion.p
            className="mt-6 text-xs text-muted-foreground"
            variants={fadeUp}
          >
            Verified students only · No follower pressure · Academic-first
          </motion.p>
        </motion.div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-muted/30 px-6 py-20" id="features">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-12"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 className="text-3xl font-bold md:text-4xl" variants={fadeUp}>
              Student communication is broken.
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {problemItems.map((text) => (
              <motion.div
                key={text}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-xl border bg-background p-5"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm font-medium leading-snug">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-12"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 className="text-3xl font-bold md:text-4xl" variants={fadeUp}>
              LearnLoop is built around academic identity.
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {solutionItems.map(({ emoji, title, desc }) => (
              <motion.div key={title} variants={fadeUp}>
                <Card className="h-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <CardHeader className="pb-2">
                    <span className="text-2xl">{emoji}</span>
                    <CardTitle className="mt-2 text-base">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 className="text-3xl font-bold md:text-4xl" variants={fadeUp}>
              How It Works
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map(({ n, title, desc }) => (
              <motion.div
                key={n}
                variants={fadeUp}
                className="flex gap-4 rounded-xl border bg-background p-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {n}
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {trustItems.map(({ icon, label }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="flex items-center gap-2 rounded-full border bg-muted/50 px-5 py-2.5 text-sm font-medium"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <motion.section
        className="bg-primary px-6 py-20 text-center text-primary-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold md:text-4xl">
          Ready to join a better student space?
        </h2>
        <p className="mx-auto mt-4 max-w-xl opacity-90">
          Join thousands of verified students already connecting through LearnLoop.
        </p>
        <Button
          size="lg"
          className="mt-8 bg-background text-primary hover:bg-background/90"
          asChild
        >
          <Link href="/auth/sign-up">Create a Student Account</Link>
        </Button>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="border-t bg-background px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4 mb-10">
            {/* Col 1 */}
            <div>
              <Logo href="/" size="sm" showText={true} />
              <p className="mt-3 text-sm text-muted-foreground">A social learning platform</p>
              <p className="mt-1 text-sm text-muted-foreground">Built by Cool Shot Systems</p>
            </div>

            {/* Col 2 — Platform */}
            <div>
              <p className="mb-4 text-sm font-semibold">Platform</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/community-guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
                <li><Link href="/help" className="hover:text-primary transition-colors">Help</Link></li>
              </ul>
            </div>

            {/* Col 3 — Legal */}
            <div>
              <p className="mb-4 text-sm font-semibold">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-primary transition-colors">Cookies</Link></li>
                <li><Link href="/legal/dmca" className="hover:text-primary transition-colors">DMCA</Link></li>
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <p className="mb-4 text-sm font-semibold">Contact</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@learnloop.app</li>
                <li>Cool Shot Systems</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Cool Shot Systems · All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
