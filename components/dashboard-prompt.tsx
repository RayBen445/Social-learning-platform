'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardPromptProps {
  stepId: string
  message: string
  href: string
}

export function DashboardPrompt({ stepId, message, href }: DashboardPromptProps) {
  const storageKey = `ll_prompt_dismissed_${stepId}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show unless dismissed today
    const dismissed = localStorage.getItem(storageKey)
    const today = new Date().toDateString()
    if (dismissed !== today) {
      setVisible(true)
    }
  }, [storageKey])

  const handleDismiss = () => {
    localStorage.setItem(storageKey, new Date().toDateString())
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 flex items-start gap-3">
      <div className="flex-grow min-w-0">
        <p className="text-sm text-foreground">{message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button asChild size="sm" variant="default" className="h-7 text-xs px-3">
          <Link href={href}>Continue setup</Link>
        </Button>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
