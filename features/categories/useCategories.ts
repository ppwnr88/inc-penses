'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Category, TransactionType } from '@/types'
import { useAuth } from '@/features/auth/useAuth'

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCategory: (data: Omit<Category, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  filterByType: (type: TransactionType) => Category[]
}

export function useCategories(): UseCategoriesReturn {
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!profile) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/categories?profile_id=${profile.id}`)
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = (await res.json()) as { data: Category[] }
      setCategories(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const createCategory = useCallback(async (
    data: Omit<Category, 'id' | 'profile_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!profile) return
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, profile_id: profile.id }),
    })
    if (!res.ok) throw new Error('Failed to create category')
    await fetchCategories()
  }, [profile, fetchCategories])

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update category')
    await fetchCategories()
  }, [fetchCategories])

  const deleteCategory = useCallback(async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete category')
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const filterByType = useCallback((type: TransactionType) => {
    return categories.filter(c => c.type === type).sort((a, b) => a.sort_order - b.sort_order)
  }, [categories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    filterByType,
  }
}
