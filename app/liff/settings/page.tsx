'use client'

import React, { useState } from 'react'
import { Download, ChevronRight, Bell, Calendar, User } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/useAuth'
import { formatCurrency } from '@/lib/utils/currency'

const APP_VERSION = '0.1.0'

export default function SettingsPage() {
  const { profile, refetch } = useAuth()
  const [budgetDay, setBudgetDay] = useState(profile?.budget_cycle_day ?? 1)
  const [notifyEnabled, setNotifyEnabled] = useState(profile?.notify_daily ?? true)
  const [notifyTime, setNotifyTime] = useState(profile?.notify_time ?? '20:00')
  const [saving, setSaving] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    try {
      await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget_cycle_day: budgetDay,
          notify_daily: notifyEnabled,
          notify_time: notifyTime,
        }),
      })
      await refetch()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleExportAll() {
    if (!profile) return
    setExportLoading(true)
    try {
      const res = await fetch(`/api/export?profile_id=${profile.id}&type=excel`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `เงินจด_ข้อมูลทั้งหมด.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('เกิดข้อผิดพลาดในการ Export')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="page-container pt-0 space-y-4">
      <Header title="ตั้งค่า" />

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
              <p className="text-xs text-gray-400">ผู้ใช้งาน LINE</p>
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
            <h3 className="text-sm font-semibold text-gray-800">รอบงบประมาณ</h3>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              วันที่เริ่มรอบงบประมาณ (วันที่ 1-28)
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
              รอบงบประมาณจะเริ่มในวันที่ {budgetDay} ของทุกเดือน
            </p>
          </div>
        </Card>

        {/* Notifications */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-brand-600" />
            <h3 className="text-sm font-semibold text-gray-800">การแจ้งเตือน</h3>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-700">แจ้งเตือนประจำวัน</p>
              <p className="text-xs text-gray-400">เตือนให้จดรายการทุกวัน</p>
            </div>
            <button
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifyEnabled ? 'bg-brand-500' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                notifyEnabled ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {notifyEnabled && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">เวลาแจ้งเตือน</label>
              <input
                type="time"
                value={notifyTime}
                onChange={e => setNotifyTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          )}
        </Card>

        {/* Save Button */}
        <Button fullWidth loading={saving} onClick={handleSave}>
          {saved ? '✓ บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
        </Button>

        {/* Export */}
        <Card padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Export ข้อมูลทั้งหมด</h3>
          <p className="text-xs text-gray-400 mb-3">
            ดาวน์โหลดรายการทั้งหมดเป็นไฟล์ Excel
          </p>
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<Download size={14} />}
            loading={exportLoading}
            onClick={handleExportAll}
          >
            ดาวน์โหลดข้อมูลทั้งหมด
          </Button>
        </Card>

        {/* App Info */}
        <div className="text-center py-4 space-y-1">
          <p className="text-base font-bold text-brand-600">เงินจด</p>
          <p className="text-xs text-gray-400">ผู้ช่วยจดรายรับรายจ่ายส่วนตัว ผ่าน LINE</p>
          <p className="text-xs text-gray-300">v{APP_VERSION} · ทุกฟีเจอร์ใช้ฟรี</p>
        </div>
      </div>
    </div>
  )
}
