import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle2, Circle, BookOpen, Users, MessageSquare, GraduationCap, Building2 } from 'lucide-react'
import { Suspense } from 'react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { DashboardPrompt } from '@/components/dashboard-prompt'
import { computeProfileCompletion } from '@/lib/profile-completion'

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column skeleton */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-lg border p-6 space-y-3">
              <div className="h-7 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              <div className="flex gap-2 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-28 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-6 space-y-3">
              <div className="h-5 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="rounded-lg border p-6 space-y-3">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
          {/* Right column skeleton */}
          <div className="hidden md:block space-y-6">
            <div className="rounded-lg border p-6 space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="rounded-lg border p-6 space-y-3">
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full bg-muted animate-pulse rounded" />
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

  // Enrolled courses
  let userCourses: any[] = []
  try {
    const { data: cm } = await supabase
      .from('course_members')
      .select('courses(id, code, title, department)')
      .eq('user_id', profile?.id)
      .limit(6)
    userCourses = (cm ?? []).map((m: any) => m.courses).filter(Boolean)
  } catch { userCourses = [] }

  // Groups
  let userGroups: any[] = []
  try {
    const { data: gm } = await supabase
      .from('group_members')
      .select('groups(id, name, group_type)')
      .eq('user_id', profile?.id)
      .limit(4)
    userGroups = (gm ?? []).map((m: any) => m.groups).filter(Boolean)
  } catch { userGroups = [] }

  // Recent posts (school-scoped activity placeholder)
  let recentActivity: any[] = []
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, created_at, profiles(username, full_name)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5)
    recentActivity = posts ?? []
  } catch { recentActivity = [] }

  // Recent conversations preview
  let conversations: any[] = []
  try {
    const { data: convs } = await supabase
      .from('conversations')
      .select('id, last_message, last_message_at, participants:conversation_participants(profiles(username, full_name, avatar_url))')
      .contains('participant_ids', [profile?.id])
      .order('last_message_at', { ascending: false })
      .limit(3)
    conversations = convs ?? []
  } catch { conversations = [] }

  // Greeting based on server-side time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Academic context line
  const academicContext =
    profile?.department && profile?.level
      ? `${profile.department} · ${profile.level}`
      : profile?.department || profile?.level || profile?.institution || null

  // Setup checklist
  const steps = [
    { label: 'Profile photo', done: !!profile?.avatar_url },
    { label: 'Bio', done: !!profile?.bio },
    { label: 'Institution', done: !!profile?.institution },
    { label: 'First course', done: userCourses.length > 0 },
    { label: 'First post', done: (profile?.total_posts ?? 0) > 0 },
  ]
  const completedCount = steps.filter((s) => s.done).length
  const showChecklist = completedCount < steps.length

  // Profile completion for prompt
  const completion = computeProfileCompletion(profile ?? {}, userCourses.length)

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={profile ?? undefined} />

      {/* Dismissible completion prompt — shows one step at a time */}
      {!completion.isComplete && completion.nextStep && (
        <div className="container mx-auto max-w-5xl px-4 pt-4">
          <DashboardPrompt
            stepId={completion.nextStep.id}
            message={completion.nextStep.prompt}
            href={completion.nextStep.href}
          />
        </div>
      )}

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left / Main column ── */}
          <div className="md:col-span-2 space-y-6">

            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-1">
                  {greeting}, {profile?.full_name || profile?.username}!
                </h1>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  {academicContext ? (
                    <>
                      {profile?.department || profile?.level ? (
                        <GraduationCap className="h-4 w-4 shrink-0" />
                      ) : (
                        <Building2 className="h-4 w-4 shrink-0" />
                      )}
                      {academicContext}
                    </>
                  ) : (
                    <Link href="/settings/profile" className="text-primary hover:underline">
                      Complete your academic profile
                    </Link>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/courses">
                      <BookOpen className="h-4 w-4 mr-1" /> View Courses
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/messages">
                      <MessageSquare className="h-4 w-4 mr-1" /> Messages
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/groups">
                      <Users className="h-4 w-4 mr-1" /> Study Groups
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today & Upcoming */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Today &amp; Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No academic deadlines today. 📅</p>
                <Link href="/courses" className="text-xs text-primary hover:underline mt-3 inline-block">
                  + Add course
                </Link>
              </CardContent>
            </Card>

            {/* Courses Overview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {userCourses.length > 0 ? (
                  <ul className="space-y-2">
                    {userCourses.map((course: any) => (
                      <li key={course.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-mono font-semibold text-primary">
                            {course.code}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{course.title}</p>
                            {course.department && (
                              <p className="truncate text-xs text-muted-foreground">{course.department}</p>
                            )}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="ghost" className="shrink-0 ml-2">
                          <Link href="/courses">Open</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-sm text-muted-foreground">No courses added yet.</p>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <p className="text-xs text-muted-foreground">From your school community</p>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <ul className="space-y-2">
                    {recentActivity.map((post: any) => {
                      const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
                      return (
                        <li key={post.id}>
                          <Link
                            href={`/posts/${post.id}`}
                            className="flex items-baseline gap-1 text-sm hover:underline"
                          >
                            <span className="font-medium shrink-0">
                              {author?.full_name || author?.username || 'Unknown'}
                            </span>
                            <span className="text-muted-foreground truncate">posted: {post.title}</span>
                            <span className="shrink-0 text-xs text-muted-foreground ml-auto">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity.</p>
                )}
              </CardContent>
            </Card>

          </div>

          {/* ── Right sidebar (hidden on mobile) ── */}
          <div className="hidden md:block space-y-6">

            {/* Profile Snapshot */}
            <Card>
              <CardContent className="pt-5">
                <div className="flex flex-col items-center text-center gap-2">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary overflow-hidden">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      (profile?.full_name || profile?.username || '?')[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{profile?.full_name || profile?.username}</p>
                    <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile?.institution && profile?.level
                      ? `${profile.institution} · ${profile.level}`
                      : profile?.institution || profile?.level || (
                          <Link href="/settings/profile" className="text-primary hover:underline">
                            Add academic info
                          </Link>
                        )}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-medium">
                    {profile?.reputation_points ?? 0} rep
                  </span>
                  <Button asChild size="sm" variant="outline" className="w-full mt-1">
                    <Link href="/settings/profile">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Messages Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversations.length > 0 ? (
                  <>
                    {conversations.map((conv: any) => {
                      const participants: any[] = (conv.participants ?? [])
                        .map((p: any) => (Array.isArray(p.profiles) ? p.profiles[0] : p.profiles))
                        .filter((p: any) => p && p.username !== profile?.username)
                      const other = participants[0]
                      return (
                        <Link key={conv.id} href="/messages" className="flex items-center gap-2 hover:bg-muted/50 rounded p-1 -mx-1">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {other?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={other.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (other?.full_name || other?.username || '?')[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{other?.full_name || other?.username}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {(conv.last_message ?? '').slice(0, 40)}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                    <Link href="/messages" className="text-xs text-primary hover:underline block pt-1">
                      View all messages →
                    </Link>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">No conversations yet.</p>
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href="/messages">Start a conversation</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Groups & Communities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userGroups.length > 0 ? (
                  <>
                    {userGroups.map((group: any) => (
                      <div key={group.id} className="flex items-center justify-between">
                        <span className="text-xs truncate font-medium">{group.name}</span>
                        {group.group_type && (
                          <span className="ml-2 shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                            {group.group_type}
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <Link href="/groups" className="text-xs text-primary hover:underline">View all</Link>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Link href="/groups/create" className="text-xs text-primary hover:underline">Create group</Link>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Not in any groups yet.</p>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                        <Link href="/groups">Find groups</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
                        <Link href="/groups/create">Create</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Setup Checklist */}
            {showChecklist && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Complete your setup</CardTitle>
                  <p className="text-xs text-muted-foreground">{completedCount} of {steps.length} done</p>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-1.5 rounded-full bg-muted mb-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.round((completedCount / steps.length) * 100)}%` }}
                    />
                  </div>
                  <ul className="space-y-1.5">
                    {steps.map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={step.done ? 'line-through text-muted-foreground' : ''}>{step.label}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="sm" variant="outline" className="w-full mt-3">
                    <Link href="/settings/profile">Complete profile</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>

      <BottomNav username={profile?.username} />
    </div>
  )
}
