'use client'

import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { TransactionList } from '@/features/transactions/TransactionList'
import { TransactionFilters } from '@/features/transactions/TransactionFilters'
import { TransactionForm } from '@/features/transactions/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { useTransactions } from '@/features/transactions/useTransactions'
import { useCategories } from '@/features/categories/useCategories'
import { getCurrentMonthYear } from '@/lib/utils/date'
import type { Transaction } from '@/types'
import { usePreferences } from '@/lib/i18n/PreferencesContext'
import { useAuth } from '@/features/auth/useAuth'

export default function TransactionsPage() {
  const { t } = usePreferences()
  const { profile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { month, year } = getCurrentMonthYear()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const editTransactionId = searchParams.get('edit_tx')
  const shouldReturnToChat = searchParams.get('return') === 'chat'

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

  useEffect(() => {
    if (!editTransactionId) return

    let cancelled = false

    async function openTransactionEditor() {
      const res = await fetch(`/api/transactions/${editTransactionId}`)
      if (!res.ok) return
      const body = (await res.json()) as { data: Transaction }
      if (!cancelled) setEditingTransaction(body.data)
    }

    openTransactionEditor()

    return () => {
      cancelled = true
    }
  }, [editTransactionId])

  async function closeToChatOrList() {
    if (!shouldReturnToChat) {
      router.replace('/liff/transactions')
      return
    }

    try {
      const { getLiffModule } = await import('@/lib/liff/init')
      const liff = await getLiffModule()
      if (liff?.isInClient()) {
        liff.closeWindow()
        return
      }
    } catch {
      // Fall through to the in-app list when LIFF is unavailable locally.
    }

    router.replace('/liff/transactions')
  }

  async function notifyTransactionUpdated(transactionId: string) {
    if (!profile || !shouldReturnToChat) return

    const res = await fetch('/api/line/transaction-updated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: profile.id,
        transaction_id: transactionId,
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? 'Failed to send update confirmation')
    }
  }

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
    await notifyTransactionUpdated(editingTransaction.id).catch(err => {
      console.warn('[transactions] update confirmation failed', err)
    })
    setEditingTransaction(null)
    await closeToChatOrList()
  }

  async function handleDelete(id: string) {
    if (!confirm(t.transactions.deleteConfirm)) return
    await deleteTransaction(id)
  }

  return (
    <div className="page-container pt-0 space-y-3">
      <Header title={t.transactions.title} />

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
          emptyMessage={t.transactions.empty}
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={t.transactions.addTitle}>
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
        title={t.transactions.editTitle}
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
