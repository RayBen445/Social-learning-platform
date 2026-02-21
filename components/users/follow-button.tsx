'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface FollowButtonProps {
  userId: string
  currentUser: any
}

export default function FollowButton({ userId, currentUser }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser) return

      try {
        const { data } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .single()

        setIsFollowing(!!data)
      } catch (error) {
        console.error('Failed to check follow status:', error)
      }
    }

    checkFollowStatus()
  }, [userId, currentUser, supabase])

  const handleFollow = async () => {
    if (!currentUser) return

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
        setIsFollowing(false)
      } else {
        // Follow
        await supabase.from('follows').insert({
          follower_id: currentUser.id,
          following_id: userId,
        })
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
