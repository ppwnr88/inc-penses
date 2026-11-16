'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#fff8e9]/95 backdrop-blur-md border-b-2 border-[#e7d8b8]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[#382814]">
          <Image src="/images/wallet-mascot.webp" width={112} height={112} alt="" aria-hidden="true" className="h-11 w-11 object-contain" /> จด
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
        <div className="md:hidden bg-[#fff8e9] border-t border-[#e7d8b8] px-4 py-4 space-y-3">
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
