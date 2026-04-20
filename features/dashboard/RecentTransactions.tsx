'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Transaction } from '@/types'
import { TransactionCard } from '@/components/shared/TransactionCard'
import { TransactionSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface RecentTransactionsProps {
  transactions: Transaction[]
  loading: boolean
  onAddFirst?: () => void
}

export function RecentTransactions({ transactions, loading, onAddFirst }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">รายการล่าสุด</h3>
        <Link
          href="/liff/transactions"
          className="flex items-center gap-0.5 text-xs text-brand-600 hover:text-brand-700"
        >
          ดูทั้งหมด
          <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => <TransactionSkeleton key={i} />)}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="📝"
          title="ยังไม่มีรายการ"
          description="เริ่มจดรายรับรายจ่ายรายการแรก"
          action={onAddFirst ? { label: '+ เพิ่มรายการ', onClick: onAddFirst } : undefined}
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {transactions.slice(0, 5).map(t => (
            <TransactionCard key={t.id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}
