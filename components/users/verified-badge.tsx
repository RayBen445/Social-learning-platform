import { BadgeCheck } from 'lucide-react'

interface VerifiedBadgeProps {
  verificationType?: string | null
  size?: 'sm' | 'xs'
  className?: string
}

export function VerifiedBadge({ verificationType, size = 'sm', className }: VerifiedBadgeProps) {
  const iconSize = size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  if (verificationType === 'bot') {
    return (
      <BadgeCheck
        className={`${iconSize} text-green-500 flex-shrink-0 ${className ?? ''}`}
        aria-label="Bot account"
      />
    )
  }

  if (verificationType === 'system') {
    return (
      <BadgeCheck
        className={`${iconSize} text-purple-500 flex-shrink-0 ${className ?? ''}`}
        aria-label="System account"
      />
    )
  }

  // Default: regular verified user
  return (
    <BadgeCheck
      className={`${iconSize} text-blue-500 flex-shrink-0 ${className ?? ''}`}
      aria-label="Verified account"
    />
  )
}
