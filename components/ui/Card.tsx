import React from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ padding = 'md', hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl shadow-card',
          paddingStyles[padding],
          hover && 'cursor-pointer hover:shadow-card-md transition-shadow duration-150'
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
