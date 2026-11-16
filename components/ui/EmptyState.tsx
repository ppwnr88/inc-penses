import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {icon && (
        <div className="text-4xl mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-[#d7dba9] bg-[#edf2d4]">{icon}</div>
      )}
      <h3 className="text-base font-bold text-[#382814] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#756a56] mb-4 max-w-xs">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  )
}
