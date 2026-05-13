import { NextRequest, NextResponse } from 'next/server'
import {
  BACKOFFICE_COOKIE_NAME,
  createBackofficeSessionValue,
  getBackofficeConfigStatus,
  getBackofficeCookieOptions,
  verifyBackofficePassword,
} from '@/lib/backoffice/auth'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const config = getBackofficeConfigStatus()
  if (!config.configured) {
    return NextResponse.json({
      error: `Backoffice is not configured: ${config.missing.join(', ')}`,
    }, { status: 503 })
  }

  const body = await req.json().catch(() => null) as { password?: string } | null
  if (!body?.password || !verifyBackofficePassword(body.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ authenticated: true })
  res.cookies.set(BACKOFFICE_COOKIE_NAME, createBackofficeSessionValue(), getBackofficeCookieOptions())
  return res
}
