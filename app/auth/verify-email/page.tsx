'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || !email) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        })

        if (error) {
          setStatus('error')
          setMessage(error.message)
        } else {
          setStatus('success')
          setMessage('Email verified successfully!')
        }
      } catch (err) {
        setStatus('error')
        setMessage('Verification failed. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Verifying your email address</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Verifying your email...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center space-y-2">
                  <p className="font-semibold text-green-700">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    You can now log in to your account.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div className="text-center space-y-2">
                  <p className="font-semibold text-red-700">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    The verification link may have expired. Please try signing up again.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/sign-up">Sign Up Again</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="h-6 bg-gray-200 rounded dark:bg-gray-800 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-800 animate-pulse mt-2" />
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="h-12 w-12 bg-gray-200 rounded-full dark:bg-gray-800 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-800 animate-pulse w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
