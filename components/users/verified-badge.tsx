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
  } else if (verificationType === 'bot') {
    icon = <BadgeCheck className={`${iconSize} text-green-500 flex-shrink-0`} aria-label="Bot account" />
    tooltip = '🤖 Bot Account'
    animationType = 'spin'
  } else if (verificationType === 'system') {
    icon = <BadgeCheck className={`${iconSize} text-purple-500 flex-shrink-0`} aria-label="System account" />
    tooltip = '⚙️ System Account'
    animationType = 'bounce'
  } else if (verificationType === 'student' || !verificationType) {
    icon = (
      <BadgeCheck className={`${iconSize} text-blue-500 flex-shrink-0`} aria-label="Verified Student" />
    )
    tooltip = '🎓 Verified Student'
    animationType = 'pulse'
  } else {
    icon = <BadgeCheck className={`${iconSize} text-blue-500 flex-shrink-0`} aria-label="Verified" />
    tooltip = 'Verified'
  }

  // Render different animations based on type
  const renderAnimatedIcon = () => {
    if (!animated || !animationType) {
      return <div className="inline-flex items-center">{icon}</div>
    }

    if (animationType === 'spin') {
      return (
        <motion.div
          className="inline-flex items-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {icon}
        </motion.div>
      )
    }

    if (animationType === 'pulse') {
      return (
        <motion.div
          className="inline-flex items-center"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )
    }

    if (animationType === 'shimmer') {
      return (
        <motion.div
          className="inline-flex items-center"
          animate={{
            boxShadow: [
              '0 0 0px rgba(59, 130, 246, 0)',
              '0 0 8px rgba(59, 130, 246, 0.6)',
              '0 0 0px rgba(59, 130, 246, 0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )
    }

    if (animationType === 'bounce') {
      return (
        <motion.div
          className="inline-flex items-center"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )
    }

    return <div className="inline-flex items-center">{icon}</div>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {renderAnimatedIcon()}
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
