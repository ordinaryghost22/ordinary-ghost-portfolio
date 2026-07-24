import { useContext } from 'react'

import { ScrollProgressContext } from '@/context/scroll-progress-context'

export function useScrollProgress() {
  const ctx = useContext(ScrollProgressContext)
  if (!ctx) {
    throw new Error('useScrollProgress must be used within ScrollProgressProvider')
  }
  return ctx
}
