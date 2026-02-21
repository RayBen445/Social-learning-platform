# LearnLoop Animation System

A comprehensive guide to LearnLoop's motion design system powered by Framer Motion.

## Overview

LearnLoop uses Framer Motion to provide smooth, delightful animations throughout the platform. The animation system is organized into:

1. **Animation Presets** - Reusable Framer Motion variants
2. **Motion Components** - Pre-built animated components
3. **Animation Guidelines** - Best practices for consistent motion design

## Animation Presets (`lib/animations.ts`)

### Page Transitions

```tsx
import { pageVariants } from '@/lib/animations'
import { motion } from 'framer-motion'

export default function Page() {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      Content here
    </motion.div>
  )
}
```

- **Duration:** 400ms fade in, 300ms fade out
- **Effect:** Smooth opacity and vertical movement
- **Use Case:** Page navigation and route transitions

### Fade Animations

```tsx
import { fadeInVariants } from '@/lib/animations'

<motion.div variants={fadeInVariants} initial="initial" animate="animate">
  Content fades in smoothly
</motion.div>
```

- **Duration:** 300ms
- **Effect:** Simple opacity transition
- **Use Case:** Subtle content reveals

### Slide Up

```tsx
import { slideUpVariants } from '@/lib/animations'

<motion.div variants={slideUpVariants} initial="initial" animate="animate">
  Slides up with fade
</motion.div>
```

- **Duration:** 400ms
- **Effect:** Combines upward movement with fade
- **Use Case:** Modal openings, content reveals

### Scale In

```tsx
import { scaleInVariants } from '@/lib/animations'

<motion.div variants={scaleInVariants} initial="initial" animate="animate">
  Scales from center
</motion.div>
```

- **Duration:** 300ms
- **Effect:** Zoom effect with fade
- **Use Case:** Badge reveals, achievement unlocks

### Button Interactions

```tsx
import { buttonHoverVariants } from '@/lib/animations'

<motion.button
  variants={buttonHoverVariants}
  initial="initial"
  whileHover="hover"
  whileTap="tap"
>
  Interactive Button
</motion.button>
```

- **Hover:** 2% scale increase
- **Tap:** 2% scale decrease
- **Duration:** 200ms
- **Use Case:** All interactive buttons

### Vote Animations

```tsx
import { voteAnimationVariants } from '@/lib/animations'

<motion.button
  variants={voteAnimationVariants}
  whileClick={{ scale: [1, 1.15, 1] }}
  onClick={handleVote}
>
  👍 Upvote
</motion.button>
```

- **Duration:** 300ms
- **Effect:** Quick pulse and scale
- **Use Case:** Vote buttons for interactive feedback

### Like Heart Animation

```tsx
import { likeHeartVariants } from '@/lib/animations'

<motion.button
  variants={likeHeartVariants}
  whileClick="like"
  onClick={handleLike}
>
  ❤️
</motion.button>
```

- **Duration:** 400ms
- **Effect:** Bouncy scale animation
- **Use Case:** Like buttons and reactions

## Motion Components

### AnimatedButton

Wraps shadcn Button with hover and tap animations.

```tsx
import { AnimatedButton } from '@/components/motion/animated-button'

<AnimatedButton onClick={handleClick}>
  Click me
</AnimatedButton>
```

### FadeIn

Fades in content with optional delay.

```tsx
import { FadeIn } from '@/components/motion/fade-in'

<FadeIn delay={0.2}>
  Content appears with fade
</FadeIn>
```

**Props:**
- `delay` (number): Delay in seconds, default 0
- `duration` (number): Animation duration, default 0.3

### SlideUp

Slides content up with fade and optional delay.

```tsx
import { SlideUp } from '@/components/motion/slide-up'

<SlideUp delay={0.1}>
  Content slides up
</SlideUp>
```

**Props:**
- `delay` (number): Delay in seconds

### StaggeredList

Container that animates list items with staggered timing.

```tsx
import { StaggeredList, StaggeredItem } from '@/components/motion/staggered-list'

<StaggeredList>
  {items.map((item) => (
    <StaggeredItem key={item.id}>
      <PostCard post={item} />
    </StaggeredItem>
  ))}
</StaggeredList>
```

**Props:**
- `staggerChildren` (number): Delay between items, default 0.05

### TypingIndicator

Animated three-dot typing indicator.

```tsx
import { TypingIndicator } from '@/components/motion/typing-indicator'

<TypingIndicator />
```

**Use Case:** Show when other users are typing in messages

### LoadingSpinner

Animated rotating spinner.

```tsx
import { LoadingSpinner } from '@/components/motion/loading-spinner'

<LoadingSpinner size="md" />
```

**Props:**
- `size` ('sm' | 'md' | 'lg'): Spinner size

### PageTransition

Wraps entire pages with fade and slide animations.

```tsx
import { PageTransition } from '@/components/motion/page-transition'

export default function Page() {
  return (
    <PageTransition>
      {/* Page content */}
    </PageTransition>
  )
}
```

### PulseBadge

Badge with pulsing animation and notification counter.

```tsx
import { PulseBadge } from '@/components/motion/pulse-badge'

<PulseBadge count={3}>
  <BellIcon />
</PulseBadge>
```

**Props:**
- `count` (number): Number to display in badge

## Animation Guidelines

### Performance Best Practices

1. **Use GPU-accelerated properties:**
   - ✅ `transform: translate`, `rotate`, `scale`
   - ✅ `opacity`
   - ❌ Avoid animating `width`, `height`, `left`, `top`

2. **Keep animations under 400ms:**
   - Quick micro-interactions: 200-300ms
   - Medium transitions: 300-400ms
   - Avoid sluggish animations > 500ms

3. **Use appropriate easing:**
   - `easeOut` for entering animations
   - `easeIn` for exiting animations
   - `linear` for continuous animations (spinners)

### Consistency Guidelines

1. **Color animations:** Use theme colors
2. **Timing:** Maintain consistent duration across similar actions
3. **Staggering:** Use 50-100ms delays for list items
4. **Delays:** Maximum 200ms for user-triggered animations

### When to Animate

✅ **DO animate:**
- Button interactions (hover, click)
- Page transitions and route changes
- Modal/drawer opens and closes
- List item reveals
- Loading states
- Success/error feedback
- Form validation feedback

❌ **DON'T animate:**
- Animations in preference/settings (users may have reduced motion)
- Network requests (show spinners instead)
- Text content changes (if longer than 3 words)
- Animations that distract from content

## Implementing Custom Animations

### Using Framer Motion Directly

```tsx
import { motion } from 'framer-motion'

const customVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

export function CustomComponent() {
  return (
    <motion.div
      variants={customVariants}
      initial="initial"
      animate="animate"
    >
      Custom animated content
    </motion.div>
  )
}
```

### Gesture Animations

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ outline: '2px solid blue' }}
  onClick={handleClick}
>
  Interactive Button
</motion.button>
```

### Stagger Animations

```tsx
<motion.div
  initial="initial"
  animate="animate"
  variants={{
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        initial: { opacity: 0 },
        animate: { opacity: 1 }
      }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

## Motion in Specific Features

### Posts & Comments

- **Like animation:** `likeHeartVariants`
- **Vote animation:** `voteAnimationVariants`
- **Comment appear:** `slideUpVariants`
- **List of posts:** `StaggeredList` component

### Messages

- **Typing indicator:** `TypingIndicator` component
- **Message bubbles:** `slideUpVariants`
- **New message:** `slideInLeftVariants`

### Notifications

- **Badge pulse:** `PulseBadge` component
- **Toast appear:** `toastVariants`
- **Notification list:** `StaggeredList` component

### Forms & Inputs

- **Field focus:** Subtle scale increase
- **Validation feedback:** Color change with fade
- **Success checkmark:** `scaleInVariants`

## Accessibility Considerations

### Respecting User Preferences

```tsx
import { useMediaQuery } from 'react-use'

const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

{!prefersReducedMotion && (
  <motion.div variants={pageVariants} initial="initial" animate="animate">
    Animated content
  </motion.div>
)}
```

### Always Provide Alternatives

- Don't rely on animation for critical information
- Use color, icons, and text in addition to motion
- Ensure animations don't interfere with focus management

## Troubleshooting

### Animation Not Playing

- Check that variant names match between `initial`, `animate`, and component
- Ensure `motion.` components are wrapped in appropriate DOM elements
- Verify Framer Motion is imported from 'framer-motion'

### Janky or Slow Animations

- Avoid animating layout-affecting properties
- Use `transform` instead of `position` properties
- Check for other animations running simultaneously
- Profile with Chrome DevTools Performance tab

### Performance Issues

- Limit number of simultaneously animated elements
- Use `will-change` CSS property sparingly
- Debounce rapid animation triggers
- Consider using static values for non-critical animations

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Web Animation Performance](https://web.dev/animations/)
- [LearnLoop GitHub](https://github.com/learnloop)

---

**Last Updated:** 2024 | Version: 1.0
