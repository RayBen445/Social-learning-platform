'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AppNavbar } from '@/components/app-navbar'
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

interface BlockedUser {
  id: string
  blocked_id: string
  profiles: {
    username: string
    full_name: string
    avatar_url: string
  }
}

interface MutedUser {
  id: string
  muted_user_id: string
  profiles: {
    username: string
    full_name: string
  }
}

export default function PrivacySettingsPage() {
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([])
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false)
  const [isLoadingMuted, setIsLoadingMuted] = useState(false)
  const [allowMessages, setAllowMessages] = useState(true)
  const [allowComments, setAllowComments] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUser(user.id)

      // Fetch user profile for navbar
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)
      setIsPageLoading(false)

      // Fetch blocked users
      setIsLoadingBlocked(true)
      const { data: blocked } = await supabase
        .from('blocked_users')
        .select('id, blocked_id, profiles(username, full_name, avatar_url)')
        .eq('blocker_id', user.id)

      if (blocked) setBlockedUsers(blocked as any)
      setIsLoadingBlocked(false)

      // Fetch muted users
      setIsLoadingMuted(true)
      const { data: muted } = await supabase
        .from('muted_users')
        .select('id, muted_user_id, profiles(username, full_name)')
        .eq('user_id', user.id)

      if (muted) setMutedUsers(muted as any)
      setIsLoadingMuted(false)
    }

    fetchData()
  }, [supabase, router])

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="mx-auto max-w-2xl space-y-6 p-4 pt-10">
          <div className="space-y-2">
            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-72 bg-muted animate-pulse rounded" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleUnblockUser = async (blockedId: string) => {
    try {
      await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', currentUser)
        .eq('blocked_id', blockedId)

      setBlockedUsers(blockedUsers.filter((u) => u.blocked_id !== blockedId))
    } catch (err) {
      console.error('Failed to unblock user:', err)
    }
  }

  const handleUnmuteUser = async (mutedId: string) => {
    try {
      await supabase
        .from('muted_users')
        .delete()
        .eq('user_id', currentUser)
        .eq('muted_user_id', mutedId)

      setMutedUsers(mutedUsers.filter((u) => u.muted_user_id !== mutedId))
    } catch (err) {
      console.error('Failed to unmute user:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={userProfile} />
      <div className="mx-auto max-w-2xl space-y-6 p-4 pt-10">
      <div>
        <h1 className="text-3xl font-bold">Privacy & Safety</h1>
        <p className="text-muted-foreground">
          Control who can contact you and what they see
        </p>
      </div>

      {/* Messaging Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging</CardTitle>
          <CardDescription>Control who can message you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-messages">Allow anyone to message me</Label>
            <Switch
              id="allow-messages"
              checked={allowMessages}
              onCheckedChange={setAllowMessages}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-comments">Allow anyone to comment on my posts</Label>
            <Switch
              id="allow-comments"
              checked={allowComments}
              onCheckedChange={setAllowComments}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Users</CardTitle>
          <CardDescription>
            {blockedUsers.length} {blockedUsers.length === 1 ? 'user' : 'users'} blocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBlocked ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : blockedUsers.length === 0 ? (
            <p className="text-muted-foreground">No blocked users</p>
          ) : (
            <div className="space-y-2">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{user.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.profiles.username}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(user.blocked_id)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Muted Users */}
      <Card>
        <CardHeader>
          <CardTitle>Muted Users</CardTitle>
          <CardDescription>
            {mutedUsers.length} {mutedUsers.length === 1 ? 'user' : 'users'} muted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMuted ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : mutedUsers.length === 0 ? (
            <p className="text-muted-foreground">No muted users</p>
          ) : (
            <div className="space-y-2">
              {mutedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{user.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.profiles.username}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnmuteUser(user.muted_user_id)}
                  >
                    Unmute
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your data will be permanently
                  deleted. You can export your data first if needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
