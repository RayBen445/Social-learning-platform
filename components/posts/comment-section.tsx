'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

interface CommentSectionProps {
  postId: string
  currentUser: any
}

export default function CommentSection({ postId, currentUser }: CommentSectionProps) {
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
      // Optionally refresh comments here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleAddComment} className="space-y-4">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
              {currentUser?.user_metadata?.avatar_url ? (
                <img
                  src={currentUser.user_metadata.avatar_url}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-grow">
              <Textarea
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
