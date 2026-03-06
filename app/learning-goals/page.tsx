'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Suspense } from 'react'

function LearningGoalsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-muted/40 animate-pulse" />
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-4">
        <div className="h-8 w-40 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default async function LearningGoalsPage() {
  return (
    <Suspense fallback={<LearningGoalsLoading />}>
      <LearningGoalsContent />
    </Suspense>
  )
}

function LearningGoalsContent() {
  const [profile, setProfile] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    target_date: '',
    priority: 'medium',
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
      fetchGoals(user.id)
    }

    init()
  }, [])

  const fetchGoals = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date', { ascending: true })

      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase.from('learning_goals').insert({
      ...formData,
      user_id: user.id,
      status: 'active',
    })

    if (!error) {
      setFormData({
        title: '',
        description: '',
        subject: '',
        target_date: '',
        priority: 'medium',
      })
      setShowForm(false)
      fetchGoals(user.id)
    }
  }

  const updateGoalStatus = async (goalId: string, newStatus: string) => {
    const { error } = await supabase
      .from('learning_goals')
      .update({ status: newStatus })
      .eq('id', goalId)

    if (!error) {
      fetchGoals(profile.id)
    }
  }

  const updateProgress = async (goalId: string, newProgress: number) => {
    const { error } = await supabase
      .from('learning_goals')
      .update({ progress_percentage: Math.min(newProgress, 100) })
      .eq('id', goalId)

    if (!error) {
      fetchGoals(profile.id)
    }
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={profile} />

      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              Learning Goals
            </h1>
            <p className="text-muted-foreground">Set and track your academic objectives</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Complete Calculus II"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    placeholder="What do you want to achieve?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Goal</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals Lists */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading goals...</p>
          </div>
        ) : (
          <>
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Active Goals ({activeGoals.length})
                </h2>
                {activeGoals.map((goal) => {
                  const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const isOverdue = daysLeft < 0

                  return (
                    <Card key={goal.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-grow">
                              <h3 className="font-semibold text-lg">{goal.title}</h3>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${priorityColors[goal.priority]}`}>
                              {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)} Priority
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-sm">
                            {goal.subject && (
                              <span className="bg-muted px-2 py-1 rounded text-xs">{goal.subject}</span>
                            )}
                            <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {isOverdue ? (
                                <>
                                  <AlertCircle className="h-4 w-4 inline mr-1" />
                                  {Math.abs(daysLeft)} days overdue
                                </>
                              ) : (
                                <>{daysLeft} days left</>
                              )}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">{goal.progress_percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${goal.progress_percentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProgress(goal.id, goal.progress_percentage + 10)}
                              className="flex-grow"
                            >
                              +10%
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateGoalStatus(goal.id, 'completed')}
                              className="flex-grow"
                            >
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateGoalStatus(goal.id, 'abandoned')}
                            >
                              Abandon
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Completed ({completedGoals.length})
                </h2>
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-70">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <h3 className="font-semibold line-through text-muted-foreground">{goal.title}</h3>
                        </div>
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {goals.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No goals yet. Create your first goal to get started!</p>
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
