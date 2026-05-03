'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { Budget } from '@/types'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/lib/utils/currency'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

interface BudgetCardProps {
  budget: Budget
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { t, currencySymbol } = usePreferences()
  const spent = budget.spent ?? 0
  const remaining = budget.amount - spent
  const isOver = spent > budget.amount

  return (
    <div className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <CategoryIcon
            icon={budget.category?.icon ?? '💰'}
            color={budget.category?.color ?? '#84a06e'}
            size="md"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {budget.category?.name ?? t.budgets.noCategory}
            </p>
            <p className="text-xs text-gray-400">
              {t.budgets.budgetLabel} {formatCurrency(budget.amount, false, currencySymbol)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-xl hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <ProgressBar value={spent} max={budget.amount} showLabel size="md" label={t.budgets.spent} />

      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">
          {t.budgets.spent} {formatCurrency(spent, false, currencySymbol)}
        </span>
        <span className={`text-xs font-medium ${isOver ? 'text-red-500' : 'text-brand-600'}`}>
          {isOver
            ? `${t.budgets.over} ${formatCurrency(Math.abs(remaining), false, currencySymbol)}`
            : `${t.budgets.remaining} ${formatCurrency(remaining, false, currencySymbol)}`}
        </span>
      </div>
    </div>
  )
}
