'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  LogOut,
  Mail,
  RefreshCw,
  Users,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react'
import type { BackofficeSummary, BackofficeUserDetail, BackofficeUserSummary } from '@/lib/backoffice/summary'

type SessionState = 'checking' | 'authenticated' | 'unauthenticated' | 'unconfigured'

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value: string | null): string {
  if (!value) return '-'
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value))
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value))
}

function KpiCard({
  label,
  value,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  icon: React.ReactNode
  tone?: 'neutral' | 'green' | 'red' | 'blue'
}) {
  const toneClass = {
    neutral: 'bg-gray-900 text-white',
    green: 'bg-emerald-600 text-white',
    red: 'bg-rose-600 text-white',
    blue: 'bg-sky-600 text-white',
  }[tone]

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-950">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function BackofficePage() {
  const [sessionState, setSessionState] = useState<SessionState>('checking')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loadingLogin, setLoadingLogin] = useState(false)
  const [summary, setSummary] = useState<BackofficeSummary | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedUser, setSelectedUser] = useState<BackofficeUserSummary | null>(null)
  const [userDetail, setUserDetail] = useState<BackofficeUserDetail | null>(null)
  const [loadingUserDetail, setLoadingUserDetail] = useState(false)
  const [userDetailError, setUserDetailError] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  const monthLabel = useMemo(() => {
    if (!summary) return ''
    const date = new Date(summary.month.year, summary.month.month - 1, 1)
    return new Intl.DateTimeFormat('th-TH', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Bangkok',
    }).format(date)
  }, [summary])

  async function loadSummary(period = selectedPeriod) {
    setLoadingSummary(true)
    setSummaryError('')
    try {
      const params = period ? `?period=${encodeURIComponent(period)}` : ''
      const res = await fetch(`/api/backoffice/summary${params}`)
      if (res.status === 401) {
        setSessionState('unauthenticated')
        setSummary(null)
        return
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load summary')
      setSummary(json.data)
      setSelectedPeriod(json.data.month.period)
      setSelectedUser(null)
      setUserDetail(null)
      setUserDetailError('')
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to load summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/backoffice/session')
        const json = await res.json()
        if (res.status === 503) {
          setLoginError(json.error ?? 'Backoffice is not configured')
          setSessionState('unconfigured')
          return
        }
        if (json.authenticated) {
          setSessionState('authenticated')
          await loadSummary()
        } else {
          setSessionState('unauthenticated')
        }
      } catch {
        setLoginError('Cannot connect to backoffice session API')
        setSessionState('unauthenticated')
      }
    }

    checkSession()
  }, [])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingLogin(true)
    setLoginError('')
    try {
      const res = await fetch('/api/backoffice/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Login failed')
      setPassword('')
      setSessionState('authenticated')
      await loadSummary()
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoadingLogin(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/backoffice/logout', { method: 'POST' })
    setSummary(null)
    setSelectedPeriod('')
    setSelectedUser(null)
    setUserDetail(null)
    setSessionState('unauthenticated')
  }

  async function openUserDetail(user: BackofficeUserSummary) {
    setSelectedUser(user)
    setUserDetail(null)
    setUserDetailError('')
    setLoadingUserDetail(true)

    try {
      const params = selectedPeriod ? `?period=${encodeURIComponent(selectedPeriod)}` : ''
      const res = await fetch(`/api/backoffice/users/${user.id}/transactions${params}`)
      if (res.status === 401) {
        setSessionState('unauthenticated')
        setSummary(null)
        return
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load user detail')
      setUserDetail(json.data)
    } catch (err) {
      setUserDetailError(err instanceof Error ? err.message : 'Failed to load user detail')
    } finally {
      setLoadingUserDetail(false)
    }
  }

  if (sessionState === 'checking') {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <RefreshCw size={18} className="animate-spin" />
            Checking backoffice session...
          </div>
        </div>
      </main>
    )
  }

  if (sessionState !== 'authenticated') {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white p-6 text-gray-950 shadow-2xl">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Backoffice</p>
              <h1 className="mt-2 text-2xl font-semibold">จด Admin Console</h1>
              <p className="mt-2 text-sm text-gray-500">เข้าสู่ระบบเพื่อดูภาพรวมและรายชื่อผู้ใช้แบบ read-only</p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={sessionState === 'unconfigured'}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 disabled:bg-gray-100"
                  placeholder="BACKOFFICE_PASSWORD"
                />
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={!password || loadingLogin || sessionState === 'unconfigured'}
                className="flex w-full items-center justify-center rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingLogin ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ Backoffice'}
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-gray-950 p-6 text-white shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Backoffice</p>
            <h1 className="mt-2 text-2xl font-semibold">จด Admin Console</h1>
            <p className="mt-1 text-sm text-gray-300">
              Read-only dashboard{summary ? ` · ${monthLabel}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary && (
              <select
                value={selectedPeriod}
                onChange={async e => {
                  const period = e.target.value
                  setSelectedPeriod(period)
                  await loadSummary(period)
                }}
                disabled={loadingSummary}
                className="rounded-xl border border-white/15 bg-white px-3 py-2 text-sm font-semibold text-gray-950 outline-none transition-colors disabled:opacity-50"
              >
                {summary.availableMonths.map(item => {
                  const date = new Date(item.year, item.month - 1, 1)
                  const label = new Intl.DateTimeFormat('th-TH', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Bangkok',
                  }).format(date)
                  return (
                    <option key={item.period} value={item.period}>
                      {label}
                    </option>
                  )
                })}
              </select>
            )}
            <button
              type="button"
              onClick={() => loadSummary()}
              disabled={loadingSummary}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loadingSummary ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-gray-950 transition-colors hover:bg-gray-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {summaryError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {summaryError}
          </div>
        )}

        {summary ? (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Users" value={summary.kpis.totalUsers.toLocaleString('th-TH')} icon={<Users size={20} />} />
              <KpiCard label="Transactions" value={summary.kpis.totalTransactions.toLocaleString('th-TH')} icon={<WalletCards size={20} />} tone="blue" />
              <KpiCard label="Income In Selected Month" value={formatMoney(summary.kpis.monthIncome)} icon={<ArrowUpRight size={20} />} tone="green" />
              <KpiCard label="Expense In Selected Month" value={formatMoney(summary.kpis.monthExpense)} icon={<ArrowDownRight size={20} />} tone="red" />
            </section>

            <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <KpiCard label="Monthly Email Enabled" value={summary.kpis.monthlySummaryEnabledUsers.toLocaleString('th-TH')} icon={<Mail size={20} />} />
              <KpiCard label="Email Sent" value={summary.kpis.monthlyEmailSent.toLocaleString('th-TH')} icon={<CheckCircle2 size={20} />} tone="green" />
              <KpiCard label="Email Skipped" value={summary.kpis.monthlyEmailSkipped.toLocaleString('th-TH')} icon={<Clock size={20} />} tone="blue" />
              <KpiCard label="Email Failed" value={summary.kpis.monthlyEmailFailed.toLocaleString('th-TH')} icon={<XCircle size={20} />} tone="red" />
            </section>

            <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Users</h2>
                  <p className="text-sm text-gray-500">Click a user to view read-only transactions for the selected month.</p>
                </div>
                <p className="text-xs text-gray-400">Updated {formatDateTime(summary.generatedAt)}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">User</th>
                      <th className="px-5 py-3 font-semibold">Email</th>
                      <th className="px-5 py-3 font-semibold">Created</th>
                      <th className="px-5 py-3 font-semibold">Monthly Email</th>
                      <th className="px-5 py-3 text-right font-semibold">Tx Total</th>
                      <th className="px-5 py-3 text-right font-semibold">Income</th>
                      <th className="px-5 py-3 text-right font-semibold">Expense</th>
                      <th className="px-5 py-3 font-semibold">Last Tx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.users.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-gray-400" colSpan={8}>
                          No users yet
                        </td>
                      </tr>
                    ) : (
                      summary.users.map(user => (
                        <tr
                          key={user.id}
                          onClick={() => openUserDetail(user)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-950">{user.displayName}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-gray-500">{user.email ?? '-'}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="whitespace-nowrap px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              user.monthlySummaryEmailEnabled
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {user.monthlySummaryEmailEnabled ? 'Enabled' : 'Off'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-gray-700">{user.transactionCount.toLocaleString('th-TH')}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-emerald-700">{formatMoney(user.monthIncome)}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-right text-rose-700">{formatMoney(user.monthExpense)}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(user.lastTransactionDate)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {selectedUser && (
              <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">User Detail</p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-950">{selectedUser.displayName}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {monthLabel} · read-only · date, type, category, amount, note only
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null)
                      setUserDetail(null)
                      setUserDetailError('')
                    }}
                    className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <X size={16} />
                    Close
                  </button>
                </div>

                {userDetailError && (
                  <div className="m-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {userDetailError}
                  </div>
                )}

                {loadingUserDetail ? (
                  <div className="p-8 text-center text-sm text-gray-500">Loading user transactions...</div>
                ) : userDetail ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Date</th>
                          <th className="px-5 py-3 font-semibold">Type</th>
                          <th className="px-5 py-3 font-semibold">Category</th>
                          <th className="px-5 py-3 text-right font-semibold">Amount</th>
                          <th className="px-5 py-3 font-semibold">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userDetail.transactions.length === 0 ? (
                          <tr>
                            <td className="px-5 py-8 text-center text-gray-400" colSpan={5}>
                              No transactions in this month
                            </td>
                          </tr>
                        ) : (
                          userDetail.transactions.map(tx => (
                            <tr key={tx.id}>
                              <td className="whitespace-nowrap px-5 py-3 text-gray-500">{formatDate(tx.date)}</td>
                              <td className="whitespace-nowrap px-5 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  tx.type === 'income'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {tx.type === 'income' ? 'Income' : 'Expense'}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-5 py-3 text-gray-700">{tx.categoryName}</td>
                              <td className={`whitespace-nowrap px-5 py-3 text-right ${
                                tx.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                              }`}>
                                {formatMoney(tx.amount)}
                              </td>
                              <td className="max-w-md px-5 py-3 text-gray-600">
                                <span className="line-clamp-2">{tx.note ?? '-'}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            {loadingSummary ? 'Loading summary...' : 'No summary loaded'}
          </div>
        )}
      </div>
    </main>
  )
}
