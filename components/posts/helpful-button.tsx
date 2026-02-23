'use client'

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'

interface HelpfulButtonProps {
  commentId: string
}

export function HelpfulButton({ commentId: _commentId }: HelpfulButtonProps) {
  const [marked, setMarked] = useState(false)

  return (
    <button
      onClick={() => setMarked((v) => !v)}
      className={`flex items-center gap-1 text-xs transition-colors ${
        marked
          ? 'text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground'
      }`}
      title={marked ? 'Marked as helpful' : 'Mark as helpful'}
    >
      <ThumbsUp className="h-3 w-3" />
      {marked ? 'Helpful' : 'Mark helpful'}
    </button>
  )
}
