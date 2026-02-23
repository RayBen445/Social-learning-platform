import Link from 'next/link'
import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ProfileCompletionStep } from '@/lib/profile-completion'

interface ProfileCompletionBarProps {
  percent: number
  steps: ProfileCompletionStep[]
  isComplete: boolean
}

export function ProfileCompletionBar({ percent, steps, isComplete }: ProfileCompletionBarProps) {
  if (isComplete) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm font-medium text-primary">Your academic profile is complete.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Your academic profile is {percent}% complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Checklist */}
        <ul className="space-y-1.5">
          {steps.map((step) => (
            <li key={step.id}>
              {step.done ? (
                <span className="flex items-center gap-2 text-xs text-muted-foreground line-through">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  {step.label}
                </span>
              ) : (
                <Link
                  href={step.href}
                  className="flex items-center gap-2 text-xs hover:text-primary transition-colors"
                >
                  <Circle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  {step.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
