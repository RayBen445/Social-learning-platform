'use client'

import { BadgeCheck, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
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
  animated?: boolean
}

const badgeVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  pulse: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  shimmer: {
    boxShadow: [
      '0 0 0px rgba(59, 130, 246, 0)',
      '0 0 8px rgba(59, 130, 246, 0.6)',
      '0 0 0px rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  bounce: {
    y: [0, -3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export function VerifiedBadge({
  verificationType,
  size = 'sm',
  className,
  animated = true,
}: VerifiedBadgeProps) {
  const iconSize = size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  let icon: React.ReactNode
  let tooltip: string
  let animationType: 'pulse' | 'spin' | 'shimmer' | 'bounce' | null = null
  let color = 'text-blue-500'

  if (verificationType === 'pending') {
    icon = <Clock className={`${iconSize} text-yellow-500 flex-shrink-0`} aria-label="Verification pending" />
    tooltip = 'Verification Pending'
    animationType = 'pulse'
  } else if (verificationType === 'institution') {
    icon = (
      <BadgeCheck className={`${iconSize} text-emerald-500 flex-shrink-0`} aria-label="Institution Verified" />
    )
    tooltip = '🏫 Institution Verified'
    animationType = 'shimmer'
    color = 'text-emerald-500'
  } else if (verificationType === 'bot') {
    icon = <BadgeCheck className={`${iconSize} text-green-500 flex-shrink-0`} aria-label="Bot account" />
    tooltip = '🤖 Bot Account'
    animationType = 'spin'
    color = 'text-green-500'
  } else if (verificationType === 'system') {
    icon = <BadgeCheck className={`${iconSize} text-purple-500 flex-shrink-0`} aria-label="System account" />
    tooltip = '⚙️ System Account'
    animationType = 'bounce'
    color = 'text-purple-500'
  } else if (verificationType === 'student' || !verificationType) {
    // Verified student (default)
    icon = (
      <BadgeCheck className={`${iconSize} text-blue-500 flex-shrink-0`} aria-label="Verified Student" />
    )
    tooltip = '🎓 Verified Student'
    animationType = 'pulse'
    color = 'text-blue-500'
  } else {
    // Fallback for unrecognised types
    icon = <BadgeCheck className={`${iconSize} text-blue-500 flex-shrink-0`} aria-label="Verified" />
    tooltip = 'Verified'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="inline-flex items-center"
            variants={animationType && animated ? badgeVariants[animationType] : undefined}
            animate={animationType && animated ? animationType : undefined}
          >
            {icon}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
