import type { TransactionType } from '@/types'

export interface ParsedTransaction {
  amount: number
  note: string
  type: TransactionType
  date?: string  // YYYY-MM-DD, undefined = today
  isCommand: false
}

export interface ParsedCommand {
  isCommand: true
  command: 'summary' | 'delete' | 'help' | 'unknown'
}

export type ParseResult = ParsedTransaction | ParsedCommand

// Thai numeral → Arabic
function thaiToArabic(s: string): string {
  const map: Record<string, string> = {
    '๐':'0','๑':'1','๒':'2','๓':'3','๔':'4',
    '๕':'5','๖':'6','๗':'7','๘':'8','๙':'9',
  }
  return s.replace(/[๐-๙]/g, c => map[c] ?? c)
}

const INCOME_KEYWORDS = [
  'เงินเดือน','salary','โบนัส','bonus','ปันผล','dividend',
  'ขายของ','ขาย','รับเงิน','รับ','ได้รับ','freelance',
  'ฟรีแลนซ์','รายได้','income','กำไร','profit','ค่าจ้าง',
  'payroll','wage','เงินเข้า','ค่าตอบแทน','ot','โอที',
  'commission','คอมมิชชั่น','allowance','เบี้ยเลี้ยง',
  'interest','yield','capital gain','กำไรหุ้น','ขายหุ้น',
  'คืนเงิน','refund','cashback','เงินคืน','ยืมคืน',
  'ลูกหนี้คืน','ขายมือสอง','ขายของออนไลน์','ค่าคอม','tip','ทิป',
]

const SUMMARY_CMDS = ['สรุป','ดูสรุป','สรุปเดือนนี้','report','summary','ยอด','ยอดเดือนนี้']
const DELETE_CMDS  = ['ลบ','ลบรายการล่าสุด','undo','ยกเลิก','cancel']
const HELP_CMDS    = ['help','ช่วยเหลือ','จด ช่วยเหลือ','วิธีใช้','?']

function getBangkokDateParts(reference: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference)

  return {
    year: Number(parts.find(part => part.type === 'year')?.value),
    month: Number(parts.find(part => part.type === 'month')?.value),
    day: Number(parts.find(part => part.type === 'day')?.value),
  }
}

function formatDateParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildDateString(day: number, reference: Date): string {
  const bangkok = getBangkokDateParts(reference)
  return formatDateParts(bangkok.year, bangkok.month, day)
}

function buildRelativeDateString(daysAgo: number, reference: Date): string {
  const bangkok = getBangkokDateParts(reference)
  const date = new Date(Date.UTC(bangkok.year, bangkok.month - 1, bangkok.day - daysAgo))
  return formatDateParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function extractDateTag(text: string, reference: Date): { date?: string; cleaned: string } {
  const explicitMatch = text.match(/วันที่\s*([๐-๙\d]{1,2})/)
  const relativeMatch = text.match(/เมื่อวานซืน|เมื่อวาน/)
  let date: string | undefined

  if (explicitMatch) {
    const day = parseInt(thaiToArabic(explicitMatch[1]))
    if (!isNaN(day) && day >= 1 && day <= 31) {
      date = buildDateString(day, reference)
    }
  } else if (relativeMatch) {
    date = buildRelativeDateString(relativeMatch[0] === 'เมื่อวานซืน' ? 2 : 1, reference)
  }

  const cleaned = text
    .replace(explicitMatch?.[0] ?? '', '')
    .replace(/เมื่อวานซืน|เมื่อวาน/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return { date, cleaned }
}

export function parseMessage(text: string, reference = new Date()): ParseResult {
  const t = text.trim()
  const lower = t.toLowerCase()

  if (SUMMARY_CMDS.some(c => lower === c || lower.startsWith(c)))
    return { isCommand: true, command: 'summary' }
  if (DELETE_CMDS.some(c => lower === c || lower.startsWith(c)))
    return { isCommand: true, command: 'delete' }
  if (HELP_CMDS.some(c => lower === c || lower.startsWith(c)))
    return { isCommand: true, command: 'help' }

  // Extract explicit or relative date before parsing amount.
  const { date, cleaned } = extractDateTag(t, reference)

  // Extract amount — match number (with optional .,) anywhere in text
  const normalised = thaiToArabic(cleaned)
  const amountMatch = normalised.match(/(?<![.\d])(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?![.\d])/)
  if (!amountMatch) return { isCommand: true, command: 'unknown' }

  const amount = parseFloat(amountMatch[0].replace(/,/g, ''))
  if (isNaN(amount) || amount <= 0) return { isCommand: true, command: 'unknown' }

  // Note = cleaned text without the number and บาท/฿
  const note = cleaned
    .replace(amountMatch[0], '')
    .replace(/บาท|bath|฿/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Determine income or expense
  const searchText = lower + ' ' + note.toLowerCase()
  const type: TransactionType = INCOME_KEYWORDS.some(kw => searchText.includes(kw))
    ? 'income'
    : 'expense'

  return { isCommand: false, amount, note: note || 'ไม่ระบุ', type, date }
}
