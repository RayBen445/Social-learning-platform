'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSend: (message: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({
  onSend,
  disabled,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    setIsLoading(true)
    try {
      await onSend(message)
      setMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled || isLoading}
        className="flex-1"
      />
      <Button
        type="submit"
        disabled={disabled || isLoading || !message.trim()}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
