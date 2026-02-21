'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { MailCheck, AlertCircle, Clock, LogIn } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignUpSuccessPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'
  const [resendTime, setResendTime] = useState(0)

  useEffect(() => {
    if (resendTime > 0) {
      const timer = setTimeout(() => setResendTime(resendTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTime])

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <div className="space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>We sent a verification link to:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Display */}
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="font-semibold text-foreground">{email}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Check your email</p>
                    <p className="text-muted-foreground">Look for a message from LearnLoop Team</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Click the verification link</p>
                    <p className="text-muted-foreground">Or copy the 6-digit code provided</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Complete your signup</p>
                    <p className="text-muted-foreground">You&apos;ll be redirected to your dashboard</p>
                  </div>
                </div>
              </div>

              {/* Spam Warning */}
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Didn&apos;t see the email?</strong> Check your spam or junk folder. Sometimes our emails end up there by mistake.
                </AlertDescription>
              </Alert>

              {/* Expiration Info */}
              <div className="flex gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/10">
                <Clock className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  The verification link expires in <strong>24 hours</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full" disabled={resendTime > 0}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>

                <Link href="/" className="block">
                  <Button variant="ghost" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Support Text */}
          <div className="text-center text-xs text-muted-foreground">
            <p>
              Issues verifying?{' '}
              <Link href="/help" className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Check our help center
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
