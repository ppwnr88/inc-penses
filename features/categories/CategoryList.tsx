'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Category } from '@/types'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface CategoryListProps {
  categories: Category[]
  loading: boolean
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function CategoryList({ categories, loading, onEdit, onDelete }: CategoryListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-4 w-32" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon="🏷️"
        title="ยังไม่มีหมวดหมู่"
        description="เพิ่มหมวดหมู่เพื่อจัดระเบียบรายการ"
      />
    )
  }

  return (
    <div className="space-y-2">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-card"
        >
          <CategoryIcon icon={cat.icon} color={cat.color} size="md" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{cat.name}</p>
            {cat.is_default && (
              <p className="text-xs text-gray-400">หมวดหมู่เริ่มต้น</p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(cat)}
              className="p-2 rounded-xl hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
            >
              <Pencil size={15} />
            </button>
            {!cat.is_default && (
              <button
                onClick={() => onDelete(cat.id)}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
