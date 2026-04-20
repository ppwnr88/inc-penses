'use client'

import React, { useState } from 'react'
import { Plus, Bell } from 'lucide-react'
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
import { getThaiMonthName, getCurrentMonthYear } from '@/lib/utils/date'
import type { Transaction } from '@/types'
import Link from 'next/link'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { month, year } = getCurrentMonthYear()
  const [showForm, setShowForm] = useState(false)

  const { transactions, loading: txLoading, createTransaction, refetch } = useTransactions({
    month,
    year,
    limit: 20,
  })
  const { categories } = useCategories()
  const { budgets, loading: budgetLoading } = useBudgets()

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = totalIncome - totalExpense

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgets.reduce((s, b) => s + (b.spent ?? 0), 0)
  const budgetPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  async function handleCreateTransaction(
    data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>
  ) {
    await createTransaction(data)
    setShowForm(false)
    refetch()
  }

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'อรุณสวัสดิ์'
    if (hour < 18) return 'สวัสดีตอนบ่าย'
    return 'สวัสดีตอนเย็น'
  })()

  return (
    <div className="page-container pt-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-xs text-gray-400">{greeting}</p>
          <h1 className="text-lg font-bold text-gray-900">
            {profile?.display_name ?? 'คุณผู้ใช้'} 👋
          </h1>
          <p className="text-xs text-gray-400">
            {getThaiMonthName(month)} {year + 543}
          </p>
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
        loading={txLoading}
      />

      {/* Budget Overview */}
      {!budgetLoading && budgets.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">งบประมาณเดือนนี้</h3>
            <Link href="/liff/budgets" className="text-xs text-brand-600">
              ดูรายละเอียด →
            </Link>
          </div>
          <ProgressBar value={totalSpent} max={totalBudget} showLabel size="lg" />
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            ใช้ไป {budgetPercent}% จากงบทั้งหมด
          </p>
        </Card>
      )}

      {budgets.length === 0 && !budgetLoading && (
        <Link href="/liff/budgets">
          <Card padding="md" hover className="border-2 border-dashed border-brand-200 bg-brand-50/50 text-center">
            <p className="text-sm text-brand-600 font-medium">🎯 ตั้งงบประมาณเดือนนี้</p>
            <p className="text-xs text-brand-400 mt-1">ควบคุมการใช้จ่ายได้ง่ายขึ้น</p>
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
            <p className="text-xs font-medium text-gray-700">ดูรายงาน</p>
          </Card>
        </Link>
        <Link href="/liff/recurring">
          <Card padding="md" hover className="text-center">
            <div className="text-2xl mb-1">🔄</div>
            <p className="text-xs font-medium text-gray-700">รายการประจำ</p>
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="บันทึกรายการ">
        <TransactionForm
          categories={categories}
          onSubmit={handleCreateTransaction}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}
