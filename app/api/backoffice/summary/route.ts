import { NextRequest, NextResponse } from 'next/server'
import { isBackofficeRequestAuthorized } from '@/lib/backoffice/auth'
import { getBackofficeSummary } from '@/lib/backoffice/summary'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  if (!isBackofficeRequestAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const period = req.nextUrl.searchParams.get('period')
    const data = await getBackofficeSummary(createAdminClient(), period)
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to load backoffice summary',
    }, { status: 500 })
  }
}
