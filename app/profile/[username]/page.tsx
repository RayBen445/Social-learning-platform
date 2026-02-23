import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Suspense } from 'react'
import { VerifiedBadge } from '@/components/users/verified-badge'
import { Building2, GraduationCap, BookOpen, MapPin, Globe, CalendarDays, Camera, PenLine } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { ProfileCompletionBar } from '@/components/profile-completion-bar'
import { computeProfileCompletion } from '@/lib/profile-completion'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function memberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Profile page loading skeleton
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="relative">
        <div className="h-40 md:h-52 bg-muted animate-pulse" />
        {/* Avatar overlap placeholder */}
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-end gap-4 -mt-14 mb-4 relative z-10">
            <div className="h-28 w-28 rounded-full bg-muted animate-pulse border-4 border-background flex-shrink-0" />
            <div className="pb-2 space-y-2 flex-grow">
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-28 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 pb-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="md:col-span-2 space-y-6">
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="md:col-span-1 space-y-6">
            <div className="h-28 bg-muted animate-pulse rounded-lg" />
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProfilePageProps {
  params: Promise<{ username: string }>
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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, excerpt, created_at, comment_count')
    .eq('user_id', profile.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === profile.id

  const { data: currentProfile } = currentUser
    ? await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', currentUser.id).single()
    : { data: null }

  type CourseMemberRow = { courses: { id: string; code: string; title: string; department: string } | null }
  let courses: CourseMemberRow[] = []
  try {
    const { data } = await supabase
      .from('course_members')
      .select('courses(id, code, title, department)')
      .eq('user_id', profile.id)
      .limit(5)
    courses = (data as CourseMemberRow[] | null) ?? []
  } catch { courses = [] }

  type GroupMemberRow = { groups: { id: string; name: string; group_type: string; is_archived: boolean } | null }
  let groups: GroupMemberRow[] = []
  try {
    const { data } = await supabase
      .from('group_members')
      .select('groups(id, name, group_type, is_archived)')
      .eq('user_id', profile.id)
    groups = (data as GroupMemberRow[] | null) ?? []
  } catch { groups = [] }

  const activeGroups = groups.filter((g) => g.groups && !g.groups.is_archived)
  const archivedGroups = groups.filter((g) => g.groups && g.groups.is_archived)

  // Academic context string — "Institution · Department · Level"
  const contextParts = [profile.institution, profile.department, profile.level].filter(Boolean)

  // Profile completion (own profile only)
  const completion = isOwnProfile ? computeProfileCompletion(profile, courses.length) : null

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={currentProfile ?? undefined} />

      {/* ── Banner ── */}
      <div className="relative group">
        {profile.banner_url ? (
          <img
            src={profile.banner_url}
            alt="Cover photo"
            className="w-full h-40 md:h-52 object-cover"
          />
        ) : (
          <div className="h-40 md:h-52 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        )}
        {/* Own profile: change cover overlay */}
        {isOwnProfile && (
          <Link
            href="/settings/profile"
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Change cover photo"
          >
            <div className="flex items-center gap-2 text-white text-sm font-medium bg-black/40 px-3 py-1.5 rounded-full">
              <Camera className="h-4 w-4" />
              Change cover
            </div>
          </Link>
        )}
      </div>

      {/* ── Avatar row — overlaps banner ── */}
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-end justify-between gap-4 -mt-14 md:-mt-16 mb-1 relative z-10">
          {/* Avatar */}
          <div className="relative group/avatar flex-shrink-0">
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full border-4 border-background overflow-hidden shadow-md">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                  {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <Link
                href="/settings/profile"
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                title="Change profile photo"
              >
                <Camera className="h-5 w-5 text-white" />
              </Link>
            )}
          </div>

          {/* Desktop action buttons aligned to right of avatar row */}
          <div className="hidden sm:flex gap-2 pb-2">
            {isOwnProfile ? (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/settings/profile">
                    <PenLine className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/settings">Settings</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm">
                  <Link href={`/messages/${profile.id}`}>Message</Link>
                </Button>
                <Button size="sm" variant="outline">Add to Study Group</Button>
                <Button size="sm" variant="outline">Invite to Course</Button>
                <Link
                  href={`/reports?user=${profile.username}`}
                  className="text-xs text-muted-foreground hover:text-destructive self-center px-2"
                >
                  Report
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Profile identity ── */}
        <div className="pt-3 pb-4">
          {/* Name + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold leading-tight">{profile.full_name || profile.username}</h1>
            {profile.is_verified && (
              <VerifiedBadge verificationType={profile.verification_type} />
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>

          {/* Academic context — single clean line */}
          {contextParts.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
              {profile.institution && <Building2 className="h-3.5 w-3.5 flex-shrink-0" />}
              {contextParts.join(' · ')}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm mt-2 max-w-xl">{profile.bio}</p>
          )}

          {/* Location · Website · Member since */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{profile.location}
              </span>
            )}
            {profile.website_url && (
              <a
                href={profile.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary"
              >
                <Globe className="h-3 w-3" />Website
              </a>
            )}
            {profile.created_at && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Joined {memberSince(profile.created_at)}
              </span>
            )}
          </div>

          {/* Mobile action buttons */}
          <div className="sm:hidden mt-4 flex flex-col gap-2">
            {isOwnProfile ? (
              <Button asChild className="w-full" size="sm">
                <Link href="/settings/profile">
                  <PenLine className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full" size="sm">
                  <Link href={`/messages/${profile.id}`}>Message</Link>
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" size="sm">Add to Study Group</Button>
                  <Button variant="outline" className="flex-1" size="sm">Invite to Course</Button>
                </div>
                <Link
                  href={`/reports?user=${profile.username}`}
                  className="text-xs text-muted-foreground hover:text-destructive text-center"
                >
                  Report / Block
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Main column ── */}
          <div className="md:col-span-2 space-y-5">

            {/* Profile completion (own + incomplete) */}
            {completion && !completion.isComplete && (
              <ProfileCompletionBar
                percent={completion.percent}
                steps={completion.steps}
                isComplete={completion.isComplete}
              />
            )}

            {/* Academic Snapshot — collapsible on mobile */}
            <Card>
              <details open className="md:[&>summary]:hidden">
                <summary className="md:hidden px-6 py-4 cursor-pointer list-none flex items-center justify-between text-sm font-semibold">
                  Academic Snapshot
                  <span className="text-muted-foreground text-xs">tap to expand</span>
                </summary>
                <CardHeader className="hidden md:flex pb-2">
                  <CardTitle>Academic Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Courses */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Current Courses
                    </h4>
                    {courses.length > 0 ? (
                      <div className="space-y-1">
                        {courses.map((c, i) =>
                          c.courses ? (
                            <div key={c.courses.id ?? i} className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                {c.courses.code}
                              </span>
                              <span className="text-sm text-foreground">{c.courses.title}</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No courses added yet.{' '}
                        {isOwnProfile && (
                          <Link href="/courses" className="text-primary hover:underline">Add courses →</Link>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Skills</h4>
                    {profile.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s: string) => (
                          <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet.{' '}
                        {isOwnProfile && (
                          <Link href="/settings/profile" className="text-primary hover:underline">Add skills →</Link>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Academic Interests */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Academic Interests</h4>
                    {profile.interests?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((i: string) => (
                          <span key={i} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                            {i}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No interests added yet.{' '}
                        {isOwnProfile && (
                          <Link href="/settings/profile" className="text-primary hover:underline">Add interests →</Link>
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </details>
            </Card>

            {/* Contributions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Posts', value: profile.total_posts || 0 },
                    { label: 'Replies', value: profile.total_comments || 0 },
                    { label: 'Reputation', value: profile.reputation_points || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-3 rounded-lg bg-muted/40">
                      <div className="text-2xl font-bold tabular-nums">{value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3">
                {posts && posts.length > 0 ? (
                  <div className="divide-y">
                    {posts.map((post: { id: string; title: string | null; content: string | null; excerpt: string | null; created_at: string; comment_count: number }) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="block px-3 py-3 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-sm line-clamp-1">
                          {post.title || post.excerpt || (post.content ? post.content.slice(0, 80) : 'Untitled post')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {timeAgo(post.created_at)} · {post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-sm text-muted-foreground">No posts yet.</p>
                    {isOwnProfile && (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/posts/create">Create your first post</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="md:col-span-1 space-y-5">

            {/* Groups & Communities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Groups &amp; Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {activeGroups.length === 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Not in any groups yet.</p>
                    {isOwnProfile && (
                      <Button asChild size="sm" variant="outline" className="w-full">
                        <Link href="/groups">Browse groups</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {activeGroups.slice(0, 5).map((g, i) =>
                        g.groups ? (
                          <div key={g.groups.id ?? i} className="flex items-center justify-between gap-2">
                            <Link
                              href={`/groups/${g.groups.id}`}
                              className="text-sm hover:text-primary font-medium truncate"
                            >
                              {g.groups.name}
                            </Link>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                              {g.groups.group_type}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                    {archivedGroups.length > 0 && (
                      <details className="mt-3 text-sm">
                        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                          {archivedGroups.length} archived group{archivedGroups.length !== 1 ? 's' : ''}
                        </summary>
                        <div className="space-y-1.5 mt-2 pl-2 border-l opacity-70">
                          {archivedGroups.map((g, i) =>
                            g.groups ? (
                              <div key={g.groups.id ?? i} className="flex items-center gap-2 text-muted-foreground">
                                <span className="text-xs font-medium">{g.groups.name}</span>
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full capitalize">{g.groups.group_type}</span>
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

            {/* Own profile: quick links */}
            {isOwnProfile && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Quick links</p>
                  {[
                    { href: '/courses', label: 'My Courses' },
                    { href: '/groups', label: 'My Groups' },
                    { href: '/messages', label: 'Messages' },
                    { href: '/settings/profile', label: 'Edit Profile' },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5"
                    >
                      {label} →
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
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
    .select('full_name, bio, institution, department')
    .eq('username', username)
    .single()

  return {
    title: `${profile?.full_name || username} - LearnLoop`,
    description: profile?.bio || [profile?.department, profile?.institution].filter(Boolean).join(', ') || `${username}'s profile on LearnLoop`,
  }
}


function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// Profile page loading skeleton
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="h-40 md:h-52 bg-muted animate-pulse" />
      <div className="container mx-auto px-4 pb-12 max-w-5xl">
        <Card className="-mt-16 mb-6 relative z-10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="h-24 w-24 rounded-full bg-muted animate-pulse border-4 border-background flex-shrink-0" />
              <div className="flex-grow space-y-3 pt-2">
                <div className="h-7 w-40 bg-muted animate-pulse rounded" />
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                <div className="h-4 w-56 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="md:col-span-1 space-y-6">
            <div className="h-28 bg-muted animate-pulse rounded-lg" />
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
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
    .limit(5)

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

      {/* Banner */}
      {profile.banner_url ? (
        <img src={profile.banner_url} alt="Cover photo" className="w-full h-40 md:h-52 object-cover" />
      ) : (
        <div className="h-40 md:h-52 bg-gradient-to-r from-primary/80 to-primary" />
      )}

      <div className="container mx-auto px-4 pb-12 max-w-5xl">

        {/* Profile Header Card — full width, overlapping banner */}
        <Card className="-mt-16 mb-6 relative z-10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">

              {/* Avatar */}
              <div className="flex-shrink-0 w-24 h-24 rounded-full border-4 border-background overflow-hidden">
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

              {/* Info block */}
              <div className="flex-grow min-w-0">
                {/* Name + verified */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
                  {profile.is_verified && (
                    <VerifiedBadge verificationType={profile.verification_type} />
                  )}
                </div>

                {/* @username */}
                <p className="text-sm text-muted-foreground mb-1">@{profile.username}</p>

                {/* Academic context */}
                {(profile.institution || profile.faculty || profile.department || profile.level) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                    {profile.institution && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />{profile.institution}
                      </span>
                    )}
                    {profile.faculty && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />{profile.faculty}
                      </span>
                    )}
                    {profile.department && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />{profile.department}
                      </span>
                    )}
                    {profile.level && (
                      <span className="flex items-center gap-1">{profile.level}</span>
                    )}
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm mb-2">{profile.bio}</p>
                )}

                {/* Location + Website */}
                {(profile.location || profile.website_url) && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />{profile.location}
                      </span>
                    )}
                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Globe className="h-3.5 w-3.5" />Website
                      </a>
                    )}
                  </div>
                )}

                {/* Mobile action buttons (hidden on sm+) */}
                <div className="sm:hidden mt-4 flex flex-col gap-2">
                  {isOwnProfile ? (
                    <Button asChild className="w-full">
                      <Link href="/settings/profile">Edit Profile</Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild className="w-full">
                        <Link href={`/messages/${profile.id}`}>Message</Link>
                      </Button>
                      <Button variant="outline" className="w-full">Add to Study Group</Button>
                      <Button variant="outline" className="w-full">Invite to Course</Button>
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
            </div>
          </CardContent>
        </Card>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Main column ── */}
          <div className="md:col-span-2 space-y-6">

            {/* Profile completion bar — own profile only */}
            {isOwnProfile && (() => {
              const completion = computeProfileCompletion(profile, courses.length)
              return !completion.isComplete ? (
                <ProfileCompletionBar
                  percent={completion.percent}
                  steps={completion.steps}
                  isComplete={completion.isComplete}
                />
              ) : null
            })()}

            {/* Academic Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Courses */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Current Courses
                  </h4>
                  {courses.length > 0 ? (
                    courses.map((c, i) =>
                      c.courses ? (
                        <p key={c.courses.id ?? i} className="text-sm">
                          {c.courses.code} — {c.courses.title}
                        </p>
                      ) : null
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">No courses added yet.</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Skills
                  </h4>
                  {profile.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.skills.map((s: string) => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>

                {/* Academic Interests */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Academic Interests
                  </h4>
                  {profile.interests?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.interests.map((i: string) => (
                        <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {i}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contributions & Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Contributions &amp; Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Posts Shared', value: profile.total_posts || 0 },
                    { label: 'Helpful Replies', value: profile.total_comments || 0 },
                    { label: 'Reputation', value: profile.reputation_points || 0 },
                    { label: 'Questions Answered', value: Math.floor((profile.total_comments || 0) * 0.4) },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-3 rounded-lg bg-muted/40">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3">
                {posts && posts.length > 0 ? (
                  posts.map((post: { id: string; title: string | null; excerpt: string | null; created_at: string; upvote_count: number; comment_count: number }) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0"
                    >
                      <p className="font-medium text-sm line-clamp-1">
                        {post.title || post.excerpt || 'Untitled post'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {timeAgo(post.created_at)} · {post.comment_count} replies
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">No posts yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar column ── */}
          <div className="md:col-span-1 space-y-6">

            {/* Action Card — hidden on mobile (mobile shows buttons in header) */}
            {isOwnProfile ? (
              <Card>
                <CardContent className="pt-4 space-y-2">
                  <Button className="w-full" asChild>
                    <Link href="/settings/profile">Edit Profile</Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/settings">Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="hidden md:block">
                <CardContent className="pt-4 space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/messages/${profile.id}`}>Message</Link>
                  </Button>
                  <Button className="w-full" variant="outline">Add to Study Group</Button>
                  <Button className="w-full" variant="outline">Invite to Course</Button>
                  <div className="pt-2 border-t flex gap-2">
                    <Link
                      href={`/reports?user=${profile.username}`}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Report
                    </Link>
                    <span className="text-xs text-muted-foreground">·</span>
                    <button className="text-xs text-muted-foreground hover:text-destructive">Block</button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Groups & Communities */}
            <Card>
              <CardHeader>
                <CardTitle>Groups &amp; Communities</CardTitle>
              </CardHeader>
              <CardContent>
                {groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not in any groups yet.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {activeGroups.slice(0, 5).map((g, i) =>
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
                      <details className="mt-3 text-sm">
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
          </div>

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
