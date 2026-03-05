import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AppNavbar } from '@/components/app-navbar'
import { Mail, Clock } from 'lucide-react'
import { Suspense } from 'react'

function MessagesLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b" />
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg border-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch conversations
  const { data: conversations, error: convoError } = await supabase
    .from('message_conversations')
    .select(
      `
      *,
      other_user:profiles!message_conversations_user_two_id_fkey(id, username, full_name, avatar_url),
      latest_message:messages(content, created_at, is_read)
    `
    )
    .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .limit(50)

  const formatConversation = (convo: any) => {
    const isUserOne = convo.user_one_id === user.id
    return {
      id: convo.id,
      otherUser: isUserOne ? convo.other_user : convo.other_user,
      lastMessage: convo.latest_message?.[0],
      updatedAt: convo.updated_at,
    }
  }

  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent userProfile={userProfile} conversations={conversations} />
    </Suspense>
  )
}

type ConversationData = {
  id: string
  user_one_id: string
  user_two_id: string
  updated_at: string
  other_user?: {
    id: string
    username: string
    full_name?: string
    avatar_url?: string
  }
  latest_message?: Array<{
    content: string
    created_at: string
    is_read: boolean
  }>
}

type UserProfile = {
  username?: string
  full_name?: string
  avatar_url?: string
}

async function MessagesContent({ userProfile, conversations }: { userProfile: UserProfile | null; conversations: ConversationData[] }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={userProfile} />
      
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Connect directly with community members</p>
            </div>
          </div>

          {/* Conversations List */}
          {conversations && conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((convo: ConversationData) => {
                const formatted = formatConversation(convo)
                return (
                  <Link
                    key={formatted.id}
                    href={`/messages/${formatted.id}`}
                  >
                    <Card className="hover:border-primary hover:shadow-md cursor-pointer transition border-2">
                      <CardContent className="p-4">
                        <div className="flex gap-4 items-start">
                          {/* Avatar */}
                          <div className="h-14 w-14 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {formatted.otherUser?.avatar_url ? (
                              <img
                                src={formatted.otherUser.avatar_url}
                                alt={formatted.otherUser.full_name || formatted.otherUser.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                                {formatted.otherUser?.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Conversation Info */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-baseline justify-between mb-2">
                              <span className="font-bold text-base">
                                {formatted.otherUser?.full_name || formatted.otherUser?.username}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatted.lastMessage?.created_at
                                  ? new Date(formatted.lastMessage.created_at).toLocaleDateString()
                                  : 'Recently'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {formatted.lastMessage?.content || 'No messages yet - Start a conversation'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2 font-medium">No conversations yet</p>
                <p className="text-sm text-muted-foreground">
                  Visit a user's profile to start a conversation
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
