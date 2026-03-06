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
import { FileText, Link as LinkIcon, Video, BookOpen, FileUp, Plus, Download, Pin } from 'lucide-react'

const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="h-5 w-5" />,
  link: <LinkIcon className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  textbook: <BookOpen className="h-5 w-5" />,
  notes: <FileText className="h-5 w-5" />,
  other: <FileUp className="h-5 w-5" />,
}

export function GroupResourcesComponent({ groupId }: { groupId: string }) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'notes',
    resource_url: '',
  })

  useEffect(() => {
    fetchResources()
  }, [groupId])

  const fetchResources = async () => {
    try {
      const { data } = await supabase
        .from('group_resources')
        .select('*, uploaded_by:profiles(username, avatar_url)')
        .eq('group_id', groupId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase.from('group_resources').insert({
      ...formData,
      group_id: groupId,
      uploaded_by: user.id,
    })

    if (!error) {
      setFormData({
        title: '',
        description: '',
        resource_type: 'notes',
        resource_url: '',
      })
      setShowForm(false)
      fetchResources()
    }
  }

  const togglePin = async (resourceId: string, isPinned: boolean) => {
    const { error } = await supabase
      .from('group_resources')
      .update({ is_pinned: !isPinned })
      .eq('id', resourceId)

    if (!error) {
      fetchResources()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resources</h2>
          <p className="text-muted-foreground text-sm">Study materials and shared content</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Chapter 5 Summary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="resource_type">Resource Type</Label>
                  <Select value={formData.resource_type} onValueChange={(value) => setFormData({ ...formData, resource_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="textbook">Textbook</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resource_url">URL or Link</Label>
                  <Input
                    id="resource_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.resource_url}
                    onChange={(e) => setFormData({ ...formData, resource_url: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="What is this resource about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Resource</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      ) : resources.length > 0 ? (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="text-primary/70 flex-shrink-0">
                    {RESOURCE_ICONS[resource.resource_type] || RESOURCE_ICONS.other}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold">{resource.title}</h3>
                      {resource.is_pinned && (
                        <Pin className="h-4 w-4 text-primary flex-shrink-0 fill-current" />
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{resource.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="bg-muted px-2 py-1 rounded capitalize text-xs">
                          {resource.resource_type}
                        </span>
                        {resource.uploaded_by && (
                          <span>By {resource.uploaded_by.username}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePin(resource.id, resource.is_pinned)}
                          className="h-8 w-8 p-0"
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={resource.resource_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
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
            <p className="text-muted-foreground">No resources shared yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
