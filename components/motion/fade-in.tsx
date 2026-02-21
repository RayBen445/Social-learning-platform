'use client'

import { motion } from 'framer-motion'
import { fadeInVariants } from '@/lib/animations'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
}

export function FadeIn({ children, delay = 0, duration = 0.3 }: FadeInProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        ...fadeInVariants,
        animate: {
          ...fadeInVariants.animate,
          transition: {
            duration,
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
