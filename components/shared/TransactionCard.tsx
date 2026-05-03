'use client'

import React from 'react'
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
  const { t } = usePreferences()
  const category = transaction.category
  const icon = category?.icon ?? (transaction.type === 'income' ? '💰' : '💸')
  const color = category?.color ?? '#84a06e'
  const name = category?.name ?? t.categories.noCategory

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
      <CategoryIcon icon={icon} color={color} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
        {transaction.note && (
          <p className="text-xs text-gray-400 truncate">{transaction.note}</p>
        )}
        <p className="text-xs text-gray-400">{formatRelativeDate(transaction.date)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <AmountDisplay amount={transaction.amount} type={transaction.type} size="sm" />
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-0.5">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="p-1.5 text-gray-300 active:text-brand-600 rounded-lg transition-colors"
                aria-label="แก้ไข"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1.5 text-gray-300 active:text-red-500 rounded-lg transition-colors"
                aria-label="ลบ"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
