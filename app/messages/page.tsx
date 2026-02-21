import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Connect directly with community members</p>
          </div>

          {/* Conversations List */}
          {conversations && conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((convo: any) => {
                const formatted = formatConversation(convo)
                return (
                  <Link
                    key={formatted.id}
                    href={`/messages/${formatted.id}`}
                  >
                    <Card className="hover:bg-muted/50 cursor-pointer transition">
                      <CardContent className="pt-6">
                        <div className="flex gap-4 items-center">
                          {/* Avatar */}
                          <div className="h-12 w-12 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {formatted.otherUser?.avatar_url ? (
                              <img
                                src={formatted.otherUser.avatar_url}
                                alt={formatted.otherUser.full_name || formatted.otherUser.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                {formatted.otherUser?.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Conversation Info */}
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">
                                {formatted.otherUser?.full_name || formatted.otherUser?.username}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {formatted.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>

                          {/* Time */}
                          <div className="flex-shrink-0 text-right text-xs text-muted-foreground">
                            {formatted.lastMessage?.created_at
                              ? new Date(formatted.lastMessage.created_at).toLocaleDateString()
                              : ''}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No conversations yet</p>
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
