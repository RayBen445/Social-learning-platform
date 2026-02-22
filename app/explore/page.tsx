import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AppNavbar } from '@/components/app-navbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Flame, Clock, Users } from 'lucide-react'

export default async function ExplorePage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: currentUserProfile } = currentUser
    ? await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', currentUser.id)
        .single()
    : { data: null }

  // Fetch trending posts
  const { data: trendingPosts } = await supabase
    .from('posts')
    .select('id, title, excerpt, upvote_count, comment_count, created_at, user:profiles(username, full_name)')
    .eq('is_published', true)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('upvote_count', { ascending: false })
    .limit(10)

  // Fetch popular topics
  const { data: popularTopics } = await supabase
    .from('topics')
    .select('id, name, slug, post_count')
    .order('post_count', { ascending: false })
    .limit(12)

  // Fetch recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, excerpt, upvote_count, created_at, user:profiles(username, full_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recommended users (with most followers)
  const { data: recommendedUsers } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, total_followers')
    .gt('total_followers', 0)
    .order('total_followers', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={currentUserProfile} />
      
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">
            Discover interesting posts, topics, and people
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">

            {/* Trending Posts */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-2xl font-bold">Trending This Week</h2>
              </div>
              <div className="space-y-3">
              {popularTopics && popularTopics.length > 0 ? (
                popularTopics.map((topic: any) => (
                  <Link key={topic.id} href={`/topics/${topic.slug}`}>
                    <Card className="hover:bg-muted/50 cursor-pointer transition h-full">
                      <CardContent className="pt-6 text-center">
                        <h3 className="font-bold mb-1">{topic.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {topic.post_count} posts
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">No topics yet</CardContent>
                </Card>
              )}
            </div>
          </section>

            {/* Recent Posts */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-500" />
                <h2 className="text-2xl font-bold">Recent Posts</h2>
              </div>
              <div className="space-y-3">
              {trendingPosts && trendingPosts.length > 0 ? (
                trendingPosts.map((post: any) => (
                  <Link key={post.id} href={`/posts/${post.id}`}>
                    <Card className="hover:bg-muted/50 cursor-pointer transition">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 text-center min-w-fit">
                            <div className="text-2xl font-bold text-primary">
                              🔥
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {post.upvote_count} upvotes
                            </p>
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold mb-1">{post.title}</h3>
                            {post.excerpt && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>By {post.user?.full_name || post.user?.username}</span>
                              <span>{post.comment_count} comments</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No trending posts this week
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {/* Recommended Users */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Recommended People</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers && recommendedUsers.length > 0 ? (
                recommendedUsers.map((user: any) => (
                  <Link key={user.id} href={`/profile/${user.username}`}>
                    <Card className="hover:bg-muted/50 cursor-pointer transition">
                      <CardContent className="pt-6 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-3 overflow-hidden">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xl">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold mb-1">{user.full_name || user.username}</h3>
                        <p className="text-xs text-muted-foreground mb-2">@{user.username}</p>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {user.bio}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {user.total_followers} followers
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No recommended users
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Popular Topics */}
            {/* Recommended Users Sidebar */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-bold">People to Follow</h3>
              </div>
              <div className="space-y-3">
                {recommendedUsers && recommendedUsers.length > 0 ? (
                  recommendedUsers.slice(0, 5).map((user: any) => (
                    <Link key={user.id} href={`/profile/${user.username}`}>
                      <Card className="hover:bg-muted/50 cursor-pointer transition">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-semibold text-sm truncate">{user.full_name || user.username}</p>
                              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                              <p className="text-xs text-muted-foreground mt-1">{user.total_followers} followers</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations yet</p>
                )}
              </div>
            </section>

            {/* Popular Topics */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold">Popular Topics</h3>
              <div className="space-y-2">
                {popularTopics && popularTopics.length > 0 ? (
                  popularTopics.slice(0, 8).map((topic: any) => (
                    <Link key={topic.id} href={`/topics/${topic.slug}`}>
                      <Card className="hover:bg-muted/50 cursor-pointer transition p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{topic.name}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {topic.post_count}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No topics yet</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
