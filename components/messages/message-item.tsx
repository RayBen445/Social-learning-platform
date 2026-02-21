'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
}

interface MessageItemProps {
  message: Message
  isOwn: boolean
}

export default function MessageItem({ message, isOwn }: MessageItemProps) {
  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'just now'
    }
  }

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'rounded-lg px-3 py-2 max-w-xs break-words',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
