'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Sun, Moon, Monitor } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function AppearanceSettingsPage() {
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [view, setView] = useState('comfortable')
  const [fontSize, setFontSize] = useState('medium')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
      if (profile) setNavbarUser(profile)
      const { data: p } = await supabase.from('user_preferences').select('appearance_view, appearance_font_size').eq('user_id', user.id).single()
      if (p) {
        setView(p.appearance_view ?? 'comfortable')
        setFontSize(p.appearance_font_size ?? 'medium')
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    setSuccess(false)
    await supabase.from('user_preferences').upsert({ user_id: userId, appearance_view: view, appearance_font_size: fontSize })
    setSuccess(true)
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  const ThemeBtn = ({ value, icon: Icon, label }: { value: string; icon: any; label: string }) => (
    <button
      onClick={() => setTheme(value)}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors flex-1 ${
        theme === value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-muted-foreground/50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )

  const OptionBtn = ({ value, current, onChange, label }: { value: string; current: string; onChange: (v: string) => void; label: string }) => (
    <button
      onClick={() => onChange(value)}
      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
        current === value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-muted-foreground/50'
      }`}
    >
      {label}
    </button>
  )

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
          <h1 className="text-2xl font-bold">Appearance</h1>
          <p className="text-muted-foreground text-sm">Customise how LearnLoop looks for you</p>
        </div>

        {/* Theme */}
        <Card>
          <CardHeader><CardTitle>Theme</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <ThemeBtn value="light" icon={Sun} label="Light" />
              <ThemeBtn value="dark" icon={Moon} label="Dark" />
              <ThemeBtn value="system" icon={Monitor} label="System" />
            </div>
          </CardContent>
        </Card>

        {/* View density */}
        <Card>
          <CardHeader><CardTitle>View density</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <OptionBtn value="comfortable" current={view} onChange={setView} label="Comfortable" />
              <OptionBtn value="compact" current={view} onChange={setView} label="Compact" />
            </div>
          </CardContent>
        </Card>

        {/* Font size */}
        <Card>
          <CardHeader><CardTitle>Font size</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <OptionBtn value="small" current={fontSize} onChange={setFontSize} label="Small" />
              <OptionBtn value="medium" current={fontSize} onChange={setFontSize} label="Medium" />
              <OptionBtn value="large" current={fontSize} onChange={setFontSize} label="Large" />
            </div>
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
