import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Transaction } from '@/types'

function translateInputMethod(method: string): string {
  const map: Record<string, string> = {
    manual: 'พิมพ์',
    voice: 'เสียง',
    ocr: 'สแกนใบเสร็จ',
    recurring: 'รายการประจำ',
  }
  return map[method] ?? method
}

function formatDateStr(date: string): string {
  return date
}

function toCsvRow(cells: string[]): string {
  return cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const profileId = searchParams.get('profile_id')
  const type = searchParams.get('type') ?? 'csv'
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 })
  }

  const supabase = createServerClient()

  let query = supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('profile_id', profileId)
    .order('date', { ascending: false })

  if (month && year) {
    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    const from = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
    const lastDay = new Date(yearNum, monthNum, 0).getDate()
    const to = `${yearNum}-${String(monthNum).padStart(2, '0')}-${lastDay}`
    query = query.gte('date', from).lte('date', to)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const transactions = (data ?? []) as Transaction[]

  if (type === 'csv') {
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ', 'วิธีบันทึก']
    const rows = transactions.map(t => [
      formatDateStr(t.date),
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.category?.name ?? 'ไม่ระบุหมวดหมู่',
      t.amount.toFixed(2),
      t.note ?? '',
      translateInputMethod(t.input_method),
    ])

    const bom = '\uFEFF'
    const csv = bom + [headers, ...rows].map(row => toCsvRow(row)).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transactions.csv"`,
      },
    })
  }

  if (type === 'excel') {
    const XLSX = await import('xlsx')

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ', 'วิธีบันทึก']
    const rows = transactions.map(t => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      t.category?.name ?? 'ไม่ระบุหมวดหมู่',
      t.amount,
      t.note ?? '',
      translateInputMethod(t.input_method),
    ])

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    const summaryRows = [
      [],
      ['สรุป', '', '', '', '', ''],
      ['รายรับทั้งหมด', '', '', totalIncome, '', ''],
      ['รายจ่ายทั้งหมด', '', '', totalExpense, '', ''],
      ['คงเหลือ', '', '', totalIncome - totalExpense, '', ''],
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows, ...summaryRows])
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 16 }, { wch: 30 }, { wch: 14 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'รายการ')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="transactions.xlsx"`,
      },
    })
  }

  return NextResponse.json({ error: 'Invalid type. Use csv or excel' }, { status: 400 })
}
