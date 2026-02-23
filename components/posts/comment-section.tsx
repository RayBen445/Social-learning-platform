'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

interface CommentSectionProps {
  postId: string
  currentUser: any
  /** Profile row — used to display the correct avatar and initials */
  currentProfile?: { username?: string; full_name?: string; avatar_url?: string } | null
}

export default function CommentSection({ postId, currentUser, currentProfile }: CommentSectionProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!content.trim()) {
      setError('Comment cannot be empty')
      setIsLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: currentUser.id,
        content: content.trim(),
      })

      if (insertError) throw insertError

      setContent('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  const avatarUrl = currentProfile?.avatar_url
  const initial = (currentProfile?.full_name || currentProfile?.username || currentUser?.email || '?')
    .charAt(0)
    .toUpperCase()

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-muted flex-shrink-0 overflow-hidden border border-border">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Your avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {initial}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <Textarea
                placeholder="Add to the discussion…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive ml-12">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isLoading || !content.trim()}>
              {isLoading ? 'Posting…' : 'Reply'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
