'use client'

import { useState } from 'react'
import { LoadingScreen } from '@/components/loading-screen'
import { LoadingSkeleton, CardLoadingSkeleton, GridLoadingSkeleton } from '@/components/loading-skeleton'
import { LoadingButton } from '@/components/loading-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLoading } from '@/components/loading-provider'

export default function LoadingShowcase() {
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const { startLoading, stopLoading } = useLoading()

  const handleButtonClick = async () => {
    setIsButtonLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsButtonLoading(false)
  }

  const handleGlobalLoading = () => {
    startLoading('Processing your request...')
    setTimeout(() => stopLoading(), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Loading States Showcase</h1>
            <p className="text-muted-foreground">
              Beautiful animated loading screens, skeletons, and buttons for LearnLoop
            </p>
          </div>

          {/* Full Screen Loading */}
          <Card>
            <CardHeader>
              <CardTitle>Full-Screen Loading</CardTitle>
              <CardDescription>
                Animated logo with typing text and loading indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setShowFullScreen(true)}>
                Show Full-Screen Loading
              </Button>
              <Button variant="outline" onClick={handleGlobalLoading}>
                Show Global Loading (3s)
              </Button>
              {showFullScreen && (
                <LoadingScreen
                  show={showFullScreen}
                  message="Loading your learning dashboard..."
                />
              )}
              <Button
                variant="ghost"
                onClick={() => setShowFullScreen(false)}
                className="ml-2"
              >
                Hide
              </Button>
            </CardContent>
          </Card>

          {/* Skeleton Loaders */}
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loaders</CardTitle>
              <CardDescription>
                Content-aware placeholders for different layouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Basic Content Skeleton</h3>
                <div className="border border-border rounded-lg p-4">
                  <LoadingSkeleton />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Card Layout Skeleton</h3>
                <div className="border border-border rounded-lg p-4">
                  <CardLoadingSkeleton />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Grid Layout Skeleton</h3>
                <div className="border border-border rounded-lg p-4">
                  <GridLoadingSkeleton />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowSkeleton(!showSkeleton)}
              >
                {showSkeleton ? 'Hide' : 'Show'} Animated Skeletons
              </Button>
            </CardContent>
          </Card>

          {/* Loading Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Loading Button</CardTitle>
              <CardDescription>
                Button with built-in loading state animation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <LoadingButton
                  isLoading={isButtonLoading}
                  loadingText="Submitting..."
                  onClick={handleButtonClick}
                >
                  Click to Submit
                </LoadingButton>

                <LoadingButton
                  isLoading={isButtonLoading}
                  loadingText="Saving..."
                  variant="outline"
                  onClick={handleButtonClick}
                >
                  Save Changes
                </LoadingButton>

                <LoadingButton
                  isLoading={isButtonLoading}
                  loadingText="Creating..."
                  variant="secondary"
                  onClick={handleButtonClick}
                >
                  Create Post
                </LoadingButton>

                <LoadingButton
                  isLoading={isButtonLoading}
                  loadingText="Deleting..."
                  variant="destructive"
                  onClick={handleButtonClick}
                >
                  Delete
                </LoadingButton>
              </div>
              <p className="text-xs text-muted-foreground">
                Click any button to see the 2-second loading animation
              </p>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>
                Common patterns for using loading states in your app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Global Loading</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { useLoading } from '@/components/loading-provider'

const { startLoading, stopLoading } = useLoading()

const handleClick = async () => {
  startLoading('Loading posts...')
  try {
    const data = await fetch('/api/posts')
  } finally {
    stopLoading()
  }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Skeleton with Suspense</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { Suspense } from 'react'
import { CardLoadingSkeleton } from '@/components/loading-skeleton'

export function Posts() {
  return (
    <Suspense fallback={<CardLoadingSkeleton />}>
      <PostsContent />
    </Suspense>
  )
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Loading Button</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { LoadingButton } from '@/components/loading-button'

const [isLoading, setIsLoading] = useState(false)

<LoadingButton
  isLoading={isLoading}
  loadingText="Submitting..."
  onClick={handleSubmit}
>
  Submit Form
</LoadingButton>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Color Palette */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                LearnLoop's primary colors used in loading animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-primary rounded-lg shadow-md"></div>
                  <p className="text-sm font-semibold">Primary</p>
                  <p className="text-xs text-muted-foreground">#4F46E5 - Deep Indigo</p>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-accent rounded-lg shadow-md"></div>
                  <p className="text-sm font-semibold">Accent</p>
                  <p className="text-xs text-muted-foreground">#10B981 - Emerald</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
