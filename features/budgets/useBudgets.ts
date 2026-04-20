'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Budget } from '@/types'
import { useAuth } from '@/features/auth/useAuth'
import { getCurrentMonthYear } from '@/lib/utils/date'

interface UseBudgetsReturn {
  budgets: Budget[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createBudget: (data: Omit<Budget, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category' | 'spent'>) => Promise<void>
  updateBudget: (id: string, data: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  month: number
  year: number
  setMonth: (month: number) => void
  setYear: (year: number) => void
}

export function useBudgets(): UseBudgetsReturn {
  const { profile } = useAuth()
  const { month: curMonth, year: curYear } = getCurrentMonthYear()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(curMonth)
  const [year, setYear] = useState(curYear)

  const fetchBudgets = useCallback(async () => {
    if (!profile) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `/api/budgets?profile_id=${profile.id}&month=${month}&year=${year}`
      )
      if (!res.ok) throw new Error('Failed to fetch budgets')
      const data = (await res.json()) as { data: Budget[] }
      setBudgets(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [profile, month, year])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const createBudget = useCallback(async (
    data: Omit<Budget, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category' | 'spent'>
  ) => {
    if (!profile) return
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, profile_id: profile.id }),
    })
    if (!res.ok) throw new Error('Failed to create budget')
    await fetchBudgets()
  }, [profile, fetchBudgets])

  const updateBudget = useCallback(async (id: string, data: Partial<Budget>) => {
    const res = await fetch(`/api/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update budget')
    await fetchBudgets()
  }, [fetchBudgets])

  const deleteBudget = useCallback(async (id: string) => {
    const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete budget')
    setBudgets(prev => prev.filter(b => b.id !== id))
  }, [])

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    month,
    year,
    setMonth,
    setYear,
  }
}
