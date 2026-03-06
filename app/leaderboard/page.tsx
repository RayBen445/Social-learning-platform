import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { VerifiedBadge } from '@/components/users/verified-badge'
import { AppNavbar } from '@/components/app-navbar'

function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="h-10 w-40 bg-muted animate-pulse rounded mx-auto" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded mx-auto" />
          </div>
          <div className="flex gap-4 border-b pb-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-28 bg-muted animate-pulse rounded" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function LeaderboardPage() {
  return (
    <Suspense fallback={<LeaderboardLoading />}>
      <LeaderboardContent />
    </Suspense>
  )
}

async function LeaderboardContent() {
  const supabase = await createClient()

  // Fetch top users by reputation
  const { data: topUsers } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, reputation_points, is_verified, total_posts')
    .order('reputation_points', { ascending: false })
    .limit(100)

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: currentProfile } = currentUser
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', currentUser.id).single()
    : { data: null }

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={currentProfile ?? undefined} />
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">
              See who's leading the LearnLoop community
            </p>
          </div>

          {/* Leaderboard Tabs */}
          <div className="flex gap-4 border-b">
            <button className="px-4 py-2 border-b-2 border-primary font-medium">
              By Reputation
            </button>
            <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
              By Posts
            </button>
            <button className="px-4 py-2 text-muted-foreground hover:text-foreground">
              By Followers
            </button>
          </div>

          {/* Leaderboard List */}
          <div className="space-y-2">
            {topUsers && topUsers.length > 0 ? (
              topUsers.map((user: any, index: number) => (
                <Card
                  key={user.id}
                  className={`${
                    currentUser?.id === user.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4 items-center">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="text-2xl font-bold">
                          {getMedalEmoji(index + 1) || `#${index + 1}`}
                        </div>
                      </div>

                      {/* Avatar */}
                      <Link href={`/profile/${user.username}`} className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* User Info */}
                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/profile/${user.username}`}
                          className="flex items-center gap-2 hover:underline mb-1"
                        >
                          <span className="font-bold">{user.full_name || user.username}</span>
                          {user.is_verified && (
                            <VerifiedBadge verificationType={user.verification_type} size="xs" />
                          )}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {user.total_posts} posts
                        </p>
                      </div>

                      {/* Reputation */}
                      <div className="flex-shrink-0 text-right">
                        <div className="font-bold text-lg text-primary">
                          {user.reputation_points}
                        </div>
                        <div className="text-xs text-muted-foreground">reputation</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No users yet
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>How to Gain Reputation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <span className="text-lg flex-shrink-0">📝</span>
                <div>
                  <div className="font-semibold">Create a Post</div>
                  <p className="text-sm text-muted-foreground">+10 reputation points</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg flex-shrink-0">👍</span>
                <div>
                  <div className="font-semibold">Receive Upvotes</div>
                  <p className="text-sm text-muted-foreground">+1 reputation per upvote</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg flex-shrink-0">💬</span>
                <div>
                  <div className="font-semibold">Helpful Comments</div>
                  <p className="text-sm text-muted-foreground">+5 reputation per helpful comment</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg flex-shrink-0">🏆</span>
                <div>
                  <div className="font-semibold">Unlock Achievements</div>
                  <p className="text-sm text-muted-foreground">Varies by achievement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
