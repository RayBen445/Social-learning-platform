'use client'

import { motion } from 'framer-motion'

export default function TypingIndicator() {
  const dotVariants = {
    bounce: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  }

  return (
    <div className="flex items-center gap-1">
      <motion.div
        className="h-2 w-2 rounded-full bg-muted-foreground"
        variants={dotVariants}
        animate="bounce"
        transition={{ delay: 0 }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-muted-foreground"
        variants={dotVariants}
        animate="bounce"
        transition={{ delay: 0.2 }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-muted-foreground"
        variants={dotVariants}
        animate="bounce"
        transition={{ delay: 0.4 }}
      />
    </div>
  )
}
