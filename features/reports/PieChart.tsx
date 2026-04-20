'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { CategorySummary } from '@/types'
import { formatCurrency } from '@/lib/utils/currency'
import { EmptyState } from '@/components/ui/EmptyState'

interface ExpensePieChartProps {
  data: CategorySummary[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: CategorySummary }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white rounded-xl shadow-card-md p-3 text-sm border border-gray-100">
      <p className="font-medium text-gray-800 mb-1">
        {item.payload.category_icon} {item.payload.category_name}
      </p>
      <p className="text-gray-600">{formatCurrency(item.value)}</p>
      <p className="text-gray-400 text-xs">{item.payload.percentage.toFixed(1)}%</p>
    </div>
  )
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="ยังไม่มีข้อมูลรายจ่าย"
        description="เพิ่มรายจ่ายเพื่อดูกราฟ"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          dataKey="total"
          nameKey="category_name"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.category_color || `hsl(${(index * 47) % 360}, 60%, 60%)`}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
