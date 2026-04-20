'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { CardSkeleton } from '@/components/ui/Skeleton'

interface DashboardSummaryProps {
  totalIncome: number
  totalExpense: number
  balance: number
  loading: boolean
}

export function DashboardSummary({
  totalIncome,
  totalExpense,
  balance,
  loading,
}: DashboardSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-3 text-white">
        <div className="flex items-center gap-1 mb-2 opacity-90">
          <TrendingUp size={13} />
          <span className="text-xs font-medium">รายรับ</span>
        </div>
        <p className="text-sm font-bold leading-tight">{formatCurrency(totalIncome, true)}</p>
      </div>

      <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-3 text-white">
        <div className="flex items-center gap-1 mb-2 opacity-90">
          <TrendingDown size={13} />
          <span className="text-xs font-medium">รายจ่าย</span>
        </div>
        <p className="text-sm font-bold leading-tight">{formatCurrency(totalExpense, true)}</p>
      </div>

      <div className={`bg-gradient-to-br rounded-2xl p-3 text-white ${
        balance >= 0 ? 'from-brand-500 to-brand-600' : 'from-orange-400 to-orange-500'
      }`}>
        <div className="flex items-center gap-1 mb-2 opacity-90">
          <Wallet size={13} />
          <span className="text-xs font-medium">คงเหลือ</span>
        </div>
        <p className="text-sm font-bold leading-tight">{formatCurrency(balance, true)}</p>
      </div>
    </div>
  )
}
