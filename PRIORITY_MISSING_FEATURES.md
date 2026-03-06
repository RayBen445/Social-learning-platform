# 🎯 Priority Missing Features - Quick Reference

## CRITICAL FEATURES TO ADD (Recommended Order)

### 1️⃣ Study Buddy Matching System
**Location:** `app/study-buddies/page.tsx` & `components/study-buddies/`

**Database Tables Ready:**
- `study_buddy_preferences`
- `study_buddy_connections`

**What Needs to be Built:**
```typescript
// Match algorithm based on:
- Subject interests (common tags/courses)
- Timezone for scheduling
- Learning style preferences
- Availability
- Academic level match
```

**Components Needed:**
- Browse buddy profiles with filter
- Match recommendations
- Connection request flow
- Chat integration

**Estimated Effort:** 3-4 hours

---

### 2️⃣ Real-Time Group Chat
**Location:** `app/groups/[id]/chat/page.tsx`

**Database Tables Ready:**
- `group_messages`
- `message_reactions`

**Features Required:**
- Real-time message streaming (Supabase subscriptions)
- Message reactions (emoji picker)
- File attachment support
- Message threading
- Typing indicators

**Tech Stack:**
- Supabase realtime subscriptions
- Framer Motion for reactions
- File upload (Vercel Blob integration)

**Estimated Effort:** 4-5 hours

---

### 3️⃣ Q&A System
**Location:** `app/qa/page.tsx` & `app/qa/[questionId]/page.tsx`

**Database Tables Ready:**
- `qa_questions`
- `qa_answers`
- `answer_ratings`

**Features Required:**
- Post questions with tags
- Answer questions
- Mark best answer
- Vote on answers
- Follow questions

**Components:**
```
- QuestionCard
- AnswerCard
- BestAnswerBadge
- QuestionForm
- AnswerForm
```

**Estimated Effort:** 3-4 hours

---

### 4️⃣ Weekly Challenges Page
**Location:** `app/challenges/page.tsx`

**Database Tables Ready:**
- `weekly_challenges`
- `user_weekly_progress`

**Features Required:**
- Display active challenges
- Progress tracking visualization
- Completion actions
- Reward preview
- Leaderboard for challenge completion

**Visual Components:**
```
- ChallengeCard (with progress bar)
- RewardBadge
- ChallengeDetailModal
- ProgressBar with animated fill
```

**Estimated Effort:** 2-3 hours

---

### 5️⃣ Course Modules & Lessons Viewer
**Location:** `app/courses/[id]/page.tsx` & `app/courses/[courseId]/lessons/[lessonId]/page.tsx`

**Database Tables Ready:**
- `course_modules`
- `course_lessons`
- `lesson_progress`

**Features Required:**
- Module sidebar with lessons
- Lesson content display (markdown, video, etc.)
- Progress tracking
- Next/Previous navigation
- Completion marking

**Components:**
```
- ModuleSidebar
- LessonContent
- LessonHeader with progress
- LessonNavigation
- CompletionButton
```

**Estimated Effort:** 4-5 hours

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Study Buddy | HIGH | MEDIUM | 🔴 Critical |
| Group Chat | VERY HIGH | HIGH | 🔴 Critical |
| Q&A System | HIGH | MEDIUM | 🔴 Critical |
| Challenges | MEDIUM | LOW | 🟡 Important |
| Lessons | HIGH | HIGH | 🟡 Important |
| Tutoring | MEDIUM | MEDIUM | 🟢 Nice-to-have |
| Paths | MEDIUM | HIGH | 🟢 Nice-to-have |

---

## Quick Start Template

### Basic Page Structure (Copy & Adapt):

```typescript
// app/study-buddies/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/lib/hooks/use-user'

export default function StudyBuddiesPage() {
  const { user } = useUser()
  const [buddies, setBuddies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchBuddies = async () => {
      // TODO: Implement buddy matching algorithm
      // 1. Get user preferences
      // 2. Query potential matches
      // 3. Exclude existing connections
      // 4. Sort by compatibility score
      setLoading(false)
    }

    fetchBuddies()
  }, [user])

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {/* TODO: Render buddy cards with connect button */}
    </div>
  )
}
```

---

## Database Query Examples Ready to Use

### Study Buddy Matching Query:
```sql
-- Find compatible study buddies based on shared courses/subjects
SELECT 
  p.id, p.username, p.full_name, p.avatar_url,
  COUNT(DISTINCT uc1.course_id) as shared_courses,
  COUNT(DISTINCT t1.name) as shared_topics
FROM profiles p
LEFT JOIN user_courses uc1 ON p.id = uc1.user_id
LEFT JOIN user_courses uc2 ON uc1.course_id = uc2.course_id
LEFT JOIN topic_subscriptions ts1 ON ts1.user_id = p.id
LEFT JOIN topic_subscriptions ts2 ON ts1.topic_id = ts2.topic_id
LEFT JOIN topics t1 ON ts1.topic_id = t1.id
WHERE p.id != $1 -- Exclude current user
  AND p.is_verified = true
  AND (uc1.course_id IS NOT NULL OR ts1.topic_id IS NOT NULL)
GROUP BY p.id
ORDER BY shared_courses DESC, shared_topics DESC
LIMIT 20
```

---

## Recommended Build Order (Day by Day)

**Day 1-2:** Study Buddy System (matching UI + API)
**Day 3-4:** Group Real-time Chat (messaging UI + subscriptions)
**Day 5:** Q&A System (questions + answers)
**Day 6:** Weekly Challenges (card display + progress)
**Day 7-8:** Course Lessons (module viewer + progress tracking)

Each feature is independent and can be deployed individually!
