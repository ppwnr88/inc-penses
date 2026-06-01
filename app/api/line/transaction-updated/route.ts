import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { pushMessage } from '@/lib/line/reply'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const bodySchema = z.object({
  profile_id: z.string().uuid(),
  transaction_id: z.string().uuid(),
})

type TransactionWithCategory = {
  id: string
  profile_id: string
  type: 'income' | 'expense'
  amount: number | string
  note: string | null
  date: string
  category: { name: string } | { name: string }[] | null
}

function formatMoney(amount: number | string): string {
  return Number(amount).toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function formatDate(date: string, lang?: string | null): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function buildUpdatedMessage(tx: TransactionWithCategory, lang?: string | null): string {
  const isIncome = tx.type === 'income'
  const category = Array.isArray(tx.category) ? tx.category[0] : tx.category
  const sign = isIncome ? '+' : '-'
  const typeLabel = lang === 'en' ? (isIncome ? 'Income' : 'Expense') : isIncome ? 'รายรับ' : 'รายจ่าย'
  const title = lang === 'en' ? 'Transaction updated' : 'แก้ไขรายการแล้ว'
  const categoryLabel = lang === 'en' ? 'Category' : 'หมวดหมู่'
  const itemLabel = lang === 'en' ? 'Item' : 'รายการ'
  const dateLabel = lang === 'en' ? 'Date' : 'วันที่'

  return [
    title,
    `${typeLabel}: ${sign}฿${formatMoney(tx.amount)}`,
    `${categoryLabel}: ${category?.name ?? (lang === 'en' ? 'Uncategorized' : 'ไม่ระบุหมวดหมู่')}`,
    `${itemLabel}: ${tx.note ?? '-'}`,
    `${dateLabel}: ${formatDate(tx.date, lang)}`,
  ].join('\n')
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { profile_id: profileId, transaction_id: transactionId } = parsed.data

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, line_user_id, lang')
    .eq('id', profileId)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { data: tx, error: txError } = await supabase
    .from('transactions')
    .select('id, profile_id, type, amount, note, date, category:categories(name)')
    .eq('id', transactionId)
    .eq('profile_id', profileId)
    .single()

  if (txError || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  try {
    await pushMessage(profile.line_user_id, [
      {
        type: 'text',
        text: buildUpdatedMessage(tx as unknown as TransactionWithCategory, profile.lang),
      },
    ])
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to push LINE message' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true })
}
