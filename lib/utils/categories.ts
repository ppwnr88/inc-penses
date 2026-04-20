import type { Category, TransactionType } from '@/types'

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'profile_id' | 'created_at' | 'updated_at'>[] = [
  { name: 'อาหาร', type: 'expense', icon: '🍜', color: '#e07b54', is_default: true, sort_order: 1 },
  { name: 'เดินทาง', type: 'expense', icon: '🚗', color: '#5b8dd9', is_default: true, sort_order: 2 },
  { name: 'ค่าเช่า', type: 'expense', icon: '🏠', color: '#9b59b6', is_default: true, sort_order: 3 },
  { name: 'ชอปปิง', type: 'expense', icon: '🛍️', color: '#e91e8c', is_default: true, sort_order: 4 },
  { name: 'สุขภาพ', type: 'expense', icon: '💊', color: '#2ecc71', is_default: true, sort_order: 5 },
  { name: 'บันเทิง', type: 'expense', icon: '🎬', color: '#f39c12', is_default: true, sort_order: 6 },
  { name: 'การศึกษา', type: 'expense', icon: '📚', color: '#3498db', is_default: true, sort_order: 7 },
  { name: 'อื่นๆ (จ่าย)', type: 'expense', icon: '💸', color: '#95a5a6', is_default: true, sort_order: 8 },
  { name: 'เงินเดือน', type: 'income', icon: '💼', color: '#27ae60', is_default: true, sort_order: 9 },
  { name: 'ลงทุน', type: 'income', icon: '📈', color: '#16a085', is_default: true, sort_order: 10 },
  { name: 'อื่นๆ (รับ)', type: 'income', icon: '💰', color: '#84a06e', is_default: true, sort_order: 11 },
]

export function filterCategoriesByType(
  categories: Category[],
  type: TransactionType
): Category[] {
  return categories
    .filter(c => c.type === type)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function getCategoryById(
  categories: Category[],
  id: string | null
): Category | undefined {
  if (!id) return undefined
  return categories.find(c => c.id === id)
}

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
