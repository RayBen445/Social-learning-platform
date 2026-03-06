import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Users, Plus, Lock } from 'lucide-react'
import { Suspense } from 'react'

function GroupsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, institution, department')
    .eq('id', user.id)
    .single()

  return (
    <Suspense fallback={<GroupsLoading />}>
      <GroupsContent userId={user.id} profile={profile} />
    </Suspense>
  )
}

const GROUP_TYPE_LABELS: Record<string, string> = {
  course: 'Course',
  department: 'Department',
  project: 'Project',
  organization: 'Organization',
  study: 'Study',
  exam: 'Exam',
}

async function GroupsContent({ userId, profile }: { userId: string; profile: any }) {
  const supabase = await createClient()

  let myGroups: any[] = []
  try {
    const { data } = await supabase
      .from('group_members')
      .select('groups(id, name, description, group_type, member_count, is_archived)')
      .eq('user_id', userId)
    myGroups = (data ?? []).map((r: any) => r.groups).filter(Boolean)
  } catch { myGroups = [] }

  let discoverGroups: any[] = []
  try {
    const { data } = await supabase
      .from('groups')
      .select('id, name, description, group_type, member_count, institution')
      .eq('institution', profile?.institution ?? '')
      .eq('is_archived', false)
      .limit(8)
    const myGroupIds = new Set(myGroups.map((g: any) => g.id))
    discoverGroups = (data ?? []).filter((g: any) => !myGroupIds.has(g.id))
  } catch { discoverGroups = [] }

  const activeGroups = myGroups.filter((g: any) => !g.is_archived)
  const archivedGroups = myGroups.filter((g: any) => g.is_archived)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={profile ?? undefined} />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Groups</h1>
            <p className="text-muted-foreground text-sm">Course groups, study groups, and communities</p>
          </div>
          <Button asChild size="sm">
            <Link href="/groups/create">
              <Plus className="h-4 w-4 mr-1" />
              Create group
            </Link>
          </Button>
        </div>

        {/* My Groups */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            My Groups
          </h2>
          {activeGroups.length > 0 ? (
            <div className="space-y-3">
              {activeGroups.map((group: any) => (
                <Card key={group.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{group.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                              {GROUP_TYPE_LABELS[group.group_type] ?? group.group_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {group.member_count ?? 0} members
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/groups/${group.id}`}>Open</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center space-y-3">
                <Users className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground">You haven&apos;t joined any groups yet.</p>
              </CardContent>
            </Card>
          )}

          {/* Archived */}
          {archivedGroups.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground ml-1">
                {archivedGroups.length} archived group{archivedGroups.length !== 1 ? 's' : ''}
              </summary>
              <div className="mt-2 space-y-2 opacity-60">
                {archivedGroups.map((group: any) => (
                  <Card key={group.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span>{group.name}</span>
                        <span className="text-xs text-muted-foreground capitalize ml-auto">
                          {GROUP_TYPE_LABELS[group.group_type] ?? group.group_type}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </details>
          )}
        </section>

        {/* Discover */}
        {discoverGroups.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Discover — {profile?.institution ?? 'Your School'}
            </h2>
            <div className="space-y-3">
              {discoverGroups.map((group: any) => (
                <Card key={group.id} className="opacity-80 hover:opacity-100 transition-opacity">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{group.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                            {GROUP_TYPE_LABELS[group.group_type] ?? group.group_type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {group.member_count ?? 0} members
                          </span>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/groups/${group.id}`}>Join</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* No institution set */}
        {!profile?.institution && myGroups.length === 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6 text-center space-y-2">
              <p className="text-sm">Add your institution to discover groups in your school.</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/academic">Set institution</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav username={profile?.username} />
    </div>
  )
}
