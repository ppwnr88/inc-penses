import type { Transaction } from '@/types'
import { formatDate } from '@/lib/utils/date'

export function exportTransactionsToCsv(transactions: Transaction[], filename?: string): void {
  const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ', 'วิธีบันทึก']

  const rows = transactions.map(t => [
    formatDate(t.date, 'yyyy-MM-dd'),
    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    t.category?.name ?? 'ไม่ระบุหมวดหมู่',
    t.amount.toFixed(2),
    t.note ?? '',
    translateInputMethod(t.input_method),
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename ?? `transactions_${new Date().toISOString().split('T')[0]}.csv`)
}

function translateInputMethod(method: string): string {
  const map: Record<string, string> = {
    manual: 'พิมพ์',
    voice: 'เสียง',
    ocr: 'สแกนใบเสร็จ',
    recurring: 'รายการประจำ',
  }
  return map[method] ?? method
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
