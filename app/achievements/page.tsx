import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AppNavbar } from '@/components/app-navbar'

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select(
      `
      *,
      achievement:achievements(id, name, description, icon, points, tier, requirement)
    `
    )
    .eq('user_id', user.id)
    .order('achieved_at', { ascending: false })

  // Fetch user profile for reputation and navbar
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, reputation_points, total_posts, total_followers')
    .eq('id', user.id)
    .single()

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-amber-600'
      case 'silver':
        return 'text-slate-400'
      case 'gold':
        return 'text-yellow-500'
      case 'platinum':
        return 'text-blue-400'
      case 'diamond':
        return 'text-purple-400'
      default:
        return 'text-gray-500'
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-100'
      case 'silver':
        return 'bg-slate-100'
      case 'gold':
        return 'bg-yellow-100'
      case 'platinum':
        return 'bg-blue-100'
      case 'diamond':
        return 'bg-purple-100'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={profile ?? undefined} />
      <div className="container mx-auto py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground">
              Unlock badges and build your reputation in the LearnLoop community
            </p>
          </div>

          {/* Reputation Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {profile?.reputation_points || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Reputation Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{profile?.total_posts || 0}</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{profile?.total_followers || 0}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
            {userAchievements && userAchievements.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userAchievements.map((achievement: any) => (
                  <Card
                    key={achievement.id}
                    className={`text-center overflow-hidden ${getTierBadgeColor(
                      achievement.achievement?.tier
                    )}`}
                  >
                    <CardContent className="pt-6">
                      <div className="text-3xl mb-2">{achievement.achievement?.icon}</div>
                      <h3 className="font-bold text-sm mb-1">{achievement.achievement?.name}</h3>
                      <p className={`text-xs font-semibold mb-2 ${getTierColor(
                        achievement.achievement?.tier
                      )}`}>
                        {achievement.achievement?.tier?.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.achievement?.description}
                      </p>
                      <p className="text-xs font-bold">+{achievement.achievement?.points} pts</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Achieved {new Date(achievement.achieved_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No achievements yet. Start posting and engaging to unlock them!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Achievements to Unlock */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Next Achievements to Unlock</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="opacity-60">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">📝</div>
                  <h3 className="font-bold mb-1">First Post</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Create your first post on LearnLoop
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/3" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">1 of 1 completed</p>
                </CardContent>
              </Card>

              <Card className="opacity-60">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">🔥</div>
                  <h3 className="font-bold mb-1">Streak Master</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Post 7 days in a row
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-1/4" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">2 of 7 days completed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
