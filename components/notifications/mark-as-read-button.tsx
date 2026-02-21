'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface MarkNotificationAsReadButtonProps {
  notificationId: string
}

export default function MarkNotificationAsReadButton({
  notificationId,
}: MarkNotificationAsReadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={isLoading}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      Mark as read
    </button>
  )
}
