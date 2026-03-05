'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingScreenProps {
  message?: string
  show?: boolean
}

export function LoadingScreen({ message = 'Loading LearnLoop...', show = true }: LoadingScreenProps) {
  const [displayText, setDisplayText] = useState('')
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (!isVisible) return

    const chars = message.split('')
    let currentChar = 0

    const interval = setInterval(() => {
      if (currentChar <= chars.length) {
        setDisplayText(chars.slice(0, currentChar).join(''))
        currentChar++
      } else {
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [message, isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 backdrop-blur-sm">
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(79, 70, 229, 0.3), 
                        0 0 40px rgba(16, 185, 129, 0.1);
            opacity: 1;
          }
          50% { 
            box-shadow: 0 0 40px rgba(79, 70, 229, 0.5), 
                        0 0 80px rgba(16, 185, 129, 0.2);
            opacity: 0.95;
          }
        }
        @keyframes float-up {
          0% { transform: translateY(10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float-up 0.6s ease-out forwards;
        }
      `}</style>

      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl animate-pulse-glow"></div>

          {/* Logo with spin animation */}
          <div className="relative animate-spin-slow">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-accent opacity-0 blur-md"></div>
            <Image
              src="/images/learnloop-logo.jpg"
              alt="LearnLoop"
              width={120}
              height={120}
              className="relative z-10 rounded-lg shadow-2xl border-2 border-primary/30"
              priority
            />
          </div>

          {/* Rotating dots around logo */}
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary rounded-full -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-accent rounded-full -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-primary/60 rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 w-2 h-2 bg-accent/60 rounded-full -translate-y-1/2"></div>
          </div>
        </div>

        {/* Text Container */}
        <div className="text-center space-y-3">
          {/* Main Message */}
          <div className="animate-float" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {displayText}
              <span className="animate-pulse">|</span>
            </h2>
          </div>

          {/* Loading dots */}
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>

          {/* Subtext */}
          <p className="text-xs text-muted-foreground">
            Connecting to your learning community...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"
            style={{
              width: '70%',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
          </div>
        </div>
      </div>
    </div>
  )
}
