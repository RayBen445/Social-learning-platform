'use client'

import { motion } from 'framer-motion'
import { slideUpVariants } from '@/lib/animations'

interface SlideUpProps {
  children: React.ReactNode
  delay?: number
}

export function SlideUp({ children, delay = 0 }: SlideUpProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        ...slideUpVariants,
        animate: {
          ...slideUpVariants.animate,
          transition: {
            ...slideUpVariants.animate.transition,
            delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
