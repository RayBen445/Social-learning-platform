'use client'

import { CheckCircle2, Bot, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface VerificationBadgeProps {
  isVerified?: boolean
  verificationType?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function VerificationBadge({
  isVerified = false,
  verificationType = 'user',
  size = 'md',
}: VerificationBadgeProps) {
  if (!isVerified) return null

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const getIcon = () => {
    switch (verificationType) {
      case 'bot':
        return <Bot className={cn('text-blue-500', sizeClasses[size])} />
      case 'system':
        return <Cpu className={cn('text-purple-500', sizeClasses[size])} />
      default:
        return (
          <CheckCircle2 className={cn('text-green-500', sizeClasses[size])} />
        )
    }
  }

  const getTooltip = () => {
    switch (verificationType) {
      case 'bot':
        return 'Bot Account'
      case 'system':
        return 'System Account'
      default:
        return 'Verified User'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center">{getIcon()}</div>
        </TooltipTrigger>
        <TooltipContent>{getTooltip()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
