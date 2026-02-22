'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Zap, Users, Trophy, MessageSquare, Search, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/logo'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <Logo href="/" size="sm" showText={true} />
        <div className="hidden md:flex gap-8">
          <Link href="#features" className="text-sm hover:text-primary">
            Features
          </Link>
          <Link href="/about" className="text-sm hover:text-primary">
            About
          </Link>
          <Link href="/help" className="text-sm hover:text-primary">
            Help
          </Link>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Sign up free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        className="px-6 py-20 text-center md:py-32"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-balance text-4xl font-bold md:text-6xl"
          variants={itemVariants}
        >
          Learn Together, Grow Together
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          variants={itemVariants}
        >
          Join LearnLoop, the modern platform where students create, share, and
          engage with educational content. Build your reputation, unlock
          achievements, and become part of a thriving learning community.
        </motion.p>

        <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center" variants={itemVariants}>
          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mx-auto mt-16 grid max-w-3xl gap-8 md:grid-cols-3"
          variants={containerVariants}
        >
          {[
            { label: 'Active Learners', value: '10K+' },
            { label: 'Topics Covered', value: '500+' },
            { label: 'Knowledge Shared', value: '100K+' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 className="text-3xl font-bold md:text-4xl" variants={itemVariants}>
              Powerful Features for Collaborative Learning
            </motion.h2>
            <motion.p
              className="mt-4 text-muted-foreground"
              variants={itemVariants}
            >
              Everything you need to share knowledge and build your learning
              community
            </motion.p>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: BookOpen,
                title: 'Create & Share',
                description:
                  'Write posts, share insights, and engage in topic-based discussions with your peers',
              },
              {
                icon: Users,
                title: 'Build Community',
                description:
                  'Follow users and topics, build your network, and discover new learning partners',
              },
              {
                icon: Zap,
                title: 'Earn Reputation',
                description:
                  'Gain points, unlock achievements, and climb leaderboards as you contribute',
              },
              {
                icon: MessageSquare,
                title: 'Direct Messaging',
                description:
                  'Connect with peers through private messages and real-time notifications',
              },
              {
                icon: Search,
                title: 'Discover Content',
                description:
                  'Search posts, find expert users, and explore trending topics effortlessly',
              },
              {
                icon: Trophy,
                title: 'Track Progress',
                description:
                  'Monitor activity streaks, achieve milestones, and showcase your expertise',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="h-full border-0 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CardHeader>
                      <Icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-foreground/70">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="mx-6 my-20 rounded-2xl border bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 px-8 py-16 text-center md:px-16"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold md:text-4xl">Ready to Join the Learning Revolution?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start your LearnLoop journey today and become part of a global community of learners
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/auth/sign-up">
            Create Your Account <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.section>

      {/* Footer */}
      <footer className="border-t px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <p className="font-semibold mb-4">LearnLoop</p>
              <p className="text-sm text-muted-foreground">
                A product of Cool Shot Systems
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/explore" className="hover:text-primary">
                    Explore
                  </Link>
                </li>
                <li>
                  <Link href="/leaderboard" className="hover:text-primary">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="/achievements" className="hover:text-primary">
                    Achievements
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Company</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-primary">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/legal/terms" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2026 Cool Shot Systems. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary">
                Twitter
              </Link>
              <Link href="#" className="hover:text-primary">
                Discord
              </Link>
              <Link href="#" className="hover:text-primary">
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
