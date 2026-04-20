'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, BarChart2, Settings } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const navItems = [
  { href: '/liff', label: 'หน้าหลัก', icon: Home },
  { href: '/liff/transactions', label: 'รายการ', icon: List },
  { href: '/liff/reports', label: 'รายงาน', icon: BarChart2 },
  { href: '/liff/settings', label: 'ตั้งค่า', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 safe-area-pb z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={twMerge(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-150',
                isActive
                  ? 'text-brand-600'
                  : 'text-gray-400 hover:text-brand-400'
              )}
            >
              <Icon
                size={22}
                className={twMerge(
                  'transition-transform duration-150',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={twMerge('text-xs', isActive && 'font-semibold')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
