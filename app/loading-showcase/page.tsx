'use client'

import { useState } from 'react'
import { LoadingScreen } from '@/components/loading-screen'
import { LoadingSkeleton, CardLoadingSkeleton, GridLoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoadingShowcase() {
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(false)

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

          {/* Loading States Description */}
          <Card>
            <CardHeader>
              <CardTitle>Loading Components</CardTitle>
              <CardDescription>
                Pre-built components for handling loading states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">LoadingScreen</h3>
                  <p className="text-sm text-muted-foreground">
                    Full-page animated loading overlay with spinning logo, typing animation, bouncing dots, and progress bar.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">LoadingSkeleton</h3>
                  <p className="text-sm text-muted-foreground">
                    Lightweight skeleton placeholder for content areas with smooth shimmer animation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">CardLoadingSkeleton</h3>
                  <p className="text-sm text-muted-foreground">
                    Skeleton for card-based layouts with title, description, and content placeholders.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">GridLoadingSkeleton</h3>
                  <p className="text-sm text-muted-foreground">
                    Skeleton for grid layouts with multiple card items.
                  </p>
                </div>
              </div>
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
                <h3 className="text-sm font-semibold">Full-Screen Loading</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { LoadingScreen } from '@/components/loading-screen'

<LoadingScreen 
  show={isLoading}
  message="Loading your dashboard..."
/>`}
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
                <h3 className="text-sm font-semibold">Page Loading Hook</h3>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
{`import { usePageTransition } from '@/hooks/use-page-transition'

export function MyComponent() {
  const { isLoading } = usePageTransition()
  
  return (
    <>
      {isLoading && <LoadingScreen show />}
      <YourContent />
    </>
  )
}`}
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

          {/* Animation Features */}
          <Card>
            <CardHeader>
              <CardTitle>Animation Features</CardTitle>
              <CardDescription>
                What makes LearnLoop's loading states exceptional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Spinning SVG Logo with 3-second rotation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Orbital accent dots rotating in reverse direction</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Pulsing glow effect with indigo and emerald colors</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Character-by-character typing animation for messages</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Bouncing dots with staggered animation delay</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Animated progress bar showing 70% completion</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Backdrop blur effect for modal appearance</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>Automatic dark/light theme adaptation</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
