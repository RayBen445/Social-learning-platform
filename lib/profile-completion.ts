export interface ProfileCompletionStep {
  id: string
  label: string
  done: boolean
  href: string
  /** Shown on the dashboard prompt when this is the first incomplete step */
  prompt: string
}

export interface ProfileCompletion {
  percent: number
  steps: ProfileCompletionStep[]
  isComplete: boolean
  /** The first step that isn't done yet (used for dashboard prompt) */
  nextStep: ProfileCompletionStep | null
}

export function computeProfileCompletion(
  profile: {
    avatar_url?: string | null
    institution?: string | null
    department?: string | null
    level?: string | null
    is_verified?: boolean | null
  },
  courseCount = 0,
): ProfileCompletion {
  const steps: ProfileCompletionStep[] = [
    {
      id: 'institution',
      label: 'Add your institution',
      done: !!profile.institution,
      href: '/settings/profile',
      prompt: 'Add your institution to find students in your school',
    },
    {
      id: 'department_level',
      label: 'Add department & level',
      done: !!(profile.department && profile.level),
      href: '/settings/profile',
      prompt: 'Add your department & level to join course groups',
    },
    {
      id: 'courses',
      label: 'Add your courses',
      done: courseCount > 0,
      href: '/courses',
      prompt: 'Add your courses to unlock class groups',
    },
    {
      id: 'verified',
      label: 'Verify your account',
      done: !!profile.is_verified,
      href: '/settings/academic',
      prompt: 'Verify your school to unlock messaging and appear in searches',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const percent = Math.round((doneCount / steps.length) * 100)
  const nextStep = steps.find((s) => !s.done) ?? null

  return { percent, steps, isComplete: percent === 100, nextStep }
}
