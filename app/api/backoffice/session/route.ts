import { NextResponse } from 'next/server'
import {
  getBackofficeConfigStatus,
  isBackofficeSessionValid,
} from '@/lib/backoffice/auth'

export const runtime = 'nodejs'

export async function GET() {
  const config = getBackofficeConfigStatus()
  if (!config.configured) {
    return NextResponse.json({
      authenticated: false,
      configured: false,
      error: `Backoffice is not configured: ${config.missing.join(', ')}`,
    }, { status: 503 })
  }

  return NextResponse.json({
    authenticated: await isBackofficeSessionValid(),
    configured: true,
  })
}
