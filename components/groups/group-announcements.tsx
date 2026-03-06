'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Megaphone, Plus, Pin } from 'lucide-react'

export function GroupAnnouncementsComponent({ groupId }: { groupId: string }) {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  useEffect(() => {
    checkAdmin()
    fetchAnnouncements()
  }, [groupId])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    setIsAdmin(data?.role === 'admin')
  }

  const fetchAnnouncements = async () => {
    try {
      const { data } = await supabase
        .from('group_announcements')
        .select('*, created_by:profiles(username, avatar_url)')
        .eq('group_id', groupId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase.from('group_announcements').insert({
      ...formData,
      group_id: groupId,
      created_by: user.id,
    })

    if (!error) {
      setFormData({
        title: '',
        content: '',
      })
      setShowForm(false)
      fetchAnnouncements()
    }
  }

  const togglePin = async (announcementId: string, isPinned: boolean) => {
    const { error } = await supabase
      .from('group_announcements')
      .update({ is_pinned: !isPinned })
      .eq('id', announcementId)

    if (!error) {
      fetchAnnouncements()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Announcements</h2>
            <p className="text-muted-foreground text-sm">Important group updates</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {isAdmin && showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Exam Date Changed"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  placeholder="Share important information with your group..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Post Announcement</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      {announcement.is_pinned && (
                        <Pin className="h-4 w-4 text-primary flex-shrink-0 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {announcement.created_by?.avatar_url && (
                          <img
                            src={announcement.created_by.avatar_url}
                            alt={announcement.created_by.username}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <span>By {announcement.created_by?.username}</span>
                        <span>·</span>
                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                      </div>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePin(announcement.id, announcement.is_pinned)}
                          className="h-8 w-8 p-0"
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
