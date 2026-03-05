'use client'

import { ReactNode } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'

interface LoadingButtonProps extends ButtonProps {
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
