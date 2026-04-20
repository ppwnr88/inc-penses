import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { CategorySummary, ReportSummary, WeeklySummary } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const profileId = searchParams.get('profile_id')
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('profile_id', profileId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const txList = transactions ?? []

  const totalIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Category breakdown
  const categoryMap = new Map<string, CategorySummary>()
  for (const tx of txList) {
    const key = tx.category_id ?? 'uncategorized'
    const existing = categoryMap.get(key)
    if (existing) {
      existing.total += Number(tx.amount)
      existing.count += 1
    } else {
      const cat = tx.category as { name: string; icon: string; color: string } | null
      categoryMap.set(key, {
        category_id: tx.category_id,
        category_name: cat?.name ?? 'ไม่ระบุหมวดหมู่',
        category_icon: cat?.icon ?? '💰',
        category_color: cat?.color ?? '#84a06e',
        type: tx.type as 'income' | 'expense',
        total: Number(tx.amount),
        count: 1,
        percentage: 0,
      })
    }
  }

  // Calculate percentages
  const byCategory: CategorySummary[] = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    percentage:
      cat.type === 'expense' && totalExpense > 0
        ? (cat.total / totalExpense) * 100
        : cat.type === 'income' && totalIncome > 0
          ? (cat.total / totalIncome) * 100
          : 0,
  })).sort((a, b) => b.total - a.total)

  // Weekly breakdown
  const weeklyMap = new Map<number, WeeklySummary>()
  for (const tx of txList) {
    const txDate = new Date(tx.date)
    const dayOfMonth = txDate.getDate()
    const weekNum = Math.ceil(dayOfMonth / 7)

    if (!weeklyMap.has(weekNum)) {
      weeklyMap.set(weekNum, {
        week: weekNum,
        weekLabel: `สัปดาห์ที่ ${weekNum}`,
        income: 0,
        expense: 0,
      })
    }

    const weekData = weeklyMap.get(weekNum)!
    if (tx.type === 'income') weekData.income += Number(tx.amount)
    else weekData.expense += Number(tx.amount)
  }

  // Ensure all weeks in month are represented
  const totalWeeks = Math.ceil(lastDay / 7)
  const byWeek: WeeklySummary[] = Array.from({ length: totalWeeks }, (_, i) => {
    const weekNum = i + 1
    return weeklyMap.get(weekNum) ?? {
      week: weekNum,
      weekLabel: `สัปดาห์ที่ ${weekNum}`,
      income: 0,
      expense: 0,
    }
  })

  const report: ReportSummary = {
    month,
    year,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    transactionCount: txList.length,
    byCategory,
    byWeek,
  }

  return NextResponse.json({ data: report })
}
