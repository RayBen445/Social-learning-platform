'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface PostVoteButtonProps {
  postId: string
  currentUser: any
}

export default function PostVoteButton({ postId, currentUser }: PostVoteButtonProps) {
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [isDownvoted, setIsDownvoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return

    setIsLoading(true)

    try {
      // Check if vote already exists
      const { data: existingVote } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single()

      if (existingVote) {
        // Remove vote if clicking same button
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('post_votes')
            .delete()
            .eq('id', existingVote.id)
          setIsUpvoted(false)
          setIsDownvoted(false)
        } else {
          // Change vote type
          await supabase
            .from('post_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
          setIsUpvoted(voteType === 'upvote')
          setIsDownvoted(voteType === 'downvote')
        }
      } else {
        // Create new vote
        await supabase.from('post_votes').insert({
          post_id: postId,
          user_id: currentUser.id,
          vote_type: voteType,
        })
        setIsUpvoted(voteType === 'upvote')
        setIsDownvoted(voteType === 'downvote')
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={isUpvoted ? 'bg-primary/10' : ''}
      >
        👍
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={isDownvoted ? 'bg-destructive/10' : ''}
      >
        👎
      </Button>
    </div>
  )
}
