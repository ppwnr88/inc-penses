import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function getColor(percent: number): string {
  if (percent >= 100) return 'bg-red-500'
  if (percent >= 90) return 'bg-red-400'
  if (percent >= 70) return 'bg-yellow-400'
  return 'bg-brand-500'
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  className,
  size = 'md',
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  const colorClass = getColor(percent)

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">ใช้ไป</span>
          <span
            className={twMerge(
              'text-xs font-medium',
              percent >= 90 ? 'text-red-600' : percent >= 70 ? 'text-yellow-600' : 'text-brand-700'
            )}
          >
            {percent}%
          </span>
        </div>
      )}
      <div className={twMerge('w-full bg-gray-100 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={twMerge('rounded-full transition-all duration-500', colorClass, sizeMap[size])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
