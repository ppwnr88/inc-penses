'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { WeeklySummary } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { EmptyState } from '@/components/ui/EmptyState'

interface WeeklyBarChartProps {
  data: WeeklySummary[]
}

interface TooltipPayload {
  value: number
  name: string
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayload[]
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-card-md p-3 text-sm border border-gray-100">
      <p className="font-medium text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon="📈"
        title="ยังไม่มีข้อมูล"
        description="เพิ่มรายการเพื่อดูกราฟ"
      />
    )
  }

  const formattedData = data.map(d => ({
    ...d,
    weekLabel: d.weekLabel.replace('สัปดาห์ที่ ', 'สัปดาห์'),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={formattedData} barSize={14} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="weekLabel"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600">
              {value === 'income' ? 'รายรับ' : 'รายจ่าย'}
            </span>
          )}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="income" name="income" fill="#84a06e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="expense" fill="#f87171" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
