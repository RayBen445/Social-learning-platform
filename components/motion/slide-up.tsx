'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { slideUpVariants } from '@/lib/animations'

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
}

export function SlideUp({ children, delay = 0 }: SlideUpProps) {
  const customVariants: Variants = {
    initial: slideUpVariants.initial,
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        delay,
      },
    },
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={customVariants}
    >
      {children}
    </motion.div>
  )
}
