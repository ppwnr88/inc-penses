'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LiffProvider } from '@/features/auth/LiffProvider'
import { BottomNav } from '@/components/layout/BottomNav'

const PAGE_MAP: Record<string, string> = {
  dashboard:    '/liff',
  reports:      '/liff/reports',
  budgets:      '/liff/budgets',
  transactions: '/liff/transactions',
  settings:     '/liff/settings',
  categories:   '/liff/categories',
  recurring:    '/liff/recurring',
}

function PageRouter({ children }: { children: React.ReactNode }) {
  const router = useSearchParams ? useSearchParams() : null
  const routerNav = useRouter()
  const page = router?.get('page')

  useEffect(() => {
    if (page && PAGE_MAP[page]) {
      routerNav.replace(PAGE_MAP[page])
    }
  }, [page, routerNav])

  return <>{children}</>
}

export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <LiffProvider>
      <div className="min-h-screen bg-cream-50">
        <React.Suspense fallback={null}>
          <PageRouter>{children}</PageRouter>
        </React.Suspense>
        <BottomNav />
      </div>
    </LiffProvider>
  )
}
