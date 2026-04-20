import React from 'react'
import type { Transaction } from '@/types'
import { CategoryIcon } from './CategoryIcon'
import { AmountDisplay } from './AmountDisplay'
import { formatRelativeDate } from '@/lib/utils/date'

interface TransactionCardProps {
  transaction: Transaction
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
}

export function TransactionCard({ transaction, onDelete, onEdit }: TransactionCardProps) {
  const category = transaction.category
  const icon = category?.icon ?? (transaction.type === 'income' ? '💰' : '💸')
  const color = category?.color ?? '#84a06e'
  const name = category?.name ?? 'ไม่ระบุหมวดหมู่'

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
      <div className="flex items-center gap-2">
        <AmountDisplay amount={transaction.amount} type={transaction.type} size="sm" />
        {(onEdit || onDelete) && (
          <div className="hidden group-hover:flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                className="p-1 text-gray-400 hover:text-brand-600 rounded-lg transition-colors text-xs"
              >
                แก้ไข
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition-colors text-xs"
              >
                ลบ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
