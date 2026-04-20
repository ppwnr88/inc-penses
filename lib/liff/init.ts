'use client'

let initialized = false

export async function initLiff(): Promise<void> {
  if (initialized) return

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  if (!liffId || liffId === 'YOUR_LIFF_ID_HERE') {
    console.warn('[LIFF] No LIFF ID configured. Running in mock mode.')
    initialized = true
    return
  }

  const liff = (await import('@line/liff')).default
  await liff.init({ liffId })
  initialized = true
}

export async function getLiffModule() {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  if (!liffId || liffId === 'YOUR_LIFF_ID_HERE') {
    return null
  }
  const liff = (await import('@line/liff')).default
  return liff
}

export function isMockMode(): boolean {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID
  return !liffId || liffId === 'YOUR_LIFF_ID_HERE'
}
