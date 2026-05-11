'use client'

import React, { useEffect, useState } from 'react'
import { Download, Bell, Calendar, User, Trash2, Mail } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { usePreferences, CURRENCIES } from '@/lib/i18n/PreferencesContext'
import type { Lang } from '@/lib/i18n/translations'

const APP_VERSION = '0.1.0'

export default function SettingsPage() {
  const { profile, refetch } = useAuth()
  const { t, lang, currency, setLang, setCurrency } = usePreferences()
  const [budgetDay, setBudgetDay] = useState(profile?.budget_cycle_day ?? 1)
  const [notifyEnabled, setNotifyEnabled] = useState(profile?.notify_daily ?? true)
  const [notifyTime, setNotifyTime] = useState(profile?.notify_time ?? '20:00')
  const [monthlySummaryEnabled, setMonthlySummaryEnabled] = useState(profile?.monthly_summary_email_enabled ?? false)
  const [email, setEmail] = useState(profile?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteFrom, setDeleteFrom] = useState('')
  const [deleteTo, setDeleteTo] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState('')
  const [showDeleteAll, setShowDeleteAll] = useState(false)

  useEffect(() => {
    if (!profile) return
    setBudgetDay(profile.budget_cycle_day ?? 1)
    setNotifyEnabled(profile.notify_daily ?? true)
    setNotifyTime(profile.notify_time ?? '20:00')
    setMonthlySummaryEnabled(profile.monthly_summary_email_enabled ?? false)
    setEmail(profile.email ?? '')
  }, [profile])

  async function handleSave() {
    if (!profile) return
    if (monthlySummaryEnabled && !email.trim()) {
      alert(t.settings.monthlySummaryEmailRequired)
      return
    }
    setSaving(true)
    try {
      await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_cycle_day: budgetDay,
          notify_daily: notifyEnabled,
          notify_time: notifyTime,
          monthly_summary_email_enabled: monthlySummaryEnabled,
          email: email.trim() || null,
        }),
      })
      await refetch()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function handleExportAll() {
    if (!profile) return
    const url = `/api/export?profile_id=${profile.id}&type=excel`
    window.open(url, '_blank')
  }

  async function handleLangChange(l: Lang) {
    setLang(l)
    if (profile?.line_user_id) {
      fetch('/api/richmenu/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line_user_id: profile.line_user_id, lang: l }),
      }).catch(() => {})
    }
    if (profile?.id) {
      fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: l }),
      }).catch(() => {})
    }
  }

  return (
    <div className="page-container pt-0 space-y-4">
      <Header title={t.settings.title} />

      <div className="pt-3 space-y-4">
        {/* Profile */}
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              {profile?.picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.picture_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-brand-600 font-bold text-xl">
                  {(profile?.display_name ?? 'U')[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{profile?.display_name}</p>
              <p className="text-xs text-gray-400">{t.settings.lineUser}</p>
              {profile?.email && (
                <p className="text-xs text-gray-400">{profile.email}</p>
              )}
            </div>
            <User size={16} className="ml-auto text-gray-300" />
          </div>
        </Card>

        {/* Budget Cycle */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-800">{t.settings.budgetCycle}</h3>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              {t.settings.budgetCycleLabel}
            </label>
            <input
              type="number"
              min={1}
              max={28}
              value={budgetDay}
              onChange={e => setBudgetDay(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              {t.settings.budgetCycleHint} {budgetDay} {t.settings.budgetCycleHint2}
            </p>
          </div>
        </Card>

        {/* Notifications */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-800">{t.settings.notifications}</h3>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-700">{t.settings.dailyNotify}</p>
              <p className="text-xs text-gray-400">{t.settings.dailyNotifyDesc}</p>
            </div>
            <button
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notifyEnabled ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                notifyEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {notifyEnabled && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t.settings.notifyTime}</label>
              <input
                type="time"
                value={notifyTime}
                onChange={e => setNotifyTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          )}
        </Card>

        {/* Monthly Summary Email */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-800">{t.settings.monthlySummary}</h3>
          </div>

          <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <p className="text-sm text-gray-700">{t.settings.monthlySummaryToggle}</p>
              <p className="text-xs text-gray-400">{t.settings.monthlySummaryDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => setMonthlySummaryEnabled(!monthlySummaryEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                monthlySummaryEnabled ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                monthlySummaryEnabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {monthlySummaryEnabled && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">{t.settings.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <p className="text-xs text-gray-400 mt-1">{t.settings.monthlySummaryHint}</p>
            </div>
          )}
        </Card>

        {/* Currency */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{t.settings.currency}</h3>
          <p className="text-xs text-gray-400 mb-3">{t.settings.currencyDesc}</p>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Card>

        {/* Language */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.settings.language}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleLangChange('th')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${lang === 'th' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200'}`}
            >ไทย</button>
            <button
              onClick={() => handleLangChange('en')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${lang === 'en' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-600 border-gray-200'}`}
            >English</button>
          </div>
        </Card>

        {/* Save Button */}
        <Button fullWidth loading={saving} onClick={handleSave}>
          {saved ? t.settings.saved : t.settings.saveSettings}
        </Button>

        {/* Export */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.settings.exportTitle}</h3>
          <p className="text-xs text-gray-400 mb-3">{t.settings.exportDesc}</p>
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<Download size={14} />}
            onClick={handleExportAll}
          >
            {t.settings.exportBtn}
          </Button>
        </Card>

        {/* Delete Data */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 size={16} className="text-red-500" />
            <h3 className="text-sm font-semibold text-gray-800">{t.settings.deleteData}</h3>
          </div>

          {/* Date range delete */}
          <p className="text-xs text-gray-500 mb-2">{t.settings.deleteByRange}</p>
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              value={deleteFrom}
              onChange={e => setDeleteFrom(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <span className="self-center text-gray-400 text-xs">{t.settings.to}</span>
            <input
              type="date"
              value={deleteTo}
              onChange={e => setDeleteTo(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <button
            disabled={!deleteFrom || !deleteTo || deleting}
            onClick={async () => {
              if (!profile || !deleteFrom || !deleteTo) return
              if (!confirm(`${t.settings.deleteByRange} ${deleteFrom} ${t.settings.to} ${deleteTo}?`)) return
              setDeleting(true)
              setDeleteMsg('')
              try {
                const res = await fetch(`/api/transactions?profile_id=${profile.id}&date_from=${deleteFrom}&date_to=${deleteTo}`, { method: 'DELETE' })
                if (res.ok) {
                  setDeleteMsg(t.settings.deleteSuccess)
                  setDeleteFrom('')
                  setDeleteTo('')
                } else {
                  setDeleteMsg(t.settings.deleteError)
                }
              } finally {
                setDeleting(false)
                setTimeout(() => setDeleteMsg(''), 3000)
              }
            }}
            className="w-full rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium py-2.5 disabled:opacity-40 hover:bg-red-100 transition-colors"
          >
            {deleting ? t.settings.deleting : t.settings.deleteRangeBtn}
          </button>

          {/* Delete all */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">{t.settings.deleteAll}</p>
            {!showDeleteAll ? (
              <button
                onClick={() => setShowDeleteAll(true)}
                className="w-full rounded-xl bg-white border border-red-300 text-red-500 text-sm font-medium py-2.5 hover:bg-red-50 transition-colors"
              >
                {t.settings.deleteAll}...
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-red-500 font-medium text-center">{t.settings.deleteAllWarning}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteAll(false)}
                    className="flex-1 rounded-xl border border-gray-200 text-gray-600 text-sm py-2.5 hover:bg-gray-50"
                  >
                    {t.settings.cancel}
                  </button>
                  <button
                    disabled={deleting}
                    onClick={async () => {
                      if (!profile) return
                      setDeleting(true)
                      setDeleteMsg('')
                      try {
                        const res = await fetch(`/api/transactions?profile_id=${profile.id}`, { method: 'DELETE' })
                        if (res.ok) {
                          setDeleteMsg(t.settings.deleteSuccess)
                          setShowDeleteAll(false)
                        } else {
                          setDeleteMsg(t.settings.deleteError)
                        }
                      } finally {
                        setDeleting(false)
                        setTimeout(() => setDeleteMsg(''), 3000)
                      }
                    }}
                    className="flex-1 rounded-xl bg-red-500 text-white text-sm font-medium py-2.5 hover:bg-red-600 disabled:opacity-40"
                  >
                    {deleting ? t.settings.deleting : t.settings.confirmDelete}
                  </button>
                </div>
              </div>
            )}
          </div>

          {deleteMsg && (
            <p className="text-xs text-center mt-2 text-green-600">{deleteMsg}</p>
          )}
        </Card>

        {/* App Info */}
        <div className="text-center py-4 space-y-1">
          <p className="text-base font-bold text-brand-600">{t.settings.appName}</p>
          <p className="text-xs text-gray-400">{t.settings.appDesc}</p>
          <p className="text-xs text-gray-300">v{APP_VERSION} · {t.settings.freeApp}</p>
        </div>
      </div>
    </div>
  )
}
