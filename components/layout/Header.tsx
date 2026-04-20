import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  back?: string
  rightAction?: React.ReactNode
}

export function Header({ title, back, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center h-14 px-4 gap-3 max-w-lg mx-auto">
        {back && (
          <Link
            href={back}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
        )}
        <h1 className="flex-1 text-base font-semibold text-gray-800">{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
