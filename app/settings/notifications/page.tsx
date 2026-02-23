'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Prefs {
  notif_direct_messages: boolean
  notif_mentions: boolean
  notif_course_announcements: boolean
  notif_group_activity: boolean
  notif_verification_updates: boolean
  notif_system_notices: boolean
  notif_delivery_push: boolean
  notif_delivery_email: boolean
  notif_delivery_in_app: boolean
}

const DEFAULTS: Prefs = {
  notif_direct_messages: true,
  notif_mentions: true,
  notif_course_announcements: true,
  notif_group_activity: true,
  notif_verification_updates: true,
  notif_system_notices: true,
  notif_delivery_push: true,
  notif_delivery_email: true,
  notif_delivery_in_app: true,
}

export default function NotificationsSettingsPage() {
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
      if (profile) setNavbarUser(profile)
      const { data: p } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single()
      if (p) setPrefs({ ...DEFAULTS, ...p })
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const toggle = (key: keyof Prefs) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    setSuccess(false)
    await supabase.from('user_preferences').upsert({ user_id: userId, ...prefs })
    setSuccess(true)
    setIsSaving(false)
  }

  const SwitchRow = ({ id, label, prefKey }: { id: string; label: string; prefKey: keyof Prefs }) => (
    <div className="flex items-center justify-between py-2">
      <Label htmlFor={id} className="cursor-pointer">{label}</Label>
      <Switch id={id} checked={prefs[prefKey]} onCheckedChange={() => toggle(prefKey)} />
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-2xl px-4 py-10 space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={navbarUser ?? undefined} />
      <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/settings" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">Choose what you are notified about</p>
        </div>

        <Card>
          <CardHeader><CardTitle>What to notify</CardTitle></CardHeader>
          <CardContent className="divide-y">
            <SwitchRow id="dm" label="Direct messages" prefKey="notif_direct_messages" />
            <SwitchRow id="mentions" label="Mentions" prefKey="notif_mentions" />
            <SwitchRow id="course" label="Course announcements" prefKey="notif_course_announcements" />
            <SwitchRow id="group" label="Group activity" prefKey="notif_group_activity" />
            <SwitchRow id="verification" label="Verification updates" prefKey="notif_verification_updates" />
            <SwitchRow id="system" label="System notices" prefKey="notif_system_notices" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery channels</CardTitle>
            <CardDescription>How you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="divide-y">
            <SwitchRow id="push" label="Push notifications" prefKey="notif_delivery_push" />
            <SwitchRow id="email" label="Email notifications" prefKey="notif_delivery_email" />
            <SwitchRow id="inapp" label="In-app notifications" prefKey="notif_delivery_in_app" />
          </CardContent>
        </Card>

        {success && <p className="text-sm text-primary">Preferences saved.</p>}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save preferences
        </Button>
      </div>
    </div>
  )
}
