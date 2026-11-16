'use client'

import React from 'react'
import type { Category, TransactionFilters } from '@/types'
import { twMerge } from 'tailwind-merge'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

interface TransactionFiltersProps {
  filters: TransactionFilters
  categories: Category[]
  onFilterChange: (filters: TransactionFilters) => void
}

export function TransactionFilters({
  filters,
  categories,
  onFilterChange,
}: TransactionFiltersProps) {
  const { t } = usePreferences()

  const typeOptions = [
    { value: 'all', label: t.common.all },
    { value: 'income', label: t.common.income },
    { value: 'expense', label: t.common.expense },
  ]

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
              'flex-shrink-0 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all',
              filters.type === opt.value || (!filters.type && opt.value === 'all')
                ? 'bg-[#dceabb] text-[#314925] border-[#829d63] shadow-[0_3px_0_#b4c797]'
                : 'bg-[#fffdf7] text-[#685a43] border-[#e3d8bf]'
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
            'flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all',
            !filters.category_id
              ? 'bg-[#ffe49b] text-[#60430f] border-[#d9b65b]'
              : 'bg-[#fffdf7] text-[#685a43] border-[#e3d8bf]'
          )}
        >
          {t.common.allCategories}
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ ...filters, category_id: cat.id })}
            className={twMerge(
              'flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap',
              filters.category_id === cat.id
                ? 'bg-[#ffe49b] text-[#60430f] border-[#d9b65b]'
                : 'bg-[#fffdf7] text-[#685a43] border-[#e3d8bf]'
            )}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
