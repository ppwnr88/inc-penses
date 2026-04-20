'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { TransactionList } from '@/features/transactions/TransactionList'
import { TransactionFilters } from '@/features/transactions/TransactionFilters'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { useTransactions } from '@/features/transactions/useTransactions'
import { useCategories } from '@/features/categories/useCategories'
import { getCurrentMonthYear } from '@/lib/utils/date'
import type { Transaction } from '@/types'

export default function TransactionsPage() {
  const { month, year } = getCurrentMonthYear()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    filters,
    refetch,
  } = useTransactions({ month, year, limit: 50 })

  const { categories } = useCategories()

  async function handleCreate(
    data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>
  ) {
    await createTransaction(data)
    setShowForm(false)
    refetch()
  }

  async function handleUpdate(
    data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>
  ) {
    if (!editingTransaction) return
    await updateTransaction(editingTransaction.id, data)
    setEditingTransaction(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบรายการนี้?')) return
    await deleteTransaction(id)
  }

  return (
    <div className="page-container pt-0 space-y-3">
      <Header title="รายการทั้งหมด" />

      <div className="pt-3 space-y-3">
        <TransactionFilters
          filters={filters}
          categories={categories}
          onFilterChange={setFilters}
        />

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <TransactionList
          transactions={transactions}
          loading={loading}
          onDelete={handleDelete}
          onEdit={setEditingTransaction}
          emptyMessage="ไม่พบรายการ"
        />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-30"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Create Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="บันทึกรายการ">
        <TransactionForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="แก้ไขรายการ"
      >
        {editingTransaction && (
          <TransactionForm
            categories={categories}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
            defaultValues={{
              type: editingTransaction.type,
              amount: String(editingTransaction.amount),
              category_id: editingTransaction.category_id ?? '',
              date: editingTransaction.date,
              note: editingTransaction.note ?? '',
            }}
            isEditing
          />
        )}
      </Modal>
    </div>
  )
}
