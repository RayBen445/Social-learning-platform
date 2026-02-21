'use server'

import { createClient } from '@/lib/supabase/server'

export async function addReputation(userId: string, points: number, reason: string) {
  const supabase = await createClient()

  try {
    // Get current reputation
    const { data: profile } = await supabase
      .from('profiles')
      .select('reputation_points')
      .eq('id', userId)
      .single()

    const currentReputation = profile?.reputation_points || 0
    const newReputation = Math.max(0, currentReputation + points)

    // Update reputation
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ reputation_points: newReputation })
      .eq('id', userId)

    if (updateError) throw updateError

    // Log reputation change
    await supabase.from('reputation_logs').insert({
      user_id: userId,
      points,
      reason,
      total_points: newReputation,
    })

    // Check for achievements
    await checkAchievements(userId, newReputation)

    return newReputation
  } catch (error) {
    console.error('Failed to add reputation:', error)
    throw error
  }
}

export async function checkAchievements(userId: string, reputation: number) {
  const supabase = await createClient()

  try {
    // Get user's posts
    const { data: userPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', userId)

    // Get user's followers
    const { data: userFollowers } = await supabase
      .from('follows')
      .select('id')
      .eq('following_id', userId)

    const postsCount = userPosts?.length || 0
    const followersCount = userFollowers?.length || 0

    // Check for achievements to unlock
    const achievementsToCheck = [
      {
        id: 'first-post',
        name: 'First Post',
        condition: postsCount >= 1,
      },
      {
        id: 'ten-posts',
        name: 'Power Poster',
        condition: postsCount >= 10,
      },
      {
        id: 'hundred-reputation',
        name: 'Reputation Master',
        condition: reputation >= 100,
      },
      {
        id: 'first-follower',
        name: 'Popular',
        condition: followersCount >= 1,
      },
      {
        id: 'hundred-followers',
        name: 'Community Leader',
        condition: followersCount >= 100,
      },
    ]

    for (const achievement of achievementsToCheck) {
      if (achievement.condition) {
        // Check if already unlocked
        const { data: existing } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('user_id', userId)
          .eq('achievement_id', achievement.id)
          .single()

        if (!existing) {
          // Unlock achievement
          await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: achievement.id,
          })
        }
      }
    }
  } catch (error) {
    console.error('Failed to check achievements:', error)
  }
}

export async function getReputationBreakdown(userId: string) {
  const supabase = await createClient()

  try {
    const { data: logs } = await supabase
      .from('reputation_logs')
      .select('reason, points')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    const breakdown: Record<string, number> = {}
    logs?.forEach((log: any) => {
      if (!breakdown[log.reason]) {
        breakdown[log.reason] = 0
      }
      breakdown[log.reason] += log.points
    })

    return breakdown
  } catch (error) {
    console.error('Failed to get reputation breakdown:', error)
    return {}
  }
}
