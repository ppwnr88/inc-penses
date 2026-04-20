'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Transaction, TransactionFilters } from '@/types'
import { useAuth } from '@/features/auth/useAuth'

interface UseTransactionsReturn {
  transactions: Transaction[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTransaction: (data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>) => Promise<Transaction>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  setFilters: (filters: TransactionFilters) => void
  filters: TransactionFilters
}

export function useTransactions(initialFilters: TransactionFilters = {}): UseTransactionsReturn {
  const { profile } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters)

  const fetchTransactions = useCallback(async () => {
    if (!profile) return
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ profile_id: profile.id })
      if (filters.type && filters.type !== 'all') params.set('type', filters.type)
      if (filters.category_id) params.set('category_id', filters.category_id)
      if (filters.date_from) params.set('date_from', filters.date_from)
      if (filters.date_to) params.set('date_to', filters.date_to)
      if (filters.month) params.set('month', String(filters.month))
      if (filters.year) params.set('year', String(filters.year))
      if (filters.page) params.set('page', String(filters.page))
      if (filters.limit) params.set('limit', String(filters.limit))

      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch transactions')
      const data = (await res.json()) as { data: Transaction[]; total: number }
      setTransactions(data.data)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [profile, filters])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const createTransaction = useCallback(async (
    data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>
  ): Promise<Transaction> => {
    if (!profile) throw new Error('Not authenticated')
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, profile_id: profile.id }),
    })
    if (!res.ok) throw new Error('Failed to create transaction')
    const body = (await res.json()) as { data: Transaction }
    await fetchTransactions()
    return body.data
  }, [profile, fetchTransactions])

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update transaction')
    await fetchTransactions()
  }, [fetchTransactions])

  const deleteTransaction = useCallback(async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete transaction')
    setTransactions(prev => prev.filter(t => t.id !== id))
    setTotal(prev => prev - 1)
  }, [])

  return {
    transactions,
    total,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    filters,
  }
}
