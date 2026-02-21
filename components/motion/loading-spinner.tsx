'use client'

import { motion } from 'framer-motion'
import { spinnerVariants } from '@/lib/animations'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  return (
    <motion.div
      animate="animate"
      variants={spinnerVariants}
      className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full`}
    />
  )
}
