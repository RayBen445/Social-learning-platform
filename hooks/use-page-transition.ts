'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useLoading } from '@/components/loading-provider'

export function usePageTransition() {
  const router = useRouter()
  const { startLoading, stopLoading } = useLoading()
  const [isPending, startTransition] = useTransition()

  const navigateTo = (href: string, message: string = 'Loading...') => {
    startLoading(message)
    startTransition(() => {
      router.push(href)
      setTimeout(() => stopLoading(), 500)
    })
  }

  return { navigateTo, isPending }
}
