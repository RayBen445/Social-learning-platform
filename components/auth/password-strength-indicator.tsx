'use client'

import { checkPasswordStrength } from '@/lib/password-strength'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  onStrengthChange?: (strength: string) => void
}

export function PasswordStrengthIndicator({ password, onStrengthChange }: PasswordStrengthIndicatorProps) {
  const { score, strength, feedback } = checkPasswordStrength(password)

  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-orange-500',
    good: 'bg-yellow-500',
    strong: 'bg-lime-500',
    'very-strong': 'bg-green-500',
  }

  const strengthLabels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    'very-strong': 'Very Strong',
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Password Strength</label>
          <span className={`text-xs font-semibold ${strengthColors[strength].replace('bg-', 'text-')}`}>
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-2">
          {feedback.map((tip, index) => (
            <div key={index} className="flex gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Requirements Met */}
      {feedback.length === 0 && password.length > 0 && (
        <div className="flex gap-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
          <span>Password meets all requirements</span>
        </div>
      )}

      {/* Strength requirements */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
        <p className="font-medium">Requirements:</p>
        <ul className="space-y-1">
          <li className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
            • At least 8 characters
          </li>
          <li className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            • Lowercase letters
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            • Uppercase letters
          </li>
          <li className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            • Numbers
          </li>
          <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}>
            • Special characters
          </li>
        </ul>
      </div>
    </div>
  )
}
