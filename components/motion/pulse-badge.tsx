'use client'

import { motion } from 'framer-motion'
import { badgePulseVariants } from '@/lib/animations'

interface PulseBadgeProps {
  children: React.ReactNode
  count?: number
}

export function PulseBadge({ children, count }: PulseBadgeProps) {
  return (
    <div className="relative">
      {children}
      {count !== undefined && count > 0 && (
        <motion.div
          variants={badgePulseVariants}
          animate="animate"
          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}
    </div>
  )
}
