'use client'

import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { SummaryCards } from '@/features/reports/SummaryCards'
import { ExpensePieChart } from '@/features/reports/PieChart'
import { WeeklyBarChart } from '@/features/reports/BarChart'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useReports } from '@/features/reports/useReports'
import { useAuth } from '@/features/auth/useAuth'
import { getThaiMonthName } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePreferences } from '@/lib/i18n/PreferencesContext'

export default function ReportsPage() {
  const { t, lang, currencySymbol } = usePreferences()
  const { profile } = useAuth()
  const { report, loading, error, month, year, setMonth, setYear, refetch } = useReports()

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(year - 1) }
    else setMonth(month - 1)
  }

  function nextMonth() {
    const { month: curM, year: curY } = { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
    if (year > curY || (year === curY && month >= curM)) return
    if (month === 12) { setMonth(1); setYear(year + 1) }
    else setMonth(month + 1)
  }

  function handleExport(type: 'csv' | 'excel') {
    if (!profile) return
    const url = `/api/export?profile_id=${profile.id}&month=${month}&year=${year}&type=${type}`
    window.open(url, '_blank')
  }

  const monthDisplay = lang === 'th'
    ? `${getThaiMonthName(month)} ${year + 543}`
    : `${new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })} ${year}`

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div className="page-container pt-0 space-y-4">
      <Header title={t.reports.title} />

      <div className="pt-3 space-y-4">
        {/* Month Selector */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-card px-4 py-3">
          <button onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-semibold text-gray-800">{monthDisplay}</p>
          <button onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Summary */}
        <SummaryCards
          totalIncome={report?.totalIncome ?? 0}
          totalExpense={report?.totalExpense ?? 0}
          net={report?.net ?? 0}
          loading={loading}
        />

        {/* Transaction count */}
        {!loading && report && (
          <div className="text-center text-xs text-gray-400">
            {t.reports.totalItems} {report.transactionCount} {t.reports.items}
          </div>
        )}

        {/* Expense Pie Chart */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.reports.expenseByCategory}</h3>
          {loading ? (
            <Skeleton className="h-60 w-full rounded-2xl" />
          ) : (
            <ExpensePieChart data={report?.byCategory.filter(c => c.type === 'expense') ?? []} />
          )}
        </Card>

        {/* Weekly Bar Chart */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.reports.weeklyChart}</h3>
          {loading ? (
            <Skeleton className="h-52 w-full rounded-2xl" />
          ) : (
            <WeeklyBarChart data={report?.byWeek ?? []} />
          )}
        </Card>

        {/* Category Breakdown Table */}
        {!loading && report && report.byCategory.length > 0 && (
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.reports.categoryBreakdown}</h3>
            <div className="space-y-2">
              {report.byCategory.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.category_icon}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-800">{item.category_name}</p>
                      <p className="text-xs text-gray-400">{item.count} {t.reports.items}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrency(item.total, false, currencySymbol)}
                    </p>
                    <p className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Export */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.reports.exportTitle}</h3>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leftIcon={<Download size={14} />}
              onClick={() => handleExport('csv')}
            >
              CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leftIcon={<Download size={14} />}
              onClick={() => handleExport('excel')}
            >
              Excel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
