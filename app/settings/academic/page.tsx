'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { VerifiedBadge } from '@/components/users/verified-badge'

const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate', 'PhD']

export default function AcademicSettingsPage() {
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [institution, setInstitution] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [level, setLevel] = useState('')
  const [academicSession, setAcademicSession] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setNavbarUser({ username: p.username, full_name: p.full_name, avatar_url: p.avatar_url })
        setInstitution(p.institution ?? '')
        setFaculty(p.faculty ?? '')
        setDepartment(p.department ?? '')
        setLevel(p.level ?? '')
        setAcademicSession(p.academic_session ?? '')
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error: err } = await supabase.from('profiles').update({
      institution: institution.trim() || null,
      faculty: faculty.trim() || null,
      department: department.trim() || null,
      level: level || null,
      academic_session: academicSession.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)
    if (err) setError(err.message)
    else setSuccess(true)
    setIsSaving(false)
  }

  const verificationStatus = profile?.is_verified ? 'verified' : 'pending'

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
          <h1 className="text-2xl font-bold">Academic & Verification</h1>
          <p className="text-muted-foreground text-sm">Your academic identity. Changes trigger re-verification.</p>
        </div>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              {verificationStatus === 'verified' ? (
                <CheckCircle2 className="h-5 w-5 text-accent" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {verificationStatus === 'verified' ? 'Verified' : 'Pending verification'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {verificationStatus === 'verified'
                    ? 'Your student status has been confirmed.'
                    : 'Submit your student ID or school email to verify.'}
                </p>
              </div>
              {profile?.is_verified && (
                <VerifiedBadge verificationType={profile.verification_type} />
              )}
            </div>
            {!profile?.is_verified && (
              <Button size="sm" variant="outline">Upload verification document</Button>
            )}
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="h-3.5 w-3.5" />
                Any change will require re-verification
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. University of Lagos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty / School</Label>
                <Input id="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="e.g. Faculty of Engineering" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Level / Year</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">Academic Session</Label>
                <Input id="session" value={academicSession} onChange={(e) => setAcademicSession(e.target.value)} placeholder="e.g. 2024/2025" />
              </div>

              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              {success && <p className="text-sm text-primary">Academic information updated.</p>}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
