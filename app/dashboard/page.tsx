import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import { Suspense } from 'react'
import { AppNavbar } from '@/components/app-navbar'

// Loading skeleton component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-56 bg-muted animate-pulse rounded" />
            <div className="h-5 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex gap-4">
            <div className="h-11 w-28 bg-muted animate-pulse rounded" />
            <div className="h-11 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-card p-8 space-y-4">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border rounded space-y-2">
                  <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent profile={profile} />
    </Suspense>
  )
}

async function DashboardContent({ profile }: { profile: any }) {
  const supabase = await createClient()

  const { count: topicCount } = await supabase
    .from('topic_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile?.id)

  const steps = [
    {
      icon: '📝',
      title: 'Create Your First Post',
      description: 'Share your knowledge and insights with the community',
      href: '/posts/create',
      done: (profile?.total_posts ?? 0) > 0,
    },
    {
      icon: '👥',
      title: 'Follow Topics',
      description: "Subscribe to topics you're interested in",
      href: '/explore',
      done: (topicCount ?? 0) > 0,
    },
    {
      icon: '⭐',
      title: 'Complete Your Profile',
      description: 'Add a bio and profile picture to stand out',
      href: '/settings/profile',
      done: !!(profile?.avatar_url && profile?.bio),
    },
    {
      icon: '🔔',
      title: 'Enable Notifications',
      description: 'Stay updated with likes, comments, and mentions',
      href: '/settings/notifications',
      done: false,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={profile ?? undefined} />

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {profile?.full_name || profile?.username}! 👋
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Start exploring and sharing knowledge with LearnLoop
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/posts/create">Create Post</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/explore">Explore Topics</Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats — no follower counts */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{profile?.total_posts || 0}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{profile?.reputation_points || 0}</div>
              <div className="text-sm text-muted-foreground">Reputation</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{profile?.total_comments || 0}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
          </div>

          {/* Get Started Section */}
          <div className="rounded-lg border bg-card p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Get Started</h2>
              <span className="text-sm text-muted-foreground font-medium">
                {completedCount} of {steps.length} completed
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted mb-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {steps.map((step, index) => (
                <Link
                  key={index}
                  href={step.href}
                  className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                    step.done
                      ? 'bg-primary/5 border-primary/30 hover:bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {step.done ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${step.done ? 'line-through text-muted-foreground' : ''}`}>
                      {step.icon} {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
