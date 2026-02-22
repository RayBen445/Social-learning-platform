import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MarkNotificationAsReadButton from '@/components/notifications/mark-as-read-button'
import { AppNavbar } from '@/components/app-navbar'
import { Bell, MessageCircle, Heart, UserPlus, Share2 } from 'lucide-react'
import { Suspense } from 'react'

function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b" />
      <div className="container mx-auto max-w-3xl py-10 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg border-2" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function NotificationsPage() {
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

  // Fetch notifications
  const { data: notifications, error: notificationsError } = await supabase
    .from('notifications')
    .select(
      `
      *,
      actor:profiles(id, username, full_name, avatar_url, is_verified),
      post:posts(id, title),
      comment:comments(id, content)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case 'comment':
        return `commented on your post`
      case 'vote':
        return `voted on your post`
      case 'follow':
        return `started following you`
      case 'mention':
        return `mentioned you`
      case 'reshare':
        return `reshared your post`
      case 'reply':
        return `replied to your comment`
      default:
        return 'interacted with your content'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'vote':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />
      case 'reshare':
        return <Share2 className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-primary" />
    }
  }

  const getNotificationLink = (notification: any) => {
    if (notification.post_id) {
      return `/posts/${notification.post_id}`
    } else if (notification.actor_id) {
      return `/profile/${notification.actor?.username}`
    }
    return '#'
  }

  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsContent userProfile={userProfile} notifications={notifications} />
    </Suspense>
  )
}

async function NotificationsContent({ userProfile, notifications }: { userProfile: any; notifications: any }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={userProfile} />
      
      <div className="container mx-auto max-w-3xl py-10 px-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with what's happening in your community
              </p>
            </div>
          </div>

          {/* Notifications List */}
          {notifications && notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification: any) => (
                <Link key={notification.id} href={getNotificationLink(notification)}>
                  <Card className={`hover:bg-muted/50 cursor-pointer transition ${
                    !notification.is_read ? 'border-primary bg-primary/5' : ''
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4 items-start">
                        {/* Actor Avatar */}
                        <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          {notification.actor?.avatar_url ? (
                            <img
                              src={notification.actor.avatar_url}
                              alt={notification.actor.full_name || notification.actor.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                              {notification.actor?.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Notification Content */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">
                              {notification.actor?.full_name || notification.actor?.username}
                            </span>
                            {notification.actor?.is_verified && (
                              <span className="text-blue-600 text-xs">✓ Verified</span>
                            )}
                            <span className="text-muted-foreground">
                              {getNotificationMessage(notification)}
                            </span>
                          </div>

                          {notification.message && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}

                          {notification.post?.title && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              &quot;{notification.post.title}&quot;
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                            {!notification.is_read && (
                              <MarkNotificationAsReadButton notificationId={notification.id} />
                            )}
                          </div>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">No notifications yet</p>
                <p className="text-sm text-muted-foreground">
                  When someone interacts with your posts or follows you, you&apos;ll see it here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
