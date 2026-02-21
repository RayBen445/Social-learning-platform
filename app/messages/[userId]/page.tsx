'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import MessageItem from '@/components/messages/message-item'
import TypingIndicator from '@/components/messages/typing-indicator'

interface Message {
  id: string
  content: string
  sender_id: string
  recipient_id: string
  created_at: string
  is_read: boolean
}

interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string
}

export default function ConversationPage({
  params,
}: {
  params: { userId: string }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user?.id || null)
    }

    fetchCurrentUser()
  }, [supabase])

  useEffect(() => {
    if (!currentUser) return

    const fetchMessages = async () => {
      const { data, error: fetchError } = await supabase
        .from('direct_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser},recipient_id.eq.${params.userId}),and(sender_id.eq.${params.userId},recipient_id.eq.${currentUser})`
        )
        .order('created_at', { ascending: true })
        .limit(50)

      if (fetchError) {
        setError('Failed to load messages')
        return
      }

      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('recipient_id', currentUser)
        .eq('sender_id', params.userId)
    }

    const fetchUserProfile = async () => {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', params.userId)
        .single()

      if (fetchError) {
        setError('User not found')
        return
      }

      setUser(data)
    }

    fetchMessages()
    fetchUserProfile()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${currentUser}-${params.userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${currentUser},recipient_id.eq.${params.userId}),and(sender_id.eq.${params.userId},recipient_id.eq.${currentUser}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentUser, params.userId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: currentUser,
          recipient_id: params.userId,
          content: newMessage,
        })

      if (insertError) throw insertError

      setNewMessage('')
    } catch (err) {
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div className="p-4 text-center">Loading conversation...</div>
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3">
        <h2 className="text-lg font-semibold">{user.full_name || user.username}</h2>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === currentUser}
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4">
        {error && (
          <div className="mb-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
