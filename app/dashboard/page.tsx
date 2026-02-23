import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Home, Compass, Bell, Mail, Settings, CheckCircle2, Circle } from 'lucide-react'
import { Suspense } from 'react'

// Loading skeleton component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl space-y-6">
          {/* Welcome section skeleton */}
          <div className="space-y-2">
            <div className="h-10 w-56 bg-muted animate-pulse rounded" />
            <div className="h-5 w-80 bg-muted animate-pulse rounded" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex gap-4">
            <div className="h-11 w-28 bg-muted animate-pulse rounded" />
            <div className="h-11 w-32 bg-muted animate-pulse rounded" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Get started section skeleton */}
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

  // Fetch user profile
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

  // Fetch topic subscription count for the current user
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
      href: '/settings',
      done: !!(profile?.avatar_url && profile?.bio),
    },
    {
      icon: '🔔',
      title: 'Enable Notifications',
      description: 'Stay updated with likes, comments, and mentions',
      href: '/notifications',
      done: false,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <Logo href="/dashboard" size="sm" showText={true} />

          {/* Center Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Compass className="h-4 w-4" />
              Explore
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              Messages
            </Link>
            <Link
              href="/notifications"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </Link>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            <Button asChild size="sm" variant="default">
              <Link href="/posts/create">Create Post</Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{profile?.full_name || profile?.username}</p>
                <p className="text-xs text-muted-foreground">{profile?.username}</p>
              </div>
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="h-8 w-8 rounded-full border"
                />
              )}
              <Link href="/settings">
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto py-12">
        <div className="max-w-4xl">
          {/* Welcome Section */}
          <div className="mb-12">
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

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{profile?.total_posts || 0}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{profile?.total_followers || 0}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
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

            {/* Overall progress bar */}
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
