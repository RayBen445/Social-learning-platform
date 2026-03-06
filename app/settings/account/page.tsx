'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
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

export default function AccountSettingsPage() {
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email ?? '')
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      if (profile) setNavbarUser(profile)
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    setIsSavingEmail(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ email: newEmail.trim() })
    if (err) setError(err.message)
    else { setEmailSuccess(true); setNewEmail('') }
    setIsSavingEmail(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setIsSavingPassword(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) setError(err.message)
    else { setPasswordSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }
    setIsSavingPassword(false)
  }

  const handleLogoutAll = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-2xl px-4 py-10 space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={navbarUser ?? undefined} />
      <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center gap-2">
          <Link href="/settings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-muted-foreground text-sm">Manage your email, password, and sessions</p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Current: {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">New email address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email"
                />
              </div>
              {emailSuccess && (
                <p className="text-sm text-primary">Check your inbox to confirm the new email.</p>
              )}
              <Button type="submit" disabled={isSavingEmail || !newEmail.trim()}>
                {isSavingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update email'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a strong password (min 8 characters, 1 number, 1 symbol)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {passwordSuccess && <p className="text-sm text-primary">Password updated successfully.</p>}
              <Button type="submit" disabled={isSavingPassword || !newPassword}>
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Sign out of all devices including this one</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isLoggingOut}>
                  {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Log out all devices
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out everywhere?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out on all devices, including this one.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogoutAll}>Log out all</AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Delete account */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently deletes your account after a 7–14 day cooldown. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Request account deletion</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A deletion request will be queued. Your account will be permanently removed after a
                    7–14 day review period. All your posts, messages, and data will be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground">
                    Request deletion
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
