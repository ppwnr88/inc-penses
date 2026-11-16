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
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[#dceabb] border-2 border-[#b6c995] rounded-2xl p-4 text-[#355222]">
        <div className="flex items-center gap-1 mb-1.5 opacity-85">
          <TrendingUp size={12} />
          <span className="text-[11px] font-medium">{t.common.income}</span>
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight break-words">{formatCurrency(totalIncome, true, currencySymbol)}</p>
      </div>

      <div className="bg-[#ffd1bd] border-2 border-[#edb39c] rounded-2xl p-4 text-[#9b3f2f]">
        <div className="flex items-center gap-1 mb-1.5 opacity-85">
          <TrendingDown size={12} />
          <span className="text-[11px] font-medium">{t.common.expense}</span>
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight break-words">{formatCurrency(totalExpense, true, currencySymbol)}</p>
      </div>

      <div className={`col-span-2 rounded-2xl border-2 border-[#d0ad58] bg-[#ffe39a] p-4 text-[#513918]`}>
        <div className="flex items-center gap-1 mb-1.5 opacity-85">
          <Wallet size={12} />
          <span className="text-[11px] font-medium">{t.common.balance}</span>
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight break-words">{formatCurrency(balance, true, currencySymbol)}</p>
      </div>
    </div>
  )
}
