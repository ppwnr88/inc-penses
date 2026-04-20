'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Profile } from '@/types'
import type { LiffProfile } from '@/types/liff'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

interface AuthContextValue {
  profile: Profile | null
  lineProfile: LiffProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within LiffProvider')
  return ctx
}

interface LiffProviderProps {
  children: React.ReactNode
}

export function LiffProvider({ children }: LiffProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lineProfile, setLineProfile] = useState<LiffProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const init = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { initLiff, isMockMode } = await import('@/lib/liff/init')
      await initLiff()

      const { fetchLiffProfile, isLiffLoggedIn, liffLogin } = await import('@/lib/liff/profile')

      const loggedIn = await isLiffLoggedIn()

      if (!loggedIn && !isMockMode()) {
        liffLogin()
        return
      }

      const liffUser = await fetchLiffProfile()
      if (!liffUser) {
        setError('ไม่สามารถดึงข้อมูลโปรไฟล์ LINE ได้')
        setLoading(false)
        return
      }

      setLineProfile(liffUser)

      const res = await fetch('/api/auth/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineUserId: liffUser.userId,
          displayName: liffUser.displayName,
          pictureUrl: liffUser.pictureUrl ?? null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? 'Auth failed')
      }

      const data = (await res.json()) as { profile: Profile }
      setProfile(data.profile)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <AuthContext.Provider value={{ profile, lineProfile, loading, error, refetch: init }}>
      {children}
    </AuthContext.Provider>
  )
}
