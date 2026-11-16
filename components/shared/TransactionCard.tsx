'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '@/types'
import { CategoryIcon } from './CategoryIcon'
import { AmountDisplay } from './AmountDisplay'
import { formatRelativeDate } from '@/lib/utils/date'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

interface TransactionCardProps {
  transaction: Transaction
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
}

export function TransactionCard({ transaction, onDelete, onEdit }: TransactionCardProps) {
  const { t, lang } = usePreferences()
  const category = transaction.category
  const icon = category?.icon ?? (transaction.type === 'income' ? '💰' : '💸')
  const color = category?.color ?? '#84a06e'
  const name = category?.name ?? t.categories.noCategory

  return (
    <div className="flex items-center gap-3 px-3 py-4 hover:bg-[#fff9ed] transition-colors group">
      <CategoryIcon icon={icon} color={color} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#382814] truncate">{name}</p>
        {transaction.note && (
          <p className="text-xs text-[#766b5b] truncate">{transaction.note}</p>
        )}
        <p className="text-xs text-[#766b5b]">{formatRelativeDate(transaction.date)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <AmountDisplay amount={transaction.amount} type={transaction.type} size="sm" />
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-0.5">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="w-9 h-9 flex items-center justify-center text-[#65583f] bg-[#f3ecd8] hover:bg-[#e5edcf] rounded-xl transition-colors"
                aria-label={lang === 'en' ? 'Edit' : 'แก้ไข'}
              >
                <Pencil size={16} strokeWidth={2.2} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="w-9 h-9 flex items-center justify-center text-[#a24839] bg-[#ffebe1] hover:bg-[#ffd5c6] rounded-xl transition-colors"
                aria-label={lang === 'en' ? 'Delete' : 'ลบ'}
              >
                <Trash2 size={16} strokeWidth={2.2} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
