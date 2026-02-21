import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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
    <div className="min-h-screen bg-background">
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
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded hover:bg-muted cursor-pointer transition">
                <h3 className="font-bold mb-2">📝 Create Your First Post</h3>
                <p className="text-sm text-muted-foreground">
                  Share your knowledge and insights with the community
                </p>
              </div>
              <div className="p-4 border rounded hover:bg-muted cursor-pointer transition">
                <h3 className="font-bold mb-2">👥 Follow Topics</h3>
                <p className="text-sm text-muted-foreground">
                  Subscribe to topics you&apos;re interested in
                </p>
              </div>
              <div className="p-4 border rounded hover:bg-muted cursor-pointer transition">
                <h3 className="font-bold mb-2">⭐ Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Add a bio and profile picture to stand out
                </p>
              </div>
              <div className="p-4 border rounded hover:bg-muted cursor-pointer transition">
                <h3 className="font-bold mb-2">🔔 Enable Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Stay updated with likes, comments, and mentions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
