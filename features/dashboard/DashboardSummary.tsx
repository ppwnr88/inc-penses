'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

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
  const { t, currencySymbol } = usePreferences()

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-3.5 text-white">
        <div className="flex items-center gap-1 mb-1.5 opacity-85">
          <TrendingUp size={12} />
          <span className="text-[11px] font-medium">{t.common.income}</span>
        </div>
        <p className="text-sm font-bold leading-snug tracking-tight">{formatCurrency(totalIncome, true, currencySymbol)}</p>
      </div>

      <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-2xl p-3.5 text-white">
        <div className="flex items-center gap-1 mb-1.5 opacity-85">
          <TrendingDown size={12} />
          <span className="text-[11px] font-medium">{t.common.expense}</span>
        </div>
        <p className="text-sm font-bold leading-snug tracking-tight">{formatCurrency(totalExpense, true, currencySymbol)}</p>
      </div>

      <div className={`bg-gradient-to-br rounded-2xl p-3.5 text-white ${
        balance >= 0 ? 'from-brand-500 to-brand-600' : 'from-orange-400 to-orange-500'
      }`}>
        <div className="flex items-center gap-1 mb-1.5 opacity-85">
          <Wallet size={12} />
          <span className="text-[11px] font-medium">{t.common.balance}</span>
        </div>
        <p className="text-sm font-bold leading-snug tracking-tight">{formatCurrency(balance, true, currencySymbol)}</p>
      </div>
    </div>
  )
}
