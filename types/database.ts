export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
          id?: string
          line_user_id: string
          display_name: string
          picture_url?: string | null
          email?: string | null
          budget_cycle_day?: number
          timezone?: string
          notify_daily?: boolean
          notify_time?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          line_user_id?: string
          display_name?: string
          picture_url?: string | null
          email?: string | null
          budget_cycle_day?: number
          timezone?: string
          notify_daily?: boolean
          notify_time?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          profile_id: string
          name: string
          type: string
          icon: string
          color: string
          is_default: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          type: string
          icon?: string
          color?: string
          is_default?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          type?: string
          icon?: string
          color?: string
          is_default?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          profile_id: string
          category_id: string | null
          type: string
          amount: number
          note: string | null
          date: string
          receipt_url: string | null
          input_method: string
          recurring_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          category_id?: string | null
          type: string
          amount: number
          note?: string | null
          date?: string
          receipt_url?: string | null
          input_method?: string
          recurring_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          category_id?: string | null
          type?: string
          amount?: number
          note?: string | null
          date?: string
          receipt_url?: string | null
          input_method?: string
          recurring_id?: string | null
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          profile_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          category_id?: string
          amount?: number
          month?: number
          year?: number
          updated_at?: string
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          profile_id: string
          category_id: string | null
          type: string
          amount: number
          note: string | null
          frequency: string
          day_of_month: number | null
          day_of_week: number | null
          next_due_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          category_id?: string | null
          type: string
          amount: number
          note?: string | null
          frequency: string
          day_of_month?: number | null
          day_of_week?: number | null
          next_due_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          category_id?: string | null
          type?: string
          amount?: number
          note?: string | null
          frequency?: string
          day_of_month?: number | null
          day_of_week?: number | null
          next_due_date?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      monthly_reports: {
        Row: {
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
        Insert: {
          id?: string
          profile_id: string
          month: number
          year: number
          total_income?: number
          total_expense?: number
          transaction_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          month?: number
          year?: number
          total_income?: number
          total_expense?: number
          transaction_count?: number
          updated_at?: string
        }
      }
      reminders: {
        Row: {
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
        Insert: {
          id?: string
          profile_id: string
          title: string
          message?: string | null
          remind_time?: string
          is_active?: boolean
          days_of_week?: number[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          message?: string | null
          remind_time?: string
          is_active?: boolean
          days_of_week?: number[]
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          profile_id: string
          transaction_id: string | null
          file_url: string
          file_type: string
          file_size: number | null
          ocr_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          transaction_id?: string | null
          file_url: string
          file_type: string
          file_size?: number | null
          ocr_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          transaction_id?: string | null
          file_url?: string
          file_type?: string
          file_size?: number | null
          ocr_text?: string | null
        }
      }
      usage_logs: {
        Row: {
          id: string
          profile_id: string
          action: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          action: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          action?: string
          metadata?: Json | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
