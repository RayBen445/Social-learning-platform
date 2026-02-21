'use client'

import { motion } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'

interface StaggeredListProps {
  children: React.ReactNode
  staggerChildren?: number
}

export function StaggeredList({
  children,
  staggerChildren = 0.05,
}: StaggeredListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        ...containerVariants,
        animate: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  )
}
