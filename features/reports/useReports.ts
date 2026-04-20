'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ReportSummary } from '@/types'
import { useAuth } from '@/features/auth/useAuth'
import { getCurrentMonthYear } from '@/lib/utils/date'

interface UseReportsReturn {
  report: ReportSummary | null
  loading: boolean
  error: string | null
  month: number
  year: number
  setMonth: (month: number) => void
  setYear: (year: number) => void
  refetch: () => Promise<void>
}

export function useReports(): UseReportsReturn {
  const { profile } = useAuth()
  const { month: curMonth, year: curYear } = getCurrentMonthYear()
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(curMonth)
  const [year, setYear] = useState(curYear)

  const fetchReport = useCallback(async () => {
    if (!profile) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `/api/reports?profile_id=${profile.id}&month=${month}&year=${year}`
      )
      if (!res.ok) throw new Error('Failed to fetch report')
      const data = (await res.json()) as { data: ReportSummary }
      setReport(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }, [profile, month, year])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  return { report, loading, error, month, year, setMonth, setYear, refetch: fetchReport }
}
