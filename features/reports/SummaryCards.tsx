'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils/currency'
import { Skeleton } from '@/components/ui/Skeleton'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
  net: number
  loading?: boolean
}

export function SummaryCards({ totalIncome, totalExpense, net, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card padding="sm" className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp size={12} />
          <span className="text-xs font-medium">รายรับ</span>
        </div>
        <p className="text-sm font-bold text-green-600 leading-tight">
          {formatCurrency(totalIncome, true)}
        </p>
      </Card>

      <Card padding="sm" className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-red-500">
          <TrendingDown size={12} />
          <span className="text-xs font-medium">รายจ่าย</span>
        </div>
        <p className="text-sm font-bold text-red-500 leading-tight">
          {formatCurrency(totalExpense, true)}
        </p>
      </Card>

      <Card padding="sm" className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-brand-600">
          <Wallet size={12} />
          <span className="text-xs font-medium">คงเหลือ</span>
        </div>
        <p className={`text-sm font-bold leading-tight ${net >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
          {formatCurrency(net, true)}
        </p>
      </Card>
    </div>
  )
}
