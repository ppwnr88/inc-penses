import type { Transaction } from '@/types'
import { formatDate } from '@/lib/utils/date'

function translateInputMethod(method: string): string {
  const map: Record<string, string> = {
    manual: 'พิมพ์',
    voice: 'เสียง',
    ocr: 'สแกนใบเสร็จ',
    recurring: 'รายการประจำ',
  }
  return map[method] ?? method
}

export async function exportTransactionsToExcel(
  transactions: Transaction[],
  filename?: string
): Promise<void> {
  const ExcelJS = await import('exceljs')

  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ', 'วิธีบันทึก']

  const rows = transactions.map(t => [
    formatDate(t.date, 'yyyy-MM-dd'),
    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    t.category?.name ?? 'ไม่ระบุหมวดหมู่',
    t.amount,
    t.note ?? '',
    translateInputMethod(t.input_method),
  ])

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const summaryRows = [
    [],
    ['สรุป', '', '', '', '', ''],
    ['รายรับทั้งหมด', '', '', totalIncome, '', ''],
    ['รายจ่ายทั้งหมด', '', '', totalExpense, '', ''],
    ['คงเหลือ', '', '', totalIncome - totalExpense, '', ''],
  ]

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('รายการ')
  worksheet.addRows([headers, ...rows, ...summaryRows])
  worksheet.columns = [12, 10, 18, 16, 30, 14].map(width => ({ width }))
  const buffer = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename ?? `transactions_${new Date().toISOString().split('T')[0]}.xlsx`
  link.click()
  URL.revokeObjectURL(url)
}
