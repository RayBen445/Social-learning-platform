'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AppNavbar } from '@/components/app-navbar'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [topics, setTopics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topics_loading, setTopicsLoading] = useState(true)
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchNavbarUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      if (profile) setNavbarUser(profile)
    }
    fetchNavbarUser()
  }, [])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data, error } = await supabase
          .from('topics')
          .select('id, name, slug')
          .limit(50)

        if (error) throw error
        setTopics(data || [])
      } catch (err) {
        console.error('Failed to load topics:', err)
      } finally {
        setTopicsLoading(false)
      }
    }

    fetchTopics()
  }, [])

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Validate inputs
      if (!title.trim() || !content.trim()) {
        setError('Title and content are required')
        setIsLoading(false)
        return
      }

      // Create the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.trim().substring(0, 150),
          is_published: true,
        })
        .select()
        .single()

      if (postError) throw postError

      // Add topics to the post
      if (selectedTopics.length > 0) {
        const postTopics = selectedTopics.map((topicId) => ({
          post_id: post.id,
          topic_id: topicId,
        }))

        const { error: topicError } = await supabase
          .from('post_topics')
          .insert(postTopics)

        if (topicError) throw topicError
      }

      // Redirect to the new post
      router.push(`/posts/${post.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={navbarUser ?? undefined} />
      <div className="container mx-auto max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">Share your knowledge with the community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt (optional)</Label>
                <Input
                  id="excerpt"
                  placeholder="Brief summary of your post..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, the first 150 characters of your content will be used
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="topics">Topics</Label>
                <div className="flex gap-2 flex-wrap">
                  {topics_loading ? (
                    <p className="text-sm text-muted-foreground">Loading topics...</p>
                  ) : (
                    topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          if (selectedTopics.includes(topic.id)) {
                            setSelectedTopics(selectedTopics.filter((id) => id !== topic.id))
                          } else {
                            setSelectedTopics([...selectedTopics, topic.id])
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          selectedTopics.includes(topic.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {topic.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Publishing...' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
