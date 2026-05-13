import { NextRequest, NextResponse } from 'next/server'
import { isBackofficeRequestAuthorized } from '@/lib/backoffice/auth'
import { getBackofficeUserDetail } from '@/lib/backoffice/summary'
import { createAdminClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isBackofficeRequestAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const period = req.nextUrl.searchParams.get('period')

  try {
    const data = await getBackofficeUserDetail(createAdminClient(), id, period)
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to load user transactions',
    }, { status: 500 })
  }
}
