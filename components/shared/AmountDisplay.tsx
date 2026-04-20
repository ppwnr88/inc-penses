import React from 'react'
import { twMerge } from 'tailwind-merge'
import { formatCurrency } from '@/lib/utils/currency'
import type { TransactionType } from '@/types'

interface AmountDisplayProps {
  amount: number
  type?: TransactionType
  compact?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
}

export function AmountDisplay({
  amount,
  type,
  compact = false,
  size = 'md',
  className,
}: AmountDisplayProps) {
  const isIncome = type === 'income'
  const isExpense = type === 'expense'

  return (
    <span
      className={twMerge(
        'font-medium tabular-nums',
        sizeMap[size],
        isIncome && 'text-green-600',
        isExpense && 'text-red-500',
        !type && 'text-gray-800',
        className
      )}
    >
      {isIncome ? '+' : isExpense ? '-' : ''}
      {formatCurrency(amount, compact)}
    </span>
  )
}
