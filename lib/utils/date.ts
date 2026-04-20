import {
  format,
  formatDistance,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  parseISO,
  isToday,
  isYesterday,
  getWeek,
} from 'date-fns'

export function formatDate(date: string | Date, pattern = 'd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern)
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'วันนี้'
  if (isYesterday(d)) return 'เมื่อวาน'
  return formatDate(d, 'd MMM')
}

export function formatDateFull(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'd MMMM yyyy')
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(d, new Date(), { addSuffix: true })
}

export function getMonthDateRange(year: number, month: number): { from: string; to: string } {
  const date = new Date(year, month - 1, 1)
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function getWeeksInMonth(year: number, month: number): Array<{ week: number; start: string; end: string; label: string }> {
  const start = startOfMonth(new Date(year, month - 1, 1))
  const end = endOfMonth(new Date(year, month - 1, 1))

  const weeks = eachWeekOfInterval({ start, end })
  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart)
    return {
      week: getWeek(weekStart),
      start: format(weekStart < start ? start : weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd > end ? end : weekEnd, 'yyyy-MM-dd'),
      label: `สัปดาห์ที่ ${index + 1}`,
    }
  })
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export function getThaiMonthName(month: number): string {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ]
  return months[month - 1] || ''
}

export function getThaiMonthShort(month: number): string {
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  return months[month - 1] || ''
}

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
