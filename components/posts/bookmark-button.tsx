'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface BookmarkButtonProps {
  postId: string
  currentUser: any
}

export default function BookmarkButton({ postId, currentUser }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleBookmark = async () => {
    if (!currentUser) return

    setIsLoading(true)

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)
        setIsBookmarked(false)
      } else {
        // Add bookmark
        await supabase.from('bookmarks').insert({
          post_id: postId,
          user_id: currentUser.id,
        })
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Failed to bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBookmark}
      disabled={isLoading}
      className={isBookmarked ? 'bg-amber-100' : ''}
    >
      🔖
    </Button>
  )
}
