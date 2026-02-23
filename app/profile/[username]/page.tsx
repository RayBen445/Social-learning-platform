import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { VerifiedBadge } from '@/components/users/verified-badge'
import { Building2, GraduationCap, BookOpen, MapPin, Globe } from 'lucide-react'

// Profile page loading skeleton
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner skeleton */}
      <div className="h-32 bg-muted animate-pulse" />

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl">
          {/* Profile Header skeleton */}
          <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-8 relative z-10">
            <div className="h-32 w-32 rounded-lg bg-muted animate-pulse" />
            <div className="flex-grow space-y-3 pt-4">
              <div className="h-8 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>

          {/* Bio and stats skeleton */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Posts skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg border-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent params={params} />
    </Suspense>
  )
}

async function ProfileContent({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, excerpt, created_at, upvote_count, comment_count')
    .eq('user_id', profile.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Check if current user is the profile owner
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {profile.banner_url ? (
        <img src={profile.banner_url} alt="Cover photo" className="w-full h-48 object-cover" />
      ) : (
        <div className="h-48 bg-gradient-to-r from-primary/80 to-primary" />
      )}

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl">
          {/* Profile Header */}
          <Card className="-mt-20 mb-6 relative z-10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-muted border-4 border-background overflow-hidden flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || profile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-4xl font-bold">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
                    {profile.is_verified && (
                      <VerifiedBadge verificationType={profile.verification_type} />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">@{profile.username}</p>
                  {profile.bio && <p className="mb-4">{profile.bio}</p>}

                  {/* Academic Info */}
                  {(profile.institution || profile.department || profile.faculty) && (
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      {profile.institution && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {profile.institution}
                        </span>
                      )}
                      {profile.faculty && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {profile.faculty}
                        </span>
                      )}
                      {profile.department && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {profile.department}
                        </span>
                      )}
                      {profile.level && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{profile.level}</span>}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-6 mb-4">
                    <div>
                      <div className="font-bold text-lg">{profile.total_posts}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{profile.reputation_points}</div>
                      <div className="text-xs text-muted-foreground">Reputation</div>
                    </div>
                  </div>

                  {/* Location and Website */}
                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location}
                      </span>
                    )}
                    {profile.website_url && (
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </a>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isOwnProfile ? (
                    <div className="flex gap-2">
                      <Button asChild>
                        <Link href="/settings/profile">Edit Profile</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button>Follow</Button>
                      <Button variant="outline">Message</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b">
              <div className="flex gap-4">
                <button className="px-4 py-2 border-b-2 border-primary font-medium">
                  Posts
                </button>
                {isOwnProfile && (
                  <>
                    <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
                      Collections
                    </button>
                    <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
                      Series
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="pt-6">
                    <Link href={`/posts/${post.id}`} className="hover:text-primary">
                      <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                    </Link>
                    {post.excerpt && <p className="text-muted-foreground mb-3">{post.excerpt}</p>}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>👍 {post.upvote_count} upvotes</span>
                      <span>💬 {post.comment_count} comments</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No posts yet
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('username', username)
    .single()

  return {
    title: `${profile?.full_name || username} - LearnLoop`,
    description: profile?.bio || `${username}'s profile on LearnLoop`,
  }
}
