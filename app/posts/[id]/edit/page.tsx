'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditPostPage() {
  const [navbarUser, setNavbarUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notAllowed, setNotAllowed] = useState(false)
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const fetchPost = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      if (profile) setNavbarUser(profile)

      const { data: post } = await supabase
        .from('posts')
        .select('id, title, content, created_at, user_id')
        .eq('id', postId)
        .single()

      if (!post) { router.push('/dashboard'); return }
      if (post.user_id !== user.id) { setNotAllowed(true); setIsLoading(false); return }

      // Enforce 30-minute edit window
      const ageMs = Date.now() - new Date(post.created_at).getTime()
      if (ageMs > 30 * 60 * 1000) { setNotAllowed(true); setIsLoading(false); return }

      setTitle(post.title ?? '')
      setContent(post.content ?? '')
      setIsLoading(false)
    }
    fetchPost()
  }, [postId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) { setError('Content cannot be empty'); return }
    setIsSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('posts')
      .update({
        title: title.trim() || null,
        content: content.trim(),
        excerpt: content.trim().slice(0, 150),
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
    if (err) setError(err.message)
    else router.push(`/posts/${postId}`)
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <div className="h-64 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  if (notAllowed) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar user={navbarUser ?? undefined} />
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
          <p className="text-muted-foreground">This post can no longer be edited (30-minute edit window has passed).</p>
          <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={navbarUser ?? undefined} />
      <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to post
        </button>

        <div>
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground text-sm">You can edit this post within 30 minutes of posting</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Edit content</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a title…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="What do you want to share?"
                />
              </div>
              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save changes
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
