'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppNavbar } from '@/components/app-navbar'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Flag, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

type ReportReason = 'spam' | 'harassment' | 'misinformation' | 'inappropriate' | 'other'

export default function ReportsPage() {
  const [navbarUser, setNavbarUser] = useState<{ username?: string; full_name?: string; avatar_url?: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'report' | 'appeal'>('report')
  const [appealSubject, setAppealSubject] = useState('')
  const [appealDescription, setAppealDescription] = useState('')
  const [appealSubmitted, setAppealSubmitted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
      if (profile) setNavbarUser(profile)
      // Pre-fill subject if coming from "report user" link
      const reportedUser = searchParams.get('user')
      if (reportedUser) setSubject(`Report: @${reportedUser}`)
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim() || !reason) {
      setError('Please fill in all fields')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('reports').insert({
        reporter_id: userId,
        reason,
        description: `${subject}\n\n${description}`,
      })
      if (err) throw err
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appealSubject.trim() || !appealDescription.trim()) {
      setError('Please fill in all fields')
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('appeals').insert({
        user_id: userId,
        subject: appealSubject.trim(),
        description: appealDescription.trim(),
      })
      if (err) throw err
      setAppealSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit appeal')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b bg-muted/40 animate-pulse" />
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <div className="h-64 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar user={navbarUser ?? undefined} />

      <div className="container mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Flag className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Reports & Appeals</h1>
            <p className="text-muted-foreground text-sm">Keep LearnLoop safe and fair</p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'report' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Submit a Report
          </button>
          <button
            onClick={() => setActiveTab('appeal')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'appeal' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Submit an Appeal
          </button>
        </div>

        {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        {/* Report form */}
        {activeTab === 'report' && (
          <>
            {submitted ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-8 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                  <h2 className="font-semibold">Report submitted</h2>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your report. Thank you for helping keep LearnLoop safe.
                  </p>
                  <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Report a user, post, or group</CardTitle>
                  <CardDescription>All reports are reviewed by our moderation team</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReport} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Select value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
                        <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="harassment">Harassment or bullying</SelectItem>
                          <SelectItem value="misinformation">Misinformation</SelectItem>
                          <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of the issue" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Details</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what happened in detail…"
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit report
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Appeal form */}
        {activeTab === 'appeal' && (
          <>
            {appealSubmitted ? (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-8 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                  <h2 className="font-semibold">Appeal submitted</h2>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your appeal and respond within 3–5 business days.
                  </p>
                  <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Appeal a moderation decision</CardTitle>
                  <CardDescription>If you believe a decision was made in error, explain your case below</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitAppeal} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="appeal-subject">Subject</Label>
                      <Input id="appeal-subject" value={appealSubject} onChange={(e) => setAppealSubject(e.target.value)} placeholder="Brief description of the decision you're appealing" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appeal-description">Your case</Label>
                      <Textarea
                        id="appeal-description"
                        value={appealDescription}
                        onChange={(e) => setAppealDescription(e.target.value)}
                        placeholder="Explain why you believe this decision was incorrect…"
                        rows={5}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Submit appeal
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Safety guidelines link */}
        <p className="text-xs text-muted-foreground">
          Before reporting, please review our{' '}
          <Link href="/legal/code-of-conduct" className="text-primary hover:underline">
            community guidelines
          </Link>
          .
        </p>
      </div>

      <BottomNav username={navbarUser?.username} />
    </div>
  )
}
