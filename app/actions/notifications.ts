'use server'

import { createClient } from '@/lib/supabase/server'

export async function createNotification(
  userId: string,
  type: string,
  actorId: string,
  postId?: string,
  commentId?: string,
  message?: string
) {
  const supabase = await createClient()

  try {
    // Don't notify user about their own actions
    if (userId === actorId) {
      return
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      actor_id: actorId,
      post_id: postId,
      comment_id: commentId,
      message: message,
      is_read: false,
    })

    if (error) throw error
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

export async function markNotificationsAsRead(userId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
  } catch (error) {
    console.error('Failed to mark notifications as read:', error)
  }
}

export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient()

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Failed to get unread notification count:', error)
    return 0
  }
}
