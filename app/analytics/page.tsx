'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Calendar, Target, BookOpen } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Suspense } from 'react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function LearningDashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function LearningDashboardPage() {
  return (
    <Suspense fallback={<LearningDashboardLoading />}>
      <LearningDashboardContent />
    </Suspense>
  )
}

function LearningDashboardContent() {
  const [profile, setProfile] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // Fetch analytics
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setAnalytics(analyticsData)

      // Fetch recent sessions
      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(30)

      setSessions(sessionsData || [])

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      setGoals(goalsData || [])

      setIsLoading(false)
    }

    init()
  }, [])

  // Prepare chart data
  const chartData = sessions
    .slice()
    .reverse()
    .map((session, idx) => ({
      date: new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      duration: Math.round(session.duration_minutes / 60),
      focus: session.focus_score,
      efficiency: session.efficiency_score,
    }))

  const subjectBreakdown = sessions.reduce((acc: Record<string, number>, session) => {
    const subject = session.subject || 'General'
    acc[subject] = (acc[subject] || 0) + session.duration_minutes
    return acc
  }, {})

  const subjectData = Object.entries(subjectBreakdown).map(([subject, minutes]) => ({
    name: subject,
    value: Math.round(minutes as number / 60),
  }))

  const completedGoals = goals.filter(g => g.status === 'completed').length
  const goalProgress = goals.length > 0 
    ? Math.round((goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length))
    : 0

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={profile} />

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Learning Analytics
          </h1>
          <p className="text-muted-foreground">Track your academic progress</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">Total Study Hours</p>
                    <p className="text-3xl font-bold">{analytics?.total_study_hours || 0}h</p>
                    <p className="text-xs text-muted-foreground">
                      Avg {Math.round(((analytics?.total_study_hours || 0) * 60) / (analytics?.total_sessions || 1))} min/session
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">Sessions Logged</p>
                    <p className="text-3xl font-bold">{analytics?.total_sessions || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {sessions.length > 0 ? `Last 30 days: ${sessions.length}` : 'No data yet'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">Avg Focus Score</p>
                    <p className="text-3xl font-bold">
                      {sessions.length > 0
                        ? Math.round(
                            sessions.reduce((sum, s) => sum + (s.focus_score || 0), 0) / sessions.length
                          )
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {analytics?.total_sessions ? 'Based on recent sessions' : 'No data yet'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-primary" />
                      <p className="text-muted-foreground text-sm">Goal Progress</p>
                    </div>
                    <p className="text-3xl font-bold">{goalProgress}%</p>
                    <p className="text-xs text-muted-foreground">
                      {goals.length} active goal{goals.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Study Duration Trend */}
              {chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Study Duration Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="duration" 
                          stroke="#3b82f6" 
                          name="Hours"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Quality Metrics */}
              {chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Focus & Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="focus" 
                          stroke="#10b981" 
                          name="Focus %"
                          dot={{ r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#f59e0b" 
                          name="Efficiency %"
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Subject Breakdown */}
              {subjectData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Study by Subject</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={subjectData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}h`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {subjectData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Learning Goals Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Active Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goals.length > 0 ? (
                    <div className="space-y-3">
                      {goals.slice(0, 5).map((goal) => (
                        <div key={goal.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium line-clamp-1">{goal.title}</span>
                            <span className="text-xs text-muted-foreground">{goal.progress_percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${goal.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active goals. Create one to get started!</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            {sessions.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {sessions.length >= 20 && (
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>You're maintaining excellent study consistency! Keep up the momentum with your learning goals.</span>
                      </li>
                    )}
                    {analytics && analytics.total_study_hours > 50 && (
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>You've invested significant time in learning. Consider focusing on specific subjects or skills next.</span>
                      </li>
                    )}
                    {sessions.length > 0 && chartData[chartData.length - 1]?.focus < 70 && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <span>Your focus score has been lower recently. Try studying in shorter sessions or in a quieter environment.</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <BottomNav username={profile?.username} />
    </div>
  )
}
