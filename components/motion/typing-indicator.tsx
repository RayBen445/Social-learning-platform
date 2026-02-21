'use client'

import { motion } from 'framer-motion'
import { typingContainerVariants, typingDotVariants } from '@/lib/animations'

export function TypingIndicator() {
  return (
    <motion.div
      variants={typingContainerVariants}
      animate="animate"
      className="flex gap-1"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={typingDotVariants}
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          className="w-2 h-2 bg-muted-foreground rounded-full"
        />
      ))}
    </motion.div>
  )
}
