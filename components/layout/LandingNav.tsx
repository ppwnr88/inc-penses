'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand-700">
          เงินจด
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">
            ฟีเจอร์
          </Link>
          <Link href="/liff">
            <Button size="sm">เริ่มใช้งาน</Button>
          </Link>
        </nav>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link
            href="/features"
            className="block text-sm text-gray-600 py-2"
            onClick={() => setOpen(false)}
          >
            ฟีเจอร์
          </Link>
          <Link href="/liff" onClick={() => setOpen(false)}>
            <Button fullWidth>เริ่มใช้งาน</Button>
          </Link>
        </div>
      )}
    </header>
  )
}
