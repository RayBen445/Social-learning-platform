import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import FollowButton from '@/components/users/follow-button'
import { AppNavbar } from '@/components/app-navbar'

interface FollowersPageProps {
  params: Promise<{
    username: string
  }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch user
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id, username, full_name')
    .eq('username', username)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Fetch followers
  const { data: followers } = await supabase
    .from('follows')
    .select('follower:profiles(id, username, full_name, avatar_url, bio, is_verified)')
    .eq('following_id', user.id)
    .limit(50)

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: currentProfile } = currentUser
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', currentUser.id).single()
    : { data: null }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={currentProfile ?? undefined} />
      <div className="container mx-auto max-w-2xl py-10">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href={`/profile/${username}`} className="text-primary hover:underline mb-2 inline-block">
            ← Back to profile
          </Link>
          <h1 className="text-3xl font-bold">{user.full_name || user.username}'s Followers</h1>
          <p className="text-muted-foreground">
            {followers?.length || 0} followers
          </p>
        </div>

        {/* Followers List */}
        {followers && followers.length > 0 ? (
          <div className="space-y-3">
            {followers.map((follow: any) => (
              <Card key={follow.follower.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4 items-center">
                    {/* Avatar */}
                    <Link href={`/profile/${follow.follower.username}`} className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                        {follow.follower.avatar_url ? (
                          <img
                            src={follow.follower.avatar_url}
                            alt={follow.follower.full_name || follow.follower.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                            {follow.follower.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* User Info */}
                    <div className="flex-grow min-w-0">
                      <Link
                        href={`/profile/${follow.follower.username}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <span className="font-bold">{follow.follower.full_name || follow.follower.username}</span>
                        {follow.follower.is_verified && (
                          <span className="text-blue-600 text-sm">✓</span>
                        )}
                      </Link>
                      <p className="text-sm text-muted-foreground">@{follow.follower.username}</p>
                      {follow.follower.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {follow.follower.bio}
                        </p>
                      )}
                    </div>

                    {/* Follow Button */}
                    {currentUser && currentUser.id !== follow.follower.id && (
                      <FollowButton userId={follow.follower.id} currentUser={currentUser} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No followers yet
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: FollowersPageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('username', username)
    .single()

  return {
    title: `${user?.full_name || username}'s Followers - LearnLoop`,
  }
}
