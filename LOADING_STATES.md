# LearnLoop Loading States Documentation

LearnLoop now features beautiful, professional animated loading screens and skeleton components to enhance user experience during data fetching and page transitions.

## Components

### 1. LoadingScreen
The main full-page loading overlay with animated logo.

```tsx
import { LoadingScreen } from '@/components/loading-screen'

<LoadingScreen 
  show={true} 
  message="Loading your dashboard..." 
/>
```

**Features:**
- Animated spinning logo with rotating accent dots
- Gradient pulse glow effect
- Typing animation for messages
- Bouncing loading dots
- Smooth progress bar
- Responsive design
- Works in both light and dark modes

### 2. LoadingProvider
Global state management for loading screens.

```tsx
import { LoadingProvider, useLoading } from '@/components/loading-provider'

// Wrap your app in the root layout (already done)
<LoadingProvider>
  {children}
</LoadingProvider>

// Use anywhere in your app
function MyComponent() {
  const { startLoading, stopLoading } = useLoading()

  const handleClick = async () => {
    startLoading('Processing your request...')
    try {
      // Your async operation
      await fetch('/api/data')
    } finally {
      stopLoading()
    }
  }

  return <button onClick={handleClick}>Click me</button>
}
```

### 3. Skeleton Loaders
Content-aware skeleton components for different layouts:

```tsx
import { 
  LoadingSkeleton, 
  CardLoadingSkeleton, 
  GridLoadingSkeleton 
} from '@/components/loading-skeleton'

// Simple content skeleton
<LoadingSkeleton />

// Card-based content
<CardLoadingSkeleton />

// Grid layout (like posts feed)
<GridLoadingSkeleton />
```

### 4. usePageTransition Hook
Automatic loading state management for navigation.

```tsx
import { usePageTransition } from '@/hooks/use-page-transition'

function NavLink() {
  const { navigateTo } = usePageTransition()

  return (
    <button onClick={() => navigateTo('/dashboard', 'Loading dashboard...')}>
      Go to Dashboard
    </button>
  )
}
```

## Usage Patterns

### Pattern 1: API Loading
```tsx
'use client'

import { useLoading } from '@/components/loading-provider'
import { useState } from 'react'

export function DataFetcher() {
  const { startLoading, stopLoading } = useLoading()
  const [data, setData] = useState(null)

  const fetchData = async () => {
    startLoading('Fetching your posts...')
    try {
      const response = await fetch('/api/posts')
      const result = await response.json()
      setData(result)
    } finally {
      stopLoading()
    }
  }

  return (
    <button onClick={fetchData}>
      Load Posts
    </button>
  )
}
```

### Pattern 2: Form Submission
```tsx
export function LoginForm() {
  const { startLoading, stopLoading } = useLoading()

  const handleSubmit = async (formData: FormData) => {
    startLoading('Signing you in...')
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        body: formData,
      })
      // Handle response
    } finally {
      stopLoading()
    }
  }

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>
}
```

### Pattern 3: Skeleton During SSR Load
```tsx
import { CardLoadingSkeleton } from '@/components/loading-skeleton'
import { Suspense } from 'react'

export function PostsSection() {
  return (
    <Suspense fallback={<CardLoadingSkeleton />}>
      <PostsList />
    </Suspense>
  )
}
```

### Pattern 4: Selective Page Loading
```tsx
import { usePageTransition } from '@/hooks/use-page-transition'

export function Navigation() {
  const { navigateTo } = usePageTransition()

  return (
    <nav className="flex gap-4">
      <button onClick={() => navigateTo('/dashboard', 'Loading dashboard...')}>
        Dashboard
      </button>
      <button onClick={() => navigateTo('/messages', 'Loading messages...')}>
        Messages
      </button>
      <button onClick={() => navigateTo('/profile', 'Loading profile...')}>
        Profile
      </button>
    </nav>
  )
}
```

## Customization

### Change Loading Message
```tsx
const { startLoading } = useLoading()
startLoading('Custom loading message here...')
```

### Styling
All loading components use the LearnLoop color scheme:
- **Primary**: Deep Indigo (#4F46E5)
- **Accent**: Emerald (#10B981)
- Automatically adapts to light/dark mode

### Animation Timing
Adjust animation speeds in `loading-screen.tsx`:

```tsx
// Change spin speed (currently 3s)
animation: spin-slow 3s linear infinite;

// Change pulse speed (currently 2s)
animation: pulse-glow 2s ease-in-out infinite;
```

## Best Practices

1. **Don't Show Too Long**: Keep loading messages brief (2-3 seconds max)
2. **Provide Feedback**: Use contextual messages ("Loading posts..." vs just "Loading...")
3. **Combine with Skeletons**: Use skeleton screens for content placeholders
4. **Mobile Friendly**: All animations are optimized for mobile
5. **Accessibility**: Loading states are announced to screen readers

## Performance Tips

- LoadingProvider uses React Context to prevent unnecessary re-renders
- CSS animations run on GPU for smooth 60fps performance
- Logo is prioritized for loading to appear instantly
- Backdrop blur is subtle to maintain readability

## Dark Mode Support

All loading components automatically adapt to the system theme:
- Light mode: Clean white background with indigo/emerald accents
- Dark mode: Deep navy background with brighter accent colors

## Troubleshooting

**Loading screen not appearing?**
- Ensure LoadingProvider wraps your components in layout.tsx
- Check z-index: loading screen uses z-50

**Animation not smooth?**
- Verify CSS animations are enabled in your browser
- Check for GPU acceleration issues
- Test on different browsers

**Message not typing?**
- Check message prop is passed to LoadingScreen
- Verify useLoading() is called inside LoadingProvider
