'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ShareButtonProps {
  postId: string
  postTitle: string
}

export default function ShareButton({ postId, postTitle }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/posts/${postId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: `Check out this post on LearnLoop`,
          url: postUrl,
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(postUrl)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      title={isCopied ? 'Copied!' : 'Share'}
    >
      {isCopied ? '✓' : '🔗'}
    </Button>
  )
}
