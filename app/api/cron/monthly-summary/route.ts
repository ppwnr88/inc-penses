import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import {
  buildMonthlyEmailSummary,
  createMonthlySummaryAttachment,
  createMonthlySummaryExcel,
  getPreviousBangkokMonth,
  sendMonthlySummaryEmail,
} from '@/lib/email/monthly-summary'

export const runtime = 'nodejs'
export const maxDuration = 60

type MonthlyEmailProfile = {
  id: string
  display_name: string
  email: string | null
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

async function hasSentMonthlySummary(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  period: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('usage_logs')
    .select('id')
    .eq('profile_id', profileId)
    .eq('action', 'monthly_summary_email_sent')
    .contains('metadata', { period })
    .limit(1)

  if (error) throw new Error(error.message)
  return (data?.length ?? 0) > 0
}

async function logMonthlySummarySent(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  period: string,
  email: string,
  transactionCount: number
): Promise<void> {
  const { error } = await supabase.from('usage_logs').insert({
    profile_id: profileId,
    action: 'monthly_summary_email_sent',
    metadata: { period, email, transaction_count: transactionCount },
  })

  if (error) throw new Error(error.message)
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const period = getPreviousBangkokMonth()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('monthly_summary_email_enabled', true)
    .not('email', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = {
    period: period.period,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [] as Array<{ profile_id: string; message: string }>,
  }

  for (const profile of (profiles ?? []) as MonthlyEmailProfile[]) {
    if (!profile.email) {
      results.skipped += 1
      continue
    }

    try {
      const sent = await hasSentMonthlySummary(supabase, profile.id, period.period)
      if (sent) {
        results.skipped += 1
        continue
      }

      const summary = await buildMonthlyEmailSummary(
        supabase,
        { id: profile.id, display_name: profile.display_name, email: profile.email },
        period
      )
      const buffer = await createMonthlySummaryExcel(summary)
      await sendMonthlySummaryEmail(summary, createMonthlySummaryAttachment(summary, buffer))
      await logMonthlySummarySent(supabase, profile.id, period.period, profile.email, summary.transactionCount)
      results.sent += 1
    } catch (err) {
      results.failed += 1
      results.errors.push({
        profile_id: profile.id,
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({ data: results })
}
