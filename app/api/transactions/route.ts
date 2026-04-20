import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const createSchema = z.object({
  profile_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  note: z.string().max(200).nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  receipt_url: z.string().nullable().optional(),
  input_method: z.enum(['manual', 'voice', 'ocr', 'recurring']).default('manual'),
  recurring_id: z.string().uuid().nullable().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const profileId = searchParams.get('profile_id')

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 })
  }

  const supabase = createServerClient()

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('profile_id', profileId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  const type = searchParams.get('type')
  if (type && type !== 'all') query = query.eq('type', type)

  const categoryId = searchParams.get('category_id')
  if (categoryId) query = query.eq('category_id', categoryId)

  const dateFrom = searchParams.get('date_from')
  if (dateFrom) query = query.gte('date', dateFrom)

  const dateTo = searchParams.get('date_to')
  if (dateTo) query = query.lte('date', dateTo)

  const month = searchParams.get('month')
  const year = searchParams.get('year')
  if (month && year) {
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    const from = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
    const lastDay = new Date(yearNum, monthNum, 0).getDate()
    const to = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`
    query = query.gte('date', from).lte('date', to)
  }

  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const from = (page - 1) * limit
  query = query.range(from, from + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('[Transactions GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit })
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
      .from('transactions')
      .insert(parsed.data)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('[Transactions POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
