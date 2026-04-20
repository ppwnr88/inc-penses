import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const createSchema = z.object({
  profile_id: z.string().uuid(),
  category_id: z.string().uuid(),
  amount: z.number().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const profileId = searchParams.get('profile_id')
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Get budgets with their categories
  let query = supabase
    .from('budgets')
    .select('*, category:categories(*)')
    .eq('profile_id', profileId)

  if (month) query = query.eq('month', parseInt(month))
  if (year) query = query.eq('year', parseInt(year))

  const { data: budgets, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Calculate spent amount for each budget
  const enriched = await Promise.all(
    (budgets ?? []).map(async budget => {
      const monthNum = month ? parseInt(month) : new Date().getMonth() + 1
      const yearNum = year ? parseInt(year) : new Date().getFullYear()
      const from = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
      const lastDay = new Date(yearNum, monthNum, 0).getDate()
      const to = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`

      const { data: txData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('profile_id', profileId)
        .eq('category_id', budget.category_id)
        .eq('type', 'expense')
        .gte('date', from)
        .lte('date', to)

      const spent = (txData ?? []).reduce((sum, t) => sum + Number(t.amount), 0)
      return { ...budget, spent }
    })
  )

  return NextResponse.json({ data: enriched })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('budgets')
      .upsert(parsed.data, { onConflict: 'profile_id,category_id,month,year' })
      .select('*, category:categories(*)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
