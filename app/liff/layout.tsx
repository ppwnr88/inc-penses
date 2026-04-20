import React from 'react'
import { LiffProvider } from '@/features/auth/LiffProvider'
import { BottomNav } from '@/components/layout/BottomNav'

export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiffProvider>
      <div className="min-h-screen bg-cream-50">
        {children}
        <BottomNav />
      </div>
    </LiffProvider>
  )
}
