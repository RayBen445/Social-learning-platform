'use client'

import Link from 'next/link'
import { AdaptiveLogo } from './adaptive-logo'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  variant?: 'icon' | 'full'
}

export function Logo({ 
  href = '/', 
  size = 'md', 
  showText = true, 
  className = '',
  variant = 'icon'
}: LogoProps) {
  
  const logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center">
        {/* Icon only - adapts to background color */}
        <AdaptiveLogo 
          size={size} 
          variant="icon"
          className="text-foreground dark:text-foreground transition-colors"
        />
      </div>
      {showText && (
        <div className="hidden sm:block">
          <h1 className={`font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent ${
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'
          }`}>
            LearnLoop
          </h1>
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logo}</Link>
  }

  return logo
}
