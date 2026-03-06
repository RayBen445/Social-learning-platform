'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { LoadingScreen } from './loading-screen'

interface LoadingContextType {
  isLoading: boolean
  message: string
  startLoading: (message?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Loading LearnLoop...')

  const startLoading = (msg: string = 'Loading LearnLoop...') => {
    setMessage(msg)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, message, startLoading, stopLoading }}>
      <LoadingScreen show={isLoading} message={message} />
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}
