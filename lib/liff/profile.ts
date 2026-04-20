'use client'

import type { LiffProfile } from '@/types/liff'

export const MOCK_PROFILE: LiffProfile = {
  userId: 'mock_user_001',
  displayName: 'ผู้ใช้ทดสอบ',
  pictureUrl: undefined,
  statusMessage: 'กำลังทดสอบแอป',
}

export async function fetchLiffProfile(): Promise<LiffProfile | null> {
  const { isMockMode, getLiffModule } = await import('./init')

  if (isMockMode()) {
    return MOCK_PROFILE
  }

  const liff = await getLiffModule()
  if (!liff) return MOCK_PROFILE

  try {
    if (!liff.isLoggedIn()) return null
    const profile = await liff.getProfile()
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    }
  } catch (err) {
    console.error('[LIFF] Failed to fetch profile:', err)
    return null
  }
}

export async function liffLogin(): Promise<void> {
  const { isMockMode, getLiffModule } = await import('./init')
  if (isMockMode()) return

  const liff = await getLiffModule()
  if (!liff) return
  liff.login()
}

export async function isLiffLoggedIn(): Promise<boolean> {
  const { isMockMode, getLiffModule } = await import('./init')
  if (isMockMode()) return true

  const liff = await getLiffModule()
  if (!liff) return false

  try {
    return liff.isLoggedIn()
  } catch {
    return false
  }
}
