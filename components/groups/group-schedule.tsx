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
import { Calendar, Clock, Users, MapPin, Video, Plus } from 'lucide-react'
import Link from 'next/link'

export function GroupScheduleComponent({ groupId }: { groupId: string }) {
  const [schedules, setSchedules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    session_type: 'study',
    location: '',
    is_virtual: true,
    meeting_link: '',
    max_participants: 10,
  })

  useEffect(() => {
    fetchSchedules()
  }, [groupId])

  const fetchSchedules = async () => {
    try {
      const { data } = await supabase
        .from('group_schedules')
        .select('*, created_by:profiles(username, avatar_url)')
        .eq('group_id', groupId)
        .order('scheduled_at', { ascending: true })
      
      setSchedules(data || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase.from('group_schedules').insert({
      ...formData,
      group_id: groupId,
      created_by: user.id,
    })

    if (!error) {
      setFormData({
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        session_type: 'study',
        location: '',
        is_virtual: true,
        meeting_link: '',
        max_participants: 10,
      })
      setShowForm(false)
      fetchSchedules()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Sessions</h2>
          <p className="text-muted-foreground text-sm">Schedule and join study sessions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Math Problem Set Review"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="session_type">Session Type</Label>
                  <Select value={formData.session_type} onValueChange={(value) => setFormData({ ...formData, session_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study Session</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="project">Project Work</SelectItem>
                      <SelectItem value="exam_prep">Exam Prep</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_at">Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    required
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

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="What will you cover in this session?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_virtual"
                    checked={formData.is_virtual}
                    onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_virtual" className="cursor-pointer">Virtual Session</Label>
                </div>

                {formData.is_virtual && (
                  <div>
                    <Label htmlFor="meeting_link">Meeting Link</Label>
                    <Input
                      id="meeting_link"
                      placeholder="https://zoom.us/..."
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    />
                  </div>
                )}

                {!formData.is_virtual && (
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Library Room 202"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Session</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      ) : schedules.length > 0 ? (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg mb-2">{schedule.title}</h3>
                    {schedule.description && (
                      <p className="text-sm text-muted-foreground mb-3">{schedule.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(schedule.scheduled_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(schedule.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {schedule.is_virtual ? (
                          <>
                            <Video className="h-4 w-4" />
                            <span>Virtual</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4" />
                            <span>{schedule.location}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{schedule.max_participants} max</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`#schedule-${schedule.id}`}>Join</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No scheduled sessions yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
