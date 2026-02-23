'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function MessagingSettingsPage() {
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [msgRequests, setMsgRequests] = useState(true)
  const [groupInvites, setGroupInvites] = useState('everyone')
  const [autoMute, setAutoMute] = useState(false)
  const [fileDownload, setFileDownload] = useState('wifi')
  const [whoCanMsg, setWhoCanMsg] = useState('everyone')
  const [readReceipts, setReadReceipts] = useState(true)
  const [lastSeen, setLastSeen] = useState(true)
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
      if (p) {
        setMsgRequests(p.msg_requests_enabled ?? true)
        setGroupInvites(p.msg_group_invites ?? 'everyone')
        setAutoMute(p.msg_auto_mute_groups ?? false)
        setFileDownload(p.msg_file_download ?? 'wifi')
        setWhoCanMsg(p.privacy_who_can_message ?? 'everyone')
        setReadReceipts(p.privacy_read_receipts ?? true)
        setLastSeen(p.privacy_show_last_seen ?? true)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    setSuccess(false)
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      msg_requests_enabled: msgRequests,
      msg_group_invites: groupInvites,
      msg_auto_mute_groups: autoMute,
      msg_file_download: fileDownload,
      privacy_who_can_message: whoCanMsg,
      privacy_read_receipts: readReceipts,
      privacy_show_last_seen: lastSeen,
    })
    setSuccess(true)
    setIsSaving(false)
  }

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
          <h1 className="text-2xl font-bold">Messaging</h1>
          <p className="text-muted-foreground text-sm">Control who can message you and how messages work</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Who can message me</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Allow messages from</Label>
              <Select value={whoCanMsg} onValueChange={setWhoCanMsg}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="same_school">Same school only</SelectItem>
                  <SelectItem value="same_course">Same course only</SelectItem>
                  <SelectItem value="connections">Connections only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Message requests</CardTitle></CardHeader>
          <CardContent className="space-y-4 divide-y">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="msg-req">Enable message requests</Label>
              <Switch id="msg-req" checked={msgRequests} onCheckedChange={setMsgRequests} />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="read-receipts">Read receipts</Label>
              <Switch id="read-receipts" checked={readReceipts} onCheckedChange={setReadReceipts} />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="last-seen">Show last seen</Label>
              <Switch id="last-seen" checked={lastSeen} onCheckedChange={setLastSeen} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Control group invite and auto-mute behaviour</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Who can add me to groups</Label>
              <Select value={groupInvites} onValueChange={setGroupInvites}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="connections">Connections only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-mute">Auto-mute new groups</Label>
              <Switch id="auto-mute" checked={autoMute} onCheckedChange={setAutoMute} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>File downloads</CardTitle></CardHeader>
          <CardContent>
            <Select value={fileDownload} onValueChange={setFileDownload}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always download</SelectItem>
                <SelectItem value="wifi">Wi-Fi only</SelectItem>
                <SelectItem value="never">Never auto-download</SelectItem>
              </SelectContent>
            </Select>
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
