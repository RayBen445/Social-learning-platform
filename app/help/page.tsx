'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { PublicNavbar } from '@/components/public-navbar'

const FAQData = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign up" and fill in your email, password, and username. Verify your email and you\'re ready to go!'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot password?" on the login page, enter your email, and follow the reset link sent to your inbox.'
      }
    ]
  },
  {
    category: 'Posts & Comments',
    items: [
      {
        q: 'How do I create a post?',
        a: 'Go to /posts/create, write your title and content, select topics, and click publish.'
      },
      {
        q: 'Can I edit my post after publishing?',
        a: 'Yes, click the edit button on your post to make changes anytime.'
      },
      {
        q: 'How do comments work?',
        a: 'You can comment on any public post. Use @mentions to tag users in your comments.'
      }
    ]
  },
  {
    category: 'Community & Engagement',
    items: [
      {
        q: 'How do I follow someone?',
        a: 'Click the follow button on their profile. You\'ll see their posts in your feed.'
      },
      {
        q: 'What are topics?',
        a: 'Topics organize posts by subject. Subscribe to topics you\'re interested in to customize your feed.'
      },
      {
        q: 'How do achievements work?',
        a: 'Earn achievements by creating posts, getting upvotes, following users, and more. Check your profile to see your badges.'
      }
    ]
  },
  {
    category: 'Gamification',
    items: [
      {
        q: 'How do I earn reputation points?',
        a: 'You earn points for: creating posts, receiving upvotes, commenting, and engaging with the community.'
      },
      {
        q: 'What\'s the leaderboard?',
        a: 'Check /leaderboard to see top contributors. We have weekly, monthly, and all-time rankings.'
      },
      {
        q: 'Can I check my activity streak?',
        a: 'Yes, view your profile to see your current streak and longest streak.'
      }
    ]
  },
  {
    category: 'Safety & Privacy',
    items: [
      {
        q: 'How do I report inappropriate content?',
        a: 'Click the "Report" button on any post or comment, select the reason, and submit. Our team reviews it within 24 hours.'
      },
      {
        q: 'How do I block someone?',
        a: 'Go to Settings > Privacy and click "Block User". They won\'t see your profile or be able to message you.'
      },
      {
        q: 'How is my data protected?',
        a: 'We use encryption and industry-standard security. See our Privacy Policy for more details.'
      }
    ]
  }
]

export default function HelpPage() {
  const [search, setSearch] = useState('')

  const filtered = FAQData.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">← Back to Home</Button>
        </Link>

        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Find answers to common questions about LearnLoop
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        {filtered.length === 0 ? (
          <Card className="border-0 bg-muted/30 text-center py-12">
            <p className="text-muted-foreground">No results found. Try different keywords.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {filtered.map((category) => (
              <section key={category.category}>
                <h2 className="text-2xl font-bold mb-4">{category.category}</h2>
                <div className="space-y-4">
                  {category.items.map((item, idx) => (
                    <Card key={idx} className="border-0 bg-muted/30">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.q}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{item.a}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <section className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Didn't find your answer?</h2>
          <p className="text-muted-foreground mb-4">
            Contact our support team at support@learnloop.com or visit our community Discord.
          </p>
          <Button asChild>
            <Link href="mailto:support@learnloop.com">Contact Support</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
