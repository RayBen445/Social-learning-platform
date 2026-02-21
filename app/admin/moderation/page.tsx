'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Report {
  id: string
  reporter_id: string
  post_id: string | null
  comment_id: string | null
  reported_user_id: string | null
  reason: string
  description: string | null
  status: string
  created_at: string
  profiles: {
    username: string
    full_name: string
  }
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAndFetchReports = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user is admin (simple check - in production use custom claims)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single()

      if (!profile?.is_verified) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)

      // Fetch reports
      setIsLoading(true)
      const { data } = await supabase
        .from('reports')
        .select('*, profiles(username, full_name)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (data) {
        setReports(data as any)
      }
      setIsLoading(false)
    }

    checkAdminAndFetchReports()
  }, [supabase, router])

  const handleUpdateReport = async (reportId: string) => {
    if (!newStatus) {
      alert('Please select a status')
      return
    }

    try {
      await supabase
        .from('reports')
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId)

      setReports(
        reports.map((r) =>
          r.id === reportId
            ? { ...r, status: newStatus, admin_notes: adminNotes }
            : r
        )
      )

      setSelectedReport(null)
      setAdminNotes('')
      setNewStatus('')
    } catch (err) {
      console.error('Failed to update report:', err)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You do not have permission to access this page</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">Content Moderation</h1>
        <p className="text-muted-foreground">Review and manage reported content</p>
      </div>

      {isLoading ? (
        <div>Loading reports...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Reports List */}
          <div className="lg:col-span-2 space-y-2">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    No reports to review
                  </p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors ${
                    selectedReport === report.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">
                          Reported by @{report.profiles.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{report.reason}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {report.description || 'No additional details'}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline">{report.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Report Details */}
          {selectedReport && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reports
                    .filter((r) => r.id === selectedReport)
                    .map((report) => (
                      <div key={report.id} className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Reason</p>
                          <p className="text-sm text-muted-foreground">
                            {report.reason}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Description</p>
                          <p className="text-sm text-muted-foreground">
                            {report.description || 'None'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Status</p>
                          <Select value={newStatus || report.status} onValueChange={setNewStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Admin Notes</p>
                          <Textarea
                            placeholder="Add notes about this report..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                          />
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => handleUpdateReport(report.id)}
                        >
                          Update Report
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
