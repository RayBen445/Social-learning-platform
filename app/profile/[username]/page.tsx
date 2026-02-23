import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { VerifiedBadge } from '@/components/users/verified-badge'
import { Building2, GraduationCap, BookOpen, MapPin, Globe } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'

// Profile page loading skeleton
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl">
          <div className="flex flex-col md:flex-row gap-6 -mt-20 mb-8 relative z-10">
            <div className="h-24 w-24 rounded-full bg-muted animate-pulse border-4 border-background" />
            <div className="flex-grow space-y-3 pt-4">
              <div className="h-8 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
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

  const { data: currentProfile } = currentUser
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', currentUser.id).single()
    : { data: null }

  // Fetch course memberships — graceful if table doesn't exist
  type CourseMemberRow = { courses: { id: string; code: string; title: string; department: string } | null }
  let courses: CourseMemberRow[] = []
  try {
    const { data } = await supabase
      .from('course_members')
      .select('courses(id, code, title, department)')
      .eq('user_id', profile.id)
      .limit(5)
    courses = (data as CourseMemberRow[] | null) ?? []
  } catch {
    courses = []
  }

  // Fetch group memberships — graceful if table doesn't exist
  type GroupMemberRow = { groups: { id: string; name: string; group_type: string; is_archived: boolean } | null }
  let groups: GroupMemberRow[] = []
  try {
    const { data } = await supabase
      .from('group_members')
      .select('groups(id, name, group_type, is_archived)')
      .eq('user_id', profile.id)
    groups = (data as GroupMemberRow[] | null) ?? []
  } catch {
    groups = []
  }

  const activeGroups = groups.filter((g) => g.groups && !g.groups.is_archived)
  const archivedGroups = groups.filter((g) => g.groups && g.groups.is_archived)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={currentProfile ?? undefined} />

      {/* Cover Photo / Banner */}
      {profile.banner_url ? (
        <img src={profile.banner_url} alt="Cover photo" className="w-full h-48 object-cover" />
      ) : (
        <div className="h-48 bg-gradient-to-r from-primary/80 to-primary" />
      )}

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl">

          {/* Profile Header Card */}
          <Card className="-mt-20 mb-6 relative z-10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">

                {/* Left column */}
                <div className="flex-grow">
                  <div className="flex items-end gap-4 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-24 h-24 rounded-full bg-muted border-4 border-background overflow-hidden flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold">
                          {profile.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                        {profile.is_verified && (
                          <VerifiedBadge verificationType={profile.verification_type} />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">@{profile.username}</p>
                    </div>
                  </div>

                  {/* Institution / Department / Level */}
                  {(profile.institution || profile.department || profile.faculty || profile.level) && (
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
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
                      {profile.level && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {profile.level}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-sm mb-3 md:line-clamp-1 line-clamp-none">{profile.bio}</p>
                  )}

                  {/* Location and Website */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {profile.location}
                      </span>
                    )}
                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Right column — action buttons */}
                <div className="flex-shrink-0 flex flex-col gap-2 md:items-end">
                  {isOwnProfile ? (
                    <Button asChild>
                      <Link href="/settings/profile">Edit Profile</Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild>
                        <Link href={`/messages/${profile.id}`}>Message</Link>
                      </Button>
                      <Button variant="outline">Add to Study Group</Button>
                      <Button variant="outline">Invite to Course</Button>
                      <Link
                        href={`/reports?user=${profile.username}`}
                        className="text-xs text-muted-foreground hover:text-destructive text-center mt-1"
                      >
                        Report / Block
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Snapshot Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Academic Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Courses */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Courses
                  </h4>
                  {courses.length > 0 ? (
                    courses.map((c, i) =>
                      c.courses ? (
                        <div key={c.courses.id ?? i} className="text-sm mb-1">
                          {c.courses.code} — {c.courses.title}
                        </div>
                      ) : null
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">No courses added</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Skills
                  </h4>
                  {profile.skills?.length > 0 ? (
                    profile.skills.map((s: string) => (
                      <span
                        key={s}
                        className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-1 mb-1"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added</p>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Interests
                  </h4>
                  {profile.interests?.length > 0 ? (
                    profile.interests.map((i: string) => (
                      <span
                        key={i}
                        className="inline-block text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full mr-1 mb-1"
                      >
                        {i}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests added</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contributions Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                <div>
                  <div className="text-2xl font-bold">{profile.total_posts || 0}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.reputation_points || 0}</div>
                  <div className="text-xs text-muted-foreground">Reputation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{profile.total_comments || 0}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Groups & Communities Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Groups &amp; Communities</CardTitle>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not a member of any groups yet.</p>
              ) : (
                <>
                  <div className="space-y-2 mb-3">
                    {activeGroups.map((g, i) =>
                      g.groups ? (
                        <div key={g.groups.id ?? i} className="flex items-center gap-2 text-sm">
                          <Link href={`/groups/${g.groups.id}`} className="hover:text-primary font-medium">
                            {g.groups.name}
                          </Link>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                            {g.groups.group_type}
                          </span>
                        </div>
                      ) : null
                    )}
                  </div>
                  {archivedGroups.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        {archivedGroups.length} archived group{archivedGroups.length !== 1 ? 's' : ''}
                      </summary>
                      <div className="space-y-2 mt-2 pl-2 border-l">
                        {archivedGroups.map((g, i) =>
                          g.groups ? (
                            <div key={g.groups.id ?? i} className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-medium">{g.groups.name}</span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">
                                {g.groups.group_type}
                              </span>
                            </div>
                          ) : null
                        )}
                      </div>
                    </details>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Posts Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {posts && posts.length > 0 ? (
                  posts.map((post: { id: string; title: string; excerpt: string | null; created_at: string; upvote_count: number; comment_count: number }) => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        <Link href={`/posts/${post.id}`} className="hover:text-primary">
                          <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                        </Link>
                        {post.excerpt && (
                          <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>👍 {post.upvote_count} upvotes</span>
                          <span>💬 {post.comment_count} comments</span>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No posts yet</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <BottomNav username={currentProfile?.username} />
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
