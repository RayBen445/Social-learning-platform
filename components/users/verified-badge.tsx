import { BadgeCheck, Clock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface VerifiedBadgeProps {
  verificationType?: string | null
  size?: 'sm' | 'xs'
  className?: string
}

export function VerifiedBadge({ verificationType, size = 'sm', className }: VerifiedBadgeProps) {
  const iconSize = size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  let icon: React.ReactNode
  let tooltip: string

  if (verificationType === 'pending') {
    icon = (
      <Clock
        className={`${iconSize} text-yellow-500 flex-shrink-0 ${className ?? ''}`}
        aria-label="Verification pending"
      />
    )
    tooltip = 'Verification Pending'
  } else if (verificationType === 'institution') {
    icon = (
      <BadgeCheck
        className={`${iconSize} text-emerald-500 animate-pulse flex-shrink-0 ${className ?? ''}`}
        aria-label="Institution Verified"
      />
    )
    tooltip = '🏫 Institution Verified'
  } else if (verificationType === 'bot') {
    icon = (
      <BadgeCheck
        className={`${iconSize} text-green-500 flex-shrink-0 ${className ?? ''}`}
        aria-label="Bot account"
      />
    )
    tooltip = 'Bot Account'
  } else if (verificationType === 'system') {
    icon = (
      <BadgeCheck
        className={`${iconSize} text-purple-500 flex-shrink-0 ${className ?? ''}`}
        aria-label="System account"
      />
    )
    tooltip = 'System Account'
  } else if (verificationType === 'student' || !verificationType) {
    // Verified student (default)
    icon = (
      <BadgeCheck
        className={`${iconSize} text-blue-500 animate-pulse flex-shrink-0 ${className ?? ''}`}
        aria-label="Verified Student"
      />
    )
    tooltip = '🎓 Verified Student'
  } else {
    // Fallback for unrecognised types
    icon = (
      <BadgeCheck
        className={`${iconSize} text-blue-500 flex-shrink-0 ${className ?? ''}`}
        aria-label="Verified"
      />
    )
    tooltip = 'Verified'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center">{icon}</span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
