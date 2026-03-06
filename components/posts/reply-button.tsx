'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ReplyButtonProps {
  postId: string
  parentCommentId: string
  currentUserId?: string
}

export function ReplyButton({ postId, parentCommentId, currentUserId }: ReplyButtonProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  if (!currentUserId) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setIsLoading(true)
    try {
      await supabase.from('comments').insert({
        post_id: postId,
        user_id: currentUserId,
        parent_comment_id: parentCommentId,
        content: content.trim(),
      })
      setContent('')
      setOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Reply
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2 pl-1">
          <Textarea
            placeholder="Write a reply…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="resize-none text-sm"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isLoading || !content.trim()}>
              {isLoading ? 'Posting…' : 'Post reply'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => { setOpen(false); setContent('') }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
