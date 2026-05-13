'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { DashboardSummary } from '@/features/dashboard/DashboardSummary'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Card } from '@/components/ui/Card'
import { useTransactions } from '@/features/transactions/useTransactions'
import { useCategories } from '@/features/categories/useCategories'
import { useBudgets } from '@/features/budgets/useBudgets'
import { useReports } from '@/features/reports/useReports'
import { getThaiMonthName, getCurrentMonthYear } from '@/lib/utils/date'
import type { Transaction } from '@/types'
import Link from 'next/link'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { t, lang } = usePreferences()
  const { month, year } = getCurrentMonthYear()
  const [showForm, setShowForm] = useState(false)

  const { transactions, loading: txLoading, createTransaction, refetch } = useTransactions({
    month,
    year,
    limit: 20,
  })
  const { report, loading: reportLoading, refetch: refetchReport } = useReports()
  const { categories } = useCategories()
  const { budgets, loading: budgetLoading } = useBudgets()

  const totalIncome = report?.totalIncome ?? 0
  const totalExpense = report?.totalExpense ?? 0
  const balance = report?.net ?? 0

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + (b.spent ?? 0), 0)
  const budgetPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  async function handleCreateTransaction(
    data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>
  ) {
    await createTransaction(data)
    setShowForm(false)
    refetch()
    refetchReport()
  }

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return t.dashboard.greeting_morning
    if (hour < 18) return t.dashboard.greeting_afternoon
    return t.dashboard.greeting_evening
  })()

  const monthDisplay = lang === 'th'
    ? `${getThaiMonthName(month)} ${year + 543}`
    : `${new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })} ${year}`

  return (
    <div className="page-container pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs text-gray-400">{greeting}</p>
          <h1 className="text-lg font-bold text-gray-900">
            {profile?.display_name ?? t.dashboard.defaultUser} 👋
          </h1>
          <p className="text-xs text-gray-400">{monthDisplay}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/liff/settings"
            className="w-9 h-9 rounded-full overflow-hidden bg-brand-100 flex items-center justify-center"
          >
            {profile?.picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.picture_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-brand-600 font-bold text-sm">
                {(profile?.display_name ?? 'U')[0]}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <DashboardSummary
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        loading={reportLoading}
      />

      {/* Budget Overview */}
      {!budgetLoading && budgets.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">{t.dashboard.budget}</h3>
            <Link href="/liff/budgets" className="text-xs text-brand-600">
              {t.dashboard.budgetDetail}
            </Link>
          </div>
          <ProgressBar value={totalSpent} max={totalBudget} showLabel size="lg" label={t.dashboard.budgetUsed} />
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            {t.dashboard.budgetUsed} {budgetPercent}% {t.dashboard.budgetOf}
          </p>
        </Card>
      )}

      {budgets.length === 0 && !budgetLoading && (
        <Link href="/liff/budgets">
          <Card padding="md" hover className="border-2 border-dashed border-brand-200 bg-brand-50/50 text-center">
            <p className="text-sm text-brand-600 font-medium">{t.dashboard.setBudget}</p>
            <p className="text-xs text-brand-400 mt-1">{t.dashboard.setBudgetDesc}</p>
          </Card>
        </Link>
      )}

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={transactions}
        loading={txLoading}
        onAddFirst={() => setShowForm(true)}
      />

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Link href="/liff/reports">
          <Card padding="md" hover className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-xs font-medium text-gray-700">{t.dashboard.viewReports}</p>
          </Card>
        </Link>
        <Link href="/liff/recurring">
          <Card padding="md" hover className="text-center">
            <div className="text-2xl mb-1">🔄</div>
            <p className="text-xs font-medium text-gray-700">{t.dashboard.recurring}</p>
          </Card>
        </Link>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-30"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Transaction Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t.transactions.addTitle}>
        <TransactionForm
          categories={categories}
          onSubmit={handleCreateTransaction}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
