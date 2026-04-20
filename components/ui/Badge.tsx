import React from 'react'
import { twMerge } from 'tailwind-merge'

type BadgeVariant = 'income' | 'expense' | 'success' | 'warning' | 'error' | 'neutral' | 'coming-soon'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  income: 'bg-green-100 text-green-700',
  expense: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
  'coming-soon': 'bg-brand-100 text-brand-700',
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
