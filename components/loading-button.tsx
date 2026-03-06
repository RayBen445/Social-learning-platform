'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50')

interface LoadingButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
}

export function LoadingButton({
  isLoading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
          </div>
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  )
}
