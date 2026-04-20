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
  const XLSX = await import('xlsx')

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

  const worksheetData = [headers, ...rows, ...summaryRows]
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 18 },
    { wch: 16 },
    { wch: 30 },
    { wch: 14 },
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายการ')

  const outputFilename = filename ?? `transactions_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, outputFilename)
}
