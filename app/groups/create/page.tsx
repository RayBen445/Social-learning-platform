'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'

type GroupType = 'course' | 'study' | 'project' | 'department' | 'organization'

export default function CreateGroupPage() {
  const [navbarUser, setNavbarUser] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [groupType, setGroupType] = useState<GroupType | ''>('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, institution')
        .eq('id', user.id)
        .single()
      if (profile) setNavbarUser(profile)
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !groupType) { setError('Name and type are required'); return }
    setIsSubmitting(true)
    setError(null)
    try {
      const { data: group, error: err } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          group_type: groupType,
          created_by: userId,
          institution: navbarUser?.institution ?? null,
          is_private: isPrivate,
          member_count: 1,
        })
        .select('id')
        .single()
      if (err) throw err
      // Add creator as admin member
      await supabase.from('group_members').insert({ group_id: group.id, user_id: userId, role: 'admin' })
      router.push(`/groups/${group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-lg px-4 py-10">
          <div className="h-64 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={navbarUser ?? undefined} />
      <div className="container mx-auto max-w-lg px-4 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Groups
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Create a Group</h1>
          <p className="text-muted-foreground text-sm">Start a course group, study group, or project team</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Group details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CSC301 Study Group" />
              </div>

              <div className="space-y-2">
                <Label>Group type *</Label>
                <Select value={groupType} onValueChange={(v) => setGroupType(v as GroupType)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course group</SelectItem>
                    <SelectItem value="study">Study group</SelectItem>
                    <SelectItem value="project">Project group</SelectItem>
                    <SelectItem value="department">Department group</SelectItem>
                    <SelectItem value="organization">Student organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group for?"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="private" className="cursor-pointer">
                  Private group (invite only)
                </Label>
              </div>

              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create group
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNav username={navbarUser?.username} />
    </div>
  )
}
