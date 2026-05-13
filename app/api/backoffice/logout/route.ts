import { NextResponse } from 'next/server'
import { BACKOFFICE_COOKIE_NAME } from '@/lib/backoffice/auth'

export const runtime = 'nodejs'

export async function POST() {
  const res = NextResponse.json({ authenticated: false })
  res.cookies.set(BACKOFFICE_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
