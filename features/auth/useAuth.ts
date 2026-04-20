'use client'

import { useAuthContext } from './LiffProvider'

export function useAuth() {
  return useAuthContext()
}
