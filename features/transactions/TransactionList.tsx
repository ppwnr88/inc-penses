'use client'

import React from 'react'
import type { Transaction } from '@/types'
import { TransactionCard } from '@/components/shared/TransactionCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionSkeleton } from '@/components/ui/Skeleton'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
  emptyMessage?: string
}

export function TransactionList({
  transactions,
  loading,
  onDelete,
  onEdit,
  emptyMessage = 'ยังไม่มีรายการ',
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title={emptyMessage}
        description="กดปุ่ม + เพื่อเพิ่มรายการแรก"
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
      {transactions.map(transaction => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
