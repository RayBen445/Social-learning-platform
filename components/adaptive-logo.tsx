'use client'

import React from 'react'

interface AdaptiveLogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'full'
  className?: string
}

export function AdaptiveLogo({ size = 'md', variant = 'full', className = '' }: AdaptiveLogoProps) {
  const sizeMap = {
    sm: 24,
    md: 48,
    lg: 64,
  }

  const dimension = sizeMap[size]

  if (variant === 'icon') {
    return (
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 64 64"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        
        {/* Main Loop Shape - Interconnected circles symbolizing learning community */}
        <g className="fill-current text-current">
          {/* Top circle */}
          <circle cx="32" cy="16" r="8" fill="url(#logoGradient)" opacity="0.9" />
          
          {/* Bottom left circle */}
          <circle cx="16" cy="48" r="8" fill="url(#logoGradient)" opacity="0.8" />
          
          {/* Bottom right circle */}
          <circle cx="48" cy="48" r="8" fill="url(#logoGradient)" opacity="0.7" />
          
          {/* Central connecting paths */}
          <path
            d="M 32 24 Q 24 32 16 40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 32 24 Q 40 32 48 40"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 16 48 L 48 48"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      </svg>
    )
  }

  return (
    <svg
      width={dimension * 3.5}
      height={dimension}
      viewBox="0 0 224 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fullLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.6 }} />
        </linearGradient>
      </defs>

      {/* Logo Mark */}
      <g className="fill-current text-current">
        {/* Top circle */}
        <circle cx="32" cy="16" r="8" fill="url(#fullLogoGradient)" opacity="0.9" />
        
        {/* Bottom left circle */}
        <circle cx="16" cy="48" r="8" fill="url(#fullLogoGradient)" opacity="0.8" />
        
        {/* Bottom right circle */}
        <circle cx="48" cy="48" r="8" fill="url(#fullLogoGradient)" opacity="0.7" />
        
        {/* Central connecting paths */}
        <path
          d="M 32 24 Q 24 32 16 40"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 32 24 Q 40 32 48 40"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M 16 48 L 48 48"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      {/* Text Logo */}
      <g className="fill-current text-current">
        <text
          x="72"
          y="42"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.5"
        >
          LearnLoop
        </text>
      </g>

      {/* Tagline */}
      <g className="fill-current text-current" opacity="0.7">
        <text
          x="72"
          y="56"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="10"
          fontWeight="400"
          letterSpacing="0.5"
        >
          Learn Together
        </text>
      </g>
    </svg>
  )
}
