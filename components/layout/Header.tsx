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
    <header className="sticky top-0 z-30 bg-[#fff8e9]/95 backdrop-blur-md border-b-2 border-[#e7d8b8]">
      <div className="flex items-center h-16 px-4 gap-3 max-w-lg mx-auto">
        {back && (
          <Link
            href={back}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
        )}
        <h1 className="flex-1 text-xl font-bold text-[#382814]">{title}</h1>
        {rightAction ? <div>{rightAction}</div> : <img src="/images/wallet-mascot.webp" alt="" aria-hidden="true" className="h-12 w-12 object-contain" />}
      </div>
    </header>
  )
}
