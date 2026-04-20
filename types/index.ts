export type TransactionType = 'income' | 'expense'
export type InputMethod = 'manual' | 'voice' | 'ocr' | 'recurring'
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type FileType = 'image' | 'pdf'

export interface Profile {
  id: string
  line_user_id: string
  display_name: string
  picture_url: string | null
  email: string | null
  budget_cycle_day: number
  timezone: string
  notify_daily: boolean
  notify_time: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  profile_id: string
  name: string
  type: TransactionType
  icon: string
  color: string
  is_default: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  profile_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  note: string | null
  date: string
  receipt_url: string | null
  input_method: InputMethod
  recurring_id: string | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface Budget {
  id: string
  profile_id: string
  category_id: string
  amount: number
  month: number
  year: number
  created_at: string
  updated_at: string
  category?: Category
  spent?: number
}

export interface RecurringTransaction {
  id: string
  profile_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  note: string | null
  frequency: Frequency
  day_of_month: number | null
  day_of_week: number | null
  next_due_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface MonthlyReport {
  id: string
  profile_id: string
  month: number
  year: number
  total_income: number
  total_expense: number
  net: number
  transaction_count: number
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  profile_id: string
  title: string
  message: string | null
  remind_time: string
  is_active: boolean
  days_of_week: number[]
  created_at: string
  updated_at: string
}

export interface Attachment {
  id: string
  profile_id: string
  transaction_id: string | null
  file_url: string
  file_type: FileType
  file_size: number | null
  ocr_text: string | null
  created_at: string
}

export interface UsageLog {
  id: string
  profile_id: string
  action: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  budgetUsedPercent: number
  transactionCount: number
}

export interface TransactionFilters {
  type?: TransactionType | 'all'
  category_id?: string
  date_from?: string
  date_to?: string
  month?: number
  year?: number
  page?: number
  limit?: number
}

export interface ReportSummary {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  net: number
  transactionCount: number
  byCategory: CategorySummary[]
  byWeek: WeeklySummary[]
}

export interface CategorySummary {
  category_id: string | null
  category_name: string
  category_icon: string
  category_color: string
  type: TransactionType
  total: number
  count: number
  percentage: number
}

export interface WeeklySummary {
  week: number
  weekLabel: string
  income: number
  expense: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
