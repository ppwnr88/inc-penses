import type { SupabaseClient } from '@supabase/supabase-js'

export type BackofficeUserSummary = {
  id: string
  displayName: string
  email: string | null
  createdAt: string
  monthlySummaryEmailEnabled: boolean
  transactionCount: number
  monthIncome: number
  monthExpense: number
  lastTransactionDate: string | null
}

export type BackofficeUserTransaction = {
  id: string
  date: string
  type: 'income' | 'expense'
  amount: number
  categoryName: string
  note: string | null
}

export type BackofficeUserDetail = {
  user: BackofficeUserSummary
  month: {
    period: string
    year: number
    month: number
    from: string
    to: string
  }
  transactions: BackofficeUserTransaction[]
}

export type BackofficeSummary = {
  generatedAt: string
  availableMonths: Array<{
    period: string
    year: number
    month: number
  }>
  month: {
    period: string
    year: number
    month: number
    from: string
    to: string
  }
  kpis: {
    totalUsers: number
    totalTransactions: number
    monthIncome: number
    monthExpense: number
    monthlySummaryEnabledUsers: number
    monthlyEmailSent: number
    monthlyEmailSkipped: number
    monthlyEmailFailed: number
  }
  users: BackofficeUserSummary[]
}

type ProfileRow = {
  id: string
  display_name: string
  email: string | null
  created_at: string
  monthly_summary_email_enabled: boolean | null
}

type TransactionRow = {
  profile_id: string
  type: 'income' | 'expense'
  amount: number | string
  date: string
}

type UsageLogRow = {
  action: string
}

function getBangkokYearMonth(reference = new Date()): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(reference)

  const year = Number(parts.find(part => part.type === 'year')?.value)
  const month = Number(parts.find(part => part.type === 'month')?.value)
  return { year, month }
}

function getMonthRange(year: number, month: number): { period: string; year: number; month: number; from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  return { period: `${year}-${String(month).padStart(2, '0')}`, year, month, from, to }
}

function getBackofficeAvailableMonths(reference = new Date()): Array<{ period: string; year: number; month: number }> {
  const current = getBangkokYearMonth(reference)

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(current.year, current.month - 1 - index, 1)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return {
      period: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
    }
  })
}

function resolveSelectedMonth(period: string | null | undefined): {
  month: ReturnType<typeof getMonthRange>
  availableMonths: Array<{ period: string; year: number; month: number }>
} {
  const availableMonths = getBackofficeAvailableMonths()
  const selected = availableMonths.find(item => item.period === period) ?? availableMonths[0]

  return {
    month: getMonthRange(selected.year, selected.month),
    availableMonths,
  }
}

export async function getBackofficeSummary(supabase: SupabaseClient, period?: string | null): Promise<BackofficeSummary> {
  const { month, availableMonths } = resolveSelectedMonth(period)

  const [
    profilesResult,
    transactionsCountResult,
    monthTransactionsResult,
    usageLogsResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, email, created_at, monthly_summary_email_enabled')
      .order('created_at', { ascending: false }),
    supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('transactions')
      .select('profile_id, type, amount, date')
      .gte('date', month.from)
      .lte('date', month.to),
    supabase
      .from('usage_logs')
      .select('action')
      .in('action', [
        'monthly_summary_email_sent',
        'monthly_summary_email_skipped',
        'monthly_summary_email_failed',
      ])
      .gte('created_at', month.from),
  ])

  if (profilesResult.error) throw new Error(profilesResult.error.message)
  if (transactionsCountResult.error) throw new Error(transactionsCountResult.error.message)
  if (monthTransactionsResult.error) throw new Error(monthTransactionsResult.error.message)
  if (usageLogsResult.error) throw new Error(usageLogsResult.error.message)

  const profiles = (profilesResult.data ?? []) as ProfileRow[]
  const monthTransactions = (monthTransactionsResult.data ?? []) as TransactionRow[]
  const usageLogs = (usageLogsResult.data ?? []) as UsageLogRow[]

  const userMap = new Map<string, BackofficeUserSummary>()
  for (const profile of profiles) {
    userMap.set(profile.id, {
      id: profile.id,
      displayName: profile.display_name,
      email: profile.email,
      createdAt: profile.created_at,
      monthlySummaryEmailEnabled: Boolean(profile.monthly_summary_email_enabled),
      transactionCount: 0,
      monthIncome: 0,
      monthExpense: 0,
      lastTransactionDate: null,
    })
  }

  let monthIncome = 0
  let monthExpense = 0
  const { data: allTransactions, error: allTransactionsError } = await supabase
    .from('transactions')
    .select('profile_id, date')

  if (allTransactionsError) throw new Error(allTransactionsError.message)

  for (const tx of (allTransactions ?? []) as Array<{ profile_id: string; date: string }>) {
    const user = userMap.get(tx.profile_id)
    if (!user) continue

    user.transactionCount += 1
    if (!user.lastTransactionDate || tx.date > user.lastTransactionDate) {
      user.lastTransactionDate = tx.date
    }
  }

  for (const tx of monthTransactions) {
    const user = userMap.get(tx.profile_id)
    const amount = Number(tx.amount)

    if (tx.type === 'income') {
      monthIncome += amount
      if (user) user.monthIncome += amount
    } else {
      monthExpense += amount
      if (user) user.monthExpense += amount
    }

  }

  const emailCounts = usageLogs.reduce(
    (counts, log) => {
      if (log.action === 'monthly_summary_email_sent') counts.sent += 1
      if (log.action === 'monthly_summary_email_skipped') counts.skipped += 1
      if (log.action === 'monthly_summary_email_failed') counts.failed += 1
      return counts
    },
    { sent: 0, skipped: 0, failed: 0 }
  )

  return {
    generatedAt: new Date().toISOString(),
    availableMonths,
    month,
    kpis: {
      totalUsers: profiles.length,
      totalTransactions: transactionsCountResult.count ?? 0,
      monthIncome,
      monthExpense,
      monthlySummaryEnabledUsers: profiles.filter(profile => profile.monthly_summary_email_enabled).length,
      monthlyEmailSent: emailCounts.sent,
      monthlyEmailSkipped: emailCounts.skipped,
      monthlyEmailFailed: emailCounts.failed,
    },
    users: Array.from(userMap.values()),
  }
}

export async function getBackofficeUserDetail(
  supabase: SupabaseClient,
  profileId: string,
  period?: string | null
): Promise<BackofficeUserDetail> {
  const { month } = resolveSelectedMonth(period)

  const [summary, transactionsResult] = await Promise.all([
    getBackofficeSummary(supabase, month.period),
    supabase
      .from('transactions')
      .select('id, date, type, amount, note, category:categories(name)')
      .eq('profile_id', profileId)
      .gte('date', month.from)
      .lte('date', month.to)
      .order('date', { ascending: false }),
  ])

  if (transactionsResult.error) throw new Error(transactionsResult.error.message)

  const user = summary.users.find(item => item.id === profileId)
  if (!user) throw new Error('User not found')

  return {
    user,
    month,
    transactions: (transactionsResult.data ?? []).map(tx => {
      const category = tx.category as { name?: string } | null
      return {
        id: String(tx.id),
        date: String(tx.date),
        type: tx.type as 'income' | 'expense',
        amount: Number(tx.amount),
        categoryName: category?.name ?? 'ไม่ระบุหมวดหมู่',
        note: tx.note ? String(tx.note) : null,
      }
    }),
  }
}
