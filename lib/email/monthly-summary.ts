import type { SupabaseClient } from '@supabase/supabase-js'
import type { CategorySummary, Transaction } from '@/types'
import { parseEmailList } from '@/lib/email/recipients'
import { getThaiMonthName } from '@/lib/utils/date'

type ProfileForEmail = {
  id: string
  display_name: string
  email: string
  monthly_summary_email_cc?: string | null
}

export type MonthlyEmailSummary = {
  profile: ProfileForEmail
  month: number
  year: number
  period: string
  periodLabel: string
  from: string
  to: string
  totalIncome: number
  totalExpense: number
  net: number
  transactionCount: number
  byCategory: CategorySummary[]
  transactions: Transaction[]
}

type ResendAttachment = {
  filename: string
  content: string
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
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

export function getPreviousBangkokMonth(reference = new Date()): {
  month: number
  year: number
  period: string
  periodLabel: string
  from: string
  to: string
} {
  const current = getBangkokYearMonth(reference)
  const month = current.month === 1 ? 12 : current.month - 1
  const year = current.month === 1 ? current.year - 1 : current.year
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  return {
    month,
    year,
    period: `${year}-${String(month).padStart(2, '0')}`,
    periodLabel: `${getThaiMonthName(month)} ${year + 543}`,
    from,
    to,
  }
}

function buildCategorySummary(transactions: Transaction[], totalIncome: number, totalExpense: number): CategorySummary[] {
  const categoryMap = new Map<string, CategorySummary>()

  for (const tx of transactions) {
    const key = `${tx.type}:${tx.category_id ?? 'uncategorized'}`
    const existing = categoryMap.get(key)
    if (existing) {
      existing.total += Number(tx.amount)
      existing.count += 1
      continue
    }

    categoryMap.set(key, {
      category_id: tx.category_id,
      category_name: tx.category?.name ?? 'ไม่ระบุหมวดหมู่',
      category_icon: tx.category?.icon ?? '💰',
      category_color: tx.category?.color ?? '#84a06e',
      type: tx.type,
      total: Number(tx.amount),
      count: 1,
      percentage: 0,
    })
  }

  return Array.from(categoryMap.values())
    .map(cat => ({
      ...cat,
      percentage:
        cat.type === 'expense' && totalExpense > 0
          ? (cat.total / totalExpense) * 100
          : cat.type === 'income' && totalIncome > 0
            ? (cat.total / totalIncome) * 100
            : 0,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'income' ? -1 : 1
      return b.total - a.total
    })
}

export async function buildMonthlyEmailSummary(
  supabase: SupabaseClient,
  profile: ProfileForEmail,
  period = getPreviousBangkokMonth()
): Promise<MonthlyEmailSummary> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('profile_id', profile.id)
    .gte('date', period.from)
    .lte('date', period.to)
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)

  const transactions = (data ?? []) as Transaction[]
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, tx) => sum + Number(tx.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount), 0)

  return {
    profile,
    ...period,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    transactionCount: transactions.length,
    byCategory: buildCategorySummary(transactions, totalIncome, totalExpense),
    transactions,
  }
}

export async function createMonthlySummaryExcel(summary: MonthlyEmailSummary): Promise<Buffer> {
  const XLSX = await import('xlsx')

  const summaryRows = [
    ['สรุปเดือน', summary.periodLabel],
    ['รวมรับ', summary.totalIncome],
    ['รวมจ่าย', summary.totalExpense],
    ['คงเหลือสุทธิ', summary.net],
    ['จำนวนรายการทั้งหมด', summary.transactionCount],
  ]

  const categoryRows = summary.byCategory.map(cat => [
    cat.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    cat.category_name,
    cat.count,
    cat.total,
    `${cat.percentage.toFixed(1)}%`,
  ])

  const transactionRows = summary.transactions.map(tx => [
    tx.date,
    tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    tx.category?.name ?? 'ไม่ระบุหมวดหมู่',
    Number(tx.amount),
    tx.note ?? '',
    tx.input_method,
  ])

  const wb = XLSX.utils.book_new()

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['จด - สรุปรายรับรายจ่ายประจำเดือน'],
    [],
    ...summaryRows,
    [],
    ['ประเภท', 'หมวดหมู่', 'จำนวนรายการ', 'ยอดรวม', 'สัดส่วน'],
    ...categoryRows,
  ])
  summarySheet['!cols'] = [{ wch: 18 }, { wch: 26 }, { wch: 14 }, { wch: 16 }, { wch: 12 }]

  const transactionSheet = XLSX.utils.aoa_to_sheet([
    ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ', 'วิธีบันทึก'],
    ...transactionRows,
  ])
  transactionSheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 22 }, { wch: 16 }, { wch: 34 }, { wch: 14 }]

  XLSX.utils.book_append_sheet(wb, summarySheet, 'สรุป')
  XLSX.utils.book_append_sheet(wb, transactionSheet, 'รายการ')

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

export function buildMonthlySummaryEmailHtml(summary: MonthlyEmailSummary): string {
  const netColor = summary.net >= 0 ? '#2f7d4f' : '#c74353'

  return `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">สรุปรายรับรายจ่าย ${summary.periodLabel}</h2>
      <p style="margin: 0 0 16px;">สวัสดี ${summary.profile.display_name}, แนบไฟล์ Excel สรุปรายรับรายจ่ายของเดือนก่อนหน้าไว้ในอีเมลนี้แล้ว</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 520px;">
        <tr><td style="padding: 8px 0; color: #666;">รวมรับ</td><td style="padding: 8px 0; text-align: right; color: #2f7d4f;">${formatMoney(summary.totalIncome)} บาท</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">รวมจ่าย</td><td style="padding: 8px 0; text-align: right; color: #c74353;">${formatMoney(summary.totalExpense)} บาท</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">คงเหลือสุทธิ</td><td style="padding: 8px 0; text-align: right; color: ${netColor};">${formatMoney(summary.net)} บาท</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">จำนวนรายการทั้งหมด</td><td style="padding: 8px 0; text-align: right;">${summary.transactionCount} รายการ</td></tr>
      </table>
      <p style="margin-top: 18px; color: #777; font-size: 12px;">คุณได้รับอีเมลนี้เพราะเปิดการส่งสรุปรายเดือนอัตโนมัติในหน้าตั้งค่าของแอปจด</p>
    </div>
  `
}

export async function sendMonthlySummaryEmail(summary: MonthlyEmailSummary, attachment: ResendAttachment): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const to = parseEmailList(summary.profile.email)
  const toSet = new Set(to.map(email => email.toLowerCase()))
  const cc = parseEmailList(summary.profile.monthly_summary_email_cc).filter(email => !toSet.has(email.toLowerCase()))
  if (to.length === 0) throw new Error('No monthly summary recipients')

  const from = process.env.EMAIL_FROM ?? 'noreply@wannarat.cc'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `จด <${from}>`,
      to,
      ...(cc.length > 0 ? { cc } : {}),
      subject: `สรุปรายรับรายจ่าย ${summary.periodLabel}`,
      html: buildMonthlySummaryEmailHtml(summary),
      attachments: [attachment],
    }),
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(`Resend error: ${message}`)
  }
}

export function createMonthlySummaryAttachment(summary: MonthlyEmailSummary, buffer: Buffer): ResendAttachment {
  return {
    filename: `jod-summary-${summary.period}.xlsx`,
    content: buffer.toString('base64'),
  }
}
