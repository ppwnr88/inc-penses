'use client'

import React from 'react'
import type { Category, TransactionFilters } from '@/types'
import { twMerge } from 'tailwind-merge'

interface TransactionFiltersProps {
  filters: TransactionFilters
  categories: Category[]
  onFilterChange: (filters: TransactionFilters) => void
}

const typeOptions = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'income', label: 'รายรับ' },
  { value: 'expense', label: 'รายจ่าย' },
]

export function TransactionFilters({
  filters,
  categories,
  onFilterChange,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {typeOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() =>
              onFilterChange({ ...filters, type: opt.value as TransactionFilters['type'] })
            }
            className={twMerge(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              filters.type === opt.value || (!filters.type && opt.value === 'all')
                ? 'bg-brand-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => onFilterChange({ ...filters, category_id: undefined })}
          className={twMerge(
            'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all',
            !filters.category_id
              ? 'bg-brand-100 text-brand-700'
              : 'bg-white text-gray-500 border border-gray-200'
          )}
        >
          ทุกหมวด
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ ...filters, category_id: cat.id })}
            className={twMerge(
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              filters.category_id === cat.id
                ? 'bg-brand-100 text-brand-700'
                : 'bg-white text-gray-500 border border-gray-200'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
