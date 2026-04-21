import type { TransactionType } from '@/types'

export interface ParsedTransaction {
  amount: number
  note: string
  type: TransactionType
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
]

const SUMMARY_CMDS = ['สรุป','ดูสรุป','สรุปเดือนนี้','report','summary','ยอด','ยอดเดือนนี้']
const DELETE_CMDS  = ['ลบ','ลบรายการล่าสุด','undo','ยกเลิก','cancel']
const HELP_CMDS    = ['help','ช่วยเหลือ','เงินจด ช่วยเหลือ','วิธีใช้','?']

export function parseMessage(text: string): ParseResult {
  const t = text.trim()
  const lower = t.toLowerCase()

  if (SUMMARY_CMDS.some(c => lower === c || lower.startsWith(c)))
    return { isCommand: true, command: 'summary' }
  if (DELETE_CMDS.some(c => lower === c || lower.startsWith(c)))
    return { isCommand: true, command: 'delete' }
  if (HELP_CMDS.some(c => lower === c || lower.startsWith(c)))
    return { isCommand: true, command: 'help' }

  // Extract amount — match number (with optional .,) anywhere in text
  const normalised = thaiToArabic(t)
  const amountMatch = normalised.match(/(?<![.\d])(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?![.\d])/)
  if (!amountMatch) return { isCommand: true, command: 'unknown' }

  const amount = parseFloat(amountMatch[0].replace(/,/g, ''))
  if (isNaN(amount) || amount <= 0) return { isCommand: true, command: 'unknown' }

  // Note = original text without the number and บาท/฿
  const note = t
    .replace(amountMatch[0], '')
    .replace(/บาท|bath|฿/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Determine income or expense
  const searchText = lower + ' ' + note.toLowerCase()
  const type: TransactionType = INCOME_KEYWORDS.some(kw => searchText.includes(kw))
    ? 'income'
    : 'expense'

  return { isCommand: false, amount, note: note || 'ไม่ระบุ', type }
}
