'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">← Back to Home</Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <section>
            <h1 className="text-4xl font-bold mb-4">About LearnLoop</h1>
            <p className="text-lg text-muted-foreground">
              A modern social learning platform built by Cool Shot Systems to empower students and educators through collaborative knowledge sharing.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe learning is most powerful when shared. LearnLoop exists to create a vibrant community where students can create, share, and engage with educational content—building not just knowledge, but lasting connections and genuine expertise.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become the leading social learning platform for students worldwide, where collaboration drives innovation and knowledge becomes a shared resource. We envision a world where every student has access to peer-to-peer learning and mentorship.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold">Core Values</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Community First",
                  description: "Building a supportive environment where everyone's voice matters"
                },
                {
                  title: "Knowledge Sharing",
                  description: "Making education accessible and collaborative for all learners"
                },
                {
                  title: "Quality & Trust",
                  description: "Ensuring safe, respectful interactions and meaningful content"
                },
                {
                  title: "Innovation",
                  description: "Continuously improving the learning experience for our users"
                }
              ].map((value) => (
                <Card key={value.title} className="border-0 bg-muted/30">
                  <CardHeader>
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Cool Shot Systems</h2>
            <p className="text-muted-foreground leading-relaxed">
              LearnLoop is a product of Cool Shot Systems, a team dedicated to creating innovative educational technology that transforms how students learn and grow together. Our platform combines proven social features with educational best practices to create an unmatched learning experience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-bold">Contact Us</h2>
            <p className="text-muted-foreground">
              Have questions or feedback? We'd love to hear from you:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>Email: support@learnloop.com</p>
              <p>Website: learnloop.com</p>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
