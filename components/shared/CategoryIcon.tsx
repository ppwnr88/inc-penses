import React from 'react'
import { twMerge } from 'tailwind-merge'

interface CategoryIconProps {
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { wrapper: 'w-8 h-8 text-base', },
  md: { wrapper: 'w-10 h-10 text-xl', },
  lg: { wrapper: 'w-12 h-12 text-2xl', },
}

export function CategoryIcon({ icon, color, size = 'md', className }: CategoryIconProps) {
  const { wrapper } = sizeMap[size]

  return (
    <div
      className={twMerge(
        'flex items-center justify-center rounded-2xl flex-shrink-0',
        wrapper,
        className
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <span role="img" aria-hidden>{icon}</span>
    </div>
  )
}
