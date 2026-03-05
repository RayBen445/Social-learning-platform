# LearnLoop Loading States - Quick Reference

## One-Line Imports

```tsx
import { useLoading } from '@/components/loading-provider'
import { LoadingButton } from '@/components/loading-button'
import { LoadingScreen } from '@/components/loading-screen'
import { LoadingSkeleton, CardLoadingSkeleton, GridLoadingSkeleton } from '@/components/loading-skeleton'
import { usePageTransition } from '@/hooks/use-page-transition'
```

## Most Common Patterns

### Pattern 1: Async Operation
```tsx
'use client'
import { useLoading } from '@/components/loading-provider'

export function FetchPosts() {
  const { startLoading, stopLoading } = useLoading()

  const handleFetch = async () => {
    startLoading('Fetching posts...')
    try {
      const res = await fetch('/api/posts')
      // ... handle response
    } finally {
      stopLoading()
    }
  }

  return <button onClick={handleFetch}>Fetch</button>
}
```

### Pattern 2: Form Submission
```tsx
'use client'
import { LoadingButton } from '@/components/loading-button'
import { useState } from 'react'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const res = await fetch('/auth/login', { method: 'POST', body: formData })
      // ... handle response
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit}>
      <LoadingButton isLoading={isLoading}>Sign In</LoadingButton>
    </form>
  )
}
```

### Pattern 3: Skeleton During Load
```tsx
import { Suspense } from 'react'
import { CardLoadingSkeleton } from '@/components/loading-skeleton'

export function PostsSection() {
  return (
    <Suspense fallback={<CardLoadingSkeleton />}>
      <PostsList />
    </Suspense>
  )
}
```

### Pattern 4: Navigation
```tsx
'use client'
import { usePageTransition } from '@/hooks/use-page-transition'

export function Nav() {
  const { navigateTo } = usePageTransition()

  return (
    <>
      <button onClick={() => navigateTo('/dashboard', 'Loading...')}>Dashboard</button>
      <button onClick={() => navigateTo('/messages', 'Loading messages...')}>Messages</button>
    </>
  )
}
```

## Component Props

### LoadingScreen
```tsx
<LoadingScreen 
  show={boolean}        // Show/hide loading screen
  message={string}      // Custom message (typing animation)
/>
```

### LoadingButton
```tsx
<LoadingButton
  isLoading={boolean}
  loadingText={string}
  onClick={handler}
  variant="default" | "outline" | "secondary" | "destructive" | "ghost"
  disabled={boolean}
>
  Button Text
</LoadingButton>
```

### useLoading Hook
```tsx
const { 
  isLoading: boolean,           // Current loading state
  message: string,              // Current message
  startLoading: (msg?) => void, // Show loading screen
  stopLoading: () => void       // Hide loading screen
} = useLoading()
```

### usePageTransition Hook
```tsx
const { 
  navigateTo: (href, message?) => void,  // Navigate with loading
  isPending: boolean                      // Is navigation pending
} = usePageTransition()
```

## Skeleton Components
```tsx
// Generic content
<LoadingSkeleton />

// Card list (e.g., posts)
<CardLoadingSkeleton />

// Grid (e.g., courses)
<GridLoadingSkeleton />
```

## Colors Used
- Primary: `#4F46E5` (Deep Indigo)
- Accent: `#10B981` (Emerald)
- Automatically work in light/dark mode

## CSS Classes
- `animate-spin-slow` - 3s rotation
- `animate-pulse-glow` - 2s pulse with glow
- `animate-float` - 0.6s fade-in up
- Standard Tailwind: `animate-bounce`, `animate-pulse`

## Demo Page
Visit `/loading-showcase` to see all components live

## Full Documentation
See `LOADING_STATES.md` and `LOADING_COMPONENTS.md` for complete guides
