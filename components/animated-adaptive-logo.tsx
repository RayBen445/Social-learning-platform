'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

export function AnimatedAdaptiveLogo({ 
  size = 'md', 
  className = '',
  animated = true 
}: AnimatedLogoProps) {
  
  const sizeMap = {
    sm: 24,
    md: 48,
    lg: 64,
  }

  const dimension = sizeMap[size]

  const containerVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.05 },
  }

  const circleVariants = {
    idle: { 
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }
    },
  }

  const pathVariants = {
    idle: {
      pathLength: [0, 1, 1],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }
    },
  }

  return (
    <motion.svg
      width={dimension}
      height={dimension}
      viewBox="0 0 64 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      variants={containerVariants}
      initial="idle"
      whileHover={animated ? "hover" : "idle"}
    >
      <defs>
        <linearGradient id="animatedLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'currentColor', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'currentColor', stopOpacity: 0.6 }} />
        </linearGradient>
      </defs>

      {/* Top circle */}
      <motion.circle
        cx="32"
        cy="16"
        r="8"
        fill="url(#animatedLogoGradient)"
        variants={circleVariants}
        animate={animated ? "idle" : undefined}
      />

      {/* Bottom left circle */}
      <motion.circle
        cx="16"
        cy="48"
        r="8"
        fill="url(#animatedLogoGradient)"
        variants={circleVariants}
        animate={animated ? "idle" : undefined}
        transition={{
          ...circleVariants.idle.transition,
          delay: 0.3,
        }}
      />

      {/* Bottom right circle */}
      <motion.circle
        cx="48"
        cy="48"
        r="8"
        fill="url(#animatedLogoGradient)"
        variants={circleVariants}
        animate={animated ? "idle" : undefined}
        transition={{
          ...circleVariants.idle.transition,
          delay: 0.6,
        }}
      />

      {/* Left connecting path */}
      <motion.path
        d="M 32 24 Q 24 32 16 40"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
        strokeDasharray="1"
        variants={pathVariants}
        animate={animated ? "idle" : undefined}
      />

      {/* Right connecting path */}
      <motion.path
        d="M 32 24 Q 40 32 48 40"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
        strokeDasharray="1"
        variants={pathVariants}
        animate={animated ? "idle" : undefined}
        transition={{
          ...pathVariants.idle.transition,
          delay: 0.2,
        }}
      />

      {/* Bottom connecting path */}
      <motion.path
        d="M 16 48 L 48 48"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
        strokeDasharray="1"
        variants={pathVariants}
        animate={animated ? "idle" : undefined}
        transition={{
          ...pathVariants.idle.transition,
          delay: 0.4,
        }}
      />
    </motion.svg>
  )
}
