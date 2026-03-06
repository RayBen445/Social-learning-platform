'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b flex items-center px-4">
        <Link href="/" className="font-bold text-lg">
          LearnLoop
        </Link>
      </div>
      <div className="container mx-auto max-w-2xl px-4 py-12 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Card className="w-full border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-2xl">Dashboard error</CardTitle>
            </div>
            <CardDescription>
              We encountered an error loading your dashboard. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error.message && (
              <div className="bg-muted p-3 rounded-md border border-muted-foreground/20">
                <p className="text-sm text-muted-foreground font-mono">{error.message}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/"><Home className="h-4 w-4" />Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
