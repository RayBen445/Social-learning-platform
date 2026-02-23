import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Users } from 'lucide-react'

export default async function BrowseCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, institution, department, level')
    .eq('id', user.id)
    .single()

  // Fetch all courses, prioritising same department
  let courses: any[] = []
  try {
    const { data } = await supabase
      .from('courses')
      .select('id, code, title, department, level, instructor, member_count')
      .order('department', { ascending: true })
      .order('code', { ascending: true })
      .limit(50)
    courses = data ?? []
  } catch { courses = [] }

  // Group by department
  const byDept: Record<string, any[]> = {}
  for (const c of courses) {
    const dept = c.department || 'General'
    if (!byDept[dept]) byDept[dept] = []
    byDept[dept].push(c)
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={profile ?? undefined} />
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/courses" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            My Courses
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Browse Courses</h1>
          <p className="text-muted-foreground text-sm">Find and enrol in courses from your institution</p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">No courses available yet.</p>
              <p className="text-sm text-muted-foreground">Courses will appear here once they are added by your institution.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(byDept).map(([dept, deptCourses]) => (
            <section key={dept}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{dept}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {deptCourses.map((course) => (
                  <Card key={course.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-5 pb-4">
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
                          <p className="font-medium text-sm leading-tight">{course.title}</p>
                          {course.instructor && (
                            <p className="text-xs text-muted-foreground mt-0.5">{course.instructor}</p>
                          )}
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Users className="h-3 w-3" />
                            {course.member_count ?? 0} enrolled
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline" className="flex-shrink-0">
                          <Link href={`/courses/${course.id}`}>Enrol</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <BottomNav username={profile?.username} />
    </div>
  )
}
