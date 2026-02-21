'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Flag } from 'lucide-react'

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'other', label: 'Other' },
]

interface ReportPostButtonProps {
  postId: string
  postAuthorId: string
}

export default function ReportPostButton({
  postId,
  postAuthorId,
}: ReportPostButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      setError('Please select a reason')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to report content')
        setIsLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('reports').insert({
        reporter_id: user.id,
        post_id: postId,
        reported_user_id: postAuthorId,
        reason,
        description: description || null,
        status: 'pending',
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        setReason('')
        setDescription('')
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit report'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Flag className="h-4 w-4 mr-2" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Help us keep LearnLoop safe. Report content that violates our
            community guidelines.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="rounded-lg bg-green-50 p-4 text-center text-green-800">
            <p className="font-medium">Thank you for your report</p>
            <p className="text-sm">Our moderation team will review it shortly</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Report</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide more context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !reason}>
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
