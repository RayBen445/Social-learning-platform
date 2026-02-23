import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen, Plus, Users } from 'lucide-react'
import { Suspense } from 'react'

function CoursesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, institution, department')
    .eq('id', user.id)
    .single()

  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesContent userId={user.id} profile={profile} />
    </Suspense>
  )
}

async function CoursesContent({ userId, profile }: { userId: string; profile: any }) {
  const supabase = await createClient()

  // Fetch enrolled courses
  let enrolledCourses: any[] = []
  try {
    const { data } = await supabase
      .from('course_members')
      .select('courses(id, code, title, department, level, instructor, member_count)')
      .eq('user_id', userId)
    enrolledCourses = (data ?? []).map((r: any) => r.courses).filter(Boolean)
  } catch { enrolledCourses = [] }

  // Fetch available courses (same department)
  let availableCourses: any[] = []
  try {
    const { data } = await supabase
      .from('courses')
      .select('id, code, title, department, level, instructor, member_count')
      .eq('department', profile?.department ?? '')
      .limit(10)
    const enrolledIds = new Set(enrolledCourses.map((c: any) => c.id))
    availableCourses = (data ?? []).filter((c: any) => !enrolledIds.has(c.id))
  } catch { availableCourses = [] }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={profile ?? undefined} />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Courses</h1>
            <p className="text-muted-foreground text-sm">Your academic courses this semester</p>
          </div>
          <Button asChild size="sm">
            <Link href="/courses/browse">
              <Plus className="h-4 w-4 mr-1" />
              Add course
            </Link>
          </Button>
        </div>

        {/* My Courses */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            My Courses
          </h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {enrolledCourses.map((course: any) => (
                <Card key={course.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                            {course.code}
                          </span>
                          {course.level && (
                            <span className="text-xs text-muted-foreground">{course.level}</span>
                          )}
                        </div>
                        <p className="font-semibold text-sm leading-tight">{course.title}</p>
                        {course.instructor && (
                          <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {course.member_count ?? 0}
                        </span>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/courses/${course.id}`}>Open</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center space-y-3">
                <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <p className="text-muted-foreground">You haven&apos;t added any courses yet.</p>
                <Button asChild size="sm">
                  <Link href="/courses/browse">Browse courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Available courses in same department */}
        {availableCourses.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {profile?.department ? `${profile.department} — Available` : 'Available Courses'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {availableCourses.map((course: any) => (
                <Card key={course.id} className="opacity-80 hover:opacity-100 transition-opacity">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">
                          {course.code}
                        </span>
                        <p className="font-semibold text-sm mt-1 leading-tight">{course.title}</p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/courses/${course.id}`}>Enrol</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty state — no department set */}
        {!profile?.department && enrolledCourses.length === 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6 text-center space-y-2">
              <p className="text-sm">Add your department to see available courses.</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/settings/academic">Set department</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav username={profile?.username} />
    </div>
  )
}
