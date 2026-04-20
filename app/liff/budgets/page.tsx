'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BudgetCard } from '@/features/budgets/BudgetCard'
import { BudgetForm } from '@/features/budgets/BudgetForm'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useBudgets } from '@/features/budgets/useBudgets'
import { useCategories } from '@/features/categories/useCategories'
import { getThaiMonthName } from '@/lib/utils/date'
import type { Budget } from '@/types'

export default function BudgetsPage() {
  const { budgets, loading, error, refetch, createBudget, updateBudget, deleteBudget, month, year } = useBudgets()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  async function handleCreate(data: Omit<Budget, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category' | 'spent'>) {
    await createBudget(data)
    setShowForm(false)
  }

  async function handleUpdate(data: Omit<Budget, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category' | 'spent'>) {
    if (!editingBudget) return
    await updateBudget(editingBudget.id, data)
    setEditingBudget(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบงบประมาณนี้?')) return
    await deleteBudget(id)
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div className="page-container pt-0 space-y-3">
      <Header
        title="งบประมาณ"
        rightAction={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl"
          >
            <Plus size={14} />
            เพิ่ม
          </button>
        }
      />

      <div className="pt-3 space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-gray-700">
            {getThaiMonthName(month)} {year + 543}
          </p>
          <span className="text-xs text-gray-400">{budgets.length} รายการ</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-4 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="ยังไม่มีงบประมาณ"
            description="ตั้งงบประมาณต่อหมวดหมู่เพื่อควบคุมการใช้จ่าย"
            action={{ label: '+ ตั้งงบประมาณ', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="space-y-3">
            {budgets.map(budget => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={setEditingBudget}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="ตั้งงบประมาณ">
        <BudgetForm
          categories={categories}
          month={month}
          year={year}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="แก้ไขงบประมาณ"
      >
        {editingBudget && (
          <BudgetForm
            categories={categories}
            month={month}
            year={year}
            onSubmit={handleUpdate}
            onCancel={() => setEditingBudget(null)}
            defaultValues={{
              category_id: editingBudget.category_id,
              amount: String(editingBudget.amount),
            }}
            isEditing
          />
        )}
      </Modal>
    </div>
  )
}
