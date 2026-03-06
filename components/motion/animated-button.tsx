'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { buttonHoverVariants } from '@/lib/animations'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50')

interface AnimatedButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  children: React.ReactNode
}

export function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={buttonHoverVariants}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  )
}
