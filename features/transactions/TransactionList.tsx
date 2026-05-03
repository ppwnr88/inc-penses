'use client'

import React from 'react'
import type { Transaction } from '@/types'
import { TransactionCard } from '@/components/shared/TransactionCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionSkeleton } from '@/components/ui/Skeleton'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
  emptyMessage?: string
}

function getDateLabel(
  date: string,
  today: string,
  yesterday: string,
  lang: string,
  todayStr: string,
  yesterdayStr: string,
): string {
  if (date === todayStr) return today
  if (date === yesterdayStr) return yesterday
  return new Date(date + 'T12:00:00').toLocaleDateString(
    lang === 'th' ? 'th-TH' : 'en-US',
    { weekday: 'short', day: 'numeric', month: 'short' },
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-medium text-gray-500 shrink-0">{label}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  )
}

export function TransactionList({
  transactions,
  loading,
  onDelete,
  onEdit,
  emptyMessage = 'ยังไม่มีรายการ',
}: TransactionListProps) {
  const { t, lang } = usePreferences()

  const todayDate = new Date()
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`
  const yesterdayDate = new Date(todayDate)
  yesterdayDate.setDate(todayDate.getDate() - 1)
  const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`

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

  const groups: { date: string; items: Transaction[] }[] = []
  for (const tx of transactions) {
    const last = groups[groups.length - 1]
    if (last && last.date === tx.date) {
      last.items.push(tx)
    } else {
      groups.push({ date: tx.date, items: [tx] })
    }
  }

  return (
    <div className="space-y-1">
      {groups.map(group => (
        <React.Fragment key={group.date}>
          <DateSeparator
            label={getDateLabel(
              group.date,
              t.common.today,
              t.common.yesterday,
              lang,
              todayStr,
              yesterdayStr,
            )}
          />
          <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
            {group.items.map(transaction => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
