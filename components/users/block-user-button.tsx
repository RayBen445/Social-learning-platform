'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Ban } from 'lucide-react'

interface BlockUserButtonProps {
  userId: string
  username: string
  isBlocked: boolean
}

export default function BlockUserButton({
  userId,
  username,
  isBlocked,
}: BlockUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [blocked, setBlocked] = useState(isBlocked)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleToggleBlock = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in')
        setIsLoading(false)
        return
      }

      if (blocked) {
        // Unblock
        const { error: deleteError } = await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', userId)

        if (deleteError) throw deleteError
        setBlocked(false)
      } else {
        // Block
        const { error: insertError } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: user.id,
            blocked_id: userId,
            reason: 'User blocked',
          })

        if (insertError) throw insertError
        setBlocked(true)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update block status'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (blocked) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-muted-foreground"
      >
        <Ban className="h-4 w-4 mr-2" />
        Blocked
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Ban className="h-4 w-4 mr-2" />
          Block User
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block @{username}?</AlertDialogTitle>
          <AlertDialogDescription>
            They won't be able to send you messages or see your profile. You
            can unblock them anytime from your settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleBlock}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Blocking...' : 'Block'}
            </AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
