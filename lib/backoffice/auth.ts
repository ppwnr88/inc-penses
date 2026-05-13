import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const BACKOFFICE_COOKIE_NAME = 'backoffice_session'
export const BACKOFFICE_SESSION_TTL_SECONDS = 60 * 60 * 24

type SessionPayload = {
  exp: number
}

export function getBackofficeConfigStatus(): { configured: boolean; missing: string[] } {
  const missing = ['BACKOFFICE_PASSWORD', 'BACKOFFICE_SESSION_SECRET'].filter(key => !process.env[key])
  return { configured: missing.length === 0, missing }
}

function signPayload(payload: string): string {
  return createHmac('sha256', process.env.BACKOFFICE_SESSION_SECRET!)
    .update(payload)
    .digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
}

export function verifyBackofficePassword(password: string): boolean {
  const expected = process.env.BACKOFFICE_PASSWORD
  if (!expected) return false
  return safeEqual(password, expected)
}

export function createBackofficeSessionValue(now = Date.now()): string {
  const payload: SessionPayload = {
    exp: now + BACKOFFICE_SESSION_TTL_SECONDS * 1000,
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encodedPayload}.${signPayload(encodedPayload)}`
}

export function verifyBackofficeSessionValue(value: string | undefined, now = Date.now()): boolean {
  if (!value || !process.env.BACKOFFICE_SESSION_SECRET) return false

  const [encodedPayload, signature] = value.split('.')
  if (!encodedPayload || !signature) return false

  const expectedSignature = signPayload(encodedPayload)
  if (!safeEqual(signature, expectedSignature)) return false

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload
    return typeof payload.exp === 'number' && payload.exp > now
  } catch {
    return false
  }
}

export async function isBackofficeSessionValid(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyBackofficeSessionValue(cookieStore.get(BACKOFFICE_COOKIE_NAME)?.value)
}

export function isBackofficeRequestAuthorized(req: NextRequest): boolean {
  return verifyBackofficeSessionValue(req.cookies.get(BACKOFFICE_COOKIE_NAME)?.value)
}

export function getBackofficeCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: BACKOFFICE_SESSION_TTL_SECONDS,
  }
}
