'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, BookOpen, Plus, TrendingUp } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import Link from 'next/link'
import { Suspense } from 'react'

function StudySessionsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default async function StudySessionsPage() {
  return (
    <Suspense fallback={<StudySessionsLoading />}>
      <StudySessionsContent />
    </Suspense>
  )
}

function StudySessionsContent() {
  const [profile, setProfile] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({
    total_hours: 0,
    total_sessions: 0,
    streak_days: 0,
  })
  const supabase = createClient()

  const [formData, setFormData] = useState({
    subject: '',
    duration_minutes: 60,
    focus_score: 100,
    efficiency_score: 100,
    notes: '',
  })

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
      
      await Promise.all([
        fetchSessions(user.id),
        fetchStats(user.id),
      ])
    }

    init()
  }, [])

  const fetchSessions = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(20)

      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async (userId: string) => {
    try {
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .single()

      const { data: streakData } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (analyticsData || streakData) {
        setStats({
          total_hours: analyticsData?.total_study_hours || 0,
          total_sessions: analyticsData?.total_sessions || 0,
          streak_days: streakData?.current_streak || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const now = new Date()
    const started_at = new Date(now.getTime() - formData.duration_minutes * 60 * 1000)

    const { error } = await supabase.from('study_sessions').insert({
      ...formData,
      user_id: user.id,
      started_at,
      ended_at: now,
    })

    if (!error) {
      setFormData({
        subject: '',
        duration_minutes: 60,
        focus_score: 100,
        efficiency_score: 100,
        notes: '',
      })
      setShowForm(false)
      fetchSessions(user.id)
      
      // Update analytics
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const newAnalytics = {
        total_study_hours: (analyticsData?.total_study_hours || 0) + Math.round(formData.duration_minutes / 60),
        total_sessions: (analyticsData?.total_sessions || 0) + 1,
      }

      await supabase
        .from('user_analytics')
        .update(newAnalytics)
        .eq('user_id', user.id)

      setStats(prev => ({
        ...prev,
        total_hours: newAnalytics.total_study_hours,
        total_sessions: newAnalytics.total_sessions,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={profile} />

      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              Study Sessions
            </h1>
            <p className="text-muted-foreground">Track your learning progress</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Session
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Total Study Hours</p>
                <p className="text-3xl font-bold">{stats.total_hours}h</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Sessions Logged</p>
                <p className="text-3xl font-bold">{stats.total_sessions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <p className="text-muted-foreground text-sm">Study Streak</p>
                </div>
                <p className="text-3xl font-bold">{stats.streak_days}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics, Biology"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="480"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="focus_score">Focus Score (0-100)</Label>
                    <Input
                      id="focus_score"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.focus_score}
                      onChange={(e) => setFormData({ ...formData, focus_score: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="efficiency_score">Efficiency Score (0-100)</Label>
                    <Input
                      id="efficiency_score"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.efficiency_score}
                      onChange={(e) => setFormData({ ...formData, efficiency_score: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    placeholder="What did you learn? Any challenges?"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Log Session</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Recent Sessions</h2>
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold mb-1">{session.subject || 'General Study'}</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-2">
                        <span>Duration: {session.duration_minutes} min</span>
                        <span>Focus: {session.focus_score}%</span>
                        <span>Efficiency: {session.efficiency_score}%</span>
                        <span>{new Date(session.started_at).toLocaleDateString()}</span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-foreground">{session.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No sessions logged yet. Start tracking your study time!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav username={profile?.username} />
    </div>
  )
}
