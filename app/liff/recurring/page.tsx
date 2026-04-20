'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pause, Play, Pencil, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/features/auth/useAuth'
import { useCategories } from '@/features/categories/useCategories'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import type { RecurringTransaction, TransactionType } from '@/types'
import { formatDate } from '@/lib/utils/date'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1).refine(v => parseFloat(v) > 0),
  category_id: z.string().optional(),
  note: z.string().max(200).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  next_due_date: z.string().min(1),
})

type FormData = z.infer<typeof schema>

const frequencyLabels: Record<string, string> = {
  daily: 'รายวัน',
  weekly: 'รายสัปดาห์',
  monthly: 'รายเดือน',
  yearly: 'รายปี',
}

function RecurringForm({
  categories,
  onSubmit,
  onCancel,
  defaultValues,
  isEditing,
}: {
  categories: import('@/types').Category[]
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<FormData>
  isEditing?: boolean
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      frequency: 'monthly',
      next_due_date: new Date().toISOString().split('T')[0],
      ...defaultValues,
    },
  })

  const activeType = watch('type')
  const filteredCats = categories.filter(c => c.type === activeType)
  const catOptions = [
    { value: '', label: 'ไม่ระบุหมวดหมู่' },
    ...filteredCats.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ]
  const freqOptions = Object.entries(frequencyLabels).map(([v, l]) => ({ value: v, label: l }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(['expense', 'income'] as const).map(t => (
          <button key={t} type="button" onClick={() => { setValue('type', t); setValue('category_id', '') }}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeType === t ? 'bg-white shadow-sm text-brand-700' : 'text-gray-500'}`}>
            {t === 'income' ? '+ รายรับ' : '- รายจ่าย'}
          </button>
        ))}
      </div>

      <Input label="จำนวนเงิน (บาท)" type="number" step="0.01" min="0" inputMode="decimal"
        leftAddon={<span className="text-sm">฿</span>} {...register('amount')}
        error={errors.amount?.message} />

      <Select label="หมวดหมู่" options={catOptions} {...register('category_id')} />

      <Input label="หมายเหตุ" placeholder="เช่น ค่าเช่าห้อง" {...register('note')} />

      <Select label="ความถี่" options={freqOptions} {...register('frequency')} />

      <Input label="วันที่เริ่มต้น / ครั้งถัดไป" type="date" {...register('next_due_date')}
        error={errors.next_due_date?.message} />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {isEditing ? 'บันทึก' : 'เพิ่มรายการประจำ'}
        </Button>
      </div>
    </form>
  )
}

export default function RecurringPage() {
  const { profile } = useAuth()
  const { categories } = useCategories()
  const [items, setItems] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RecurringTransaction | null>(null)

  const fetchItems = useCallback(async () => {
    if (!profile) return
    try {
      setLoading(true)
      const res = await fetch(`/api/recurring?profile_id=${profile.id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = (await res.json()) as { data: RecurringTransaction[] }
      setItems(data.data)
    } catch {
      setError('ไม่สามารถโหลดข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleCreate(data: FormData) {
    if (!profile) return
    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        amount: parseFloat(data.amount),
        category_id: data.category_id || null,
        profile_id: profile.id,
      }),
    })
    if (!res.ok) throw new Error('Failed to create')
    setShowForm(false)
    fetchItems()
  }

  async function handleUpdate(data: FormData) {
    if (!editing) return
    const res = await fetch(`/api/recurring/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, amount: parseFloat(data.amount), category_id: data.category_id || null }),
    })
    if (!res.ok) throw new Error('Failed to update')
    setEditing(null)
    fetchItems()
  }

  async function toggleActive(item: RecurringTransaction) {
    await fetch(`/api/recurring/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    })
    fetchItems()
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบรายการประจำนี้?')) return
    await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (error) return <ErrorState message={error} onRetry={fetchItems} />

  return (
    <div className="page-container pt-0 space-y-3">
      <Header title="รายการประจำ" rightAction={
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl">
          <Plus size={14} />เพิ่ม
        </button>
      } />

      <div className="pt-3 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon="🔄" title="ยังไม่มีรายการประจำ"
            description="เพิ่มรายการที่เกิดซ้ำ เช่น ค่าเช่า เงินเดือน"
            action={{ label: '+ เพิ่มรายการประจำ', onClick: () => setShowForm(true) }} />
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} padding="md" className={!item.is_active ? 'opacity-60' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryIcon icon={item.category?.icon ?? '🔄'} color={item.category?.color ?? '#84a06e'} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item.category?.name ?? 'ไม่ระบุหมวดหมู่'}
                      </p>
                      {item.note && <p className="text-xs text-gray-400">{item.note}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {frequencyLabels[item.frequency]}
                        </span>
                        <span className="text-xs text-gray-400">
                          ครั้งถัดไป: {formatDate(item.next_due_date, 'd MMM')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <AmountDisplay amount={item.amount} type={item.type} size="sm" />
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(item)}
                        className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition-colors">
                        {item.is_active ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                      <button onClick={() => setEditing(item)}
                        className="p-1.5 rounded-xl hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="เพิ่มรายการประจำ">
        <RecurringForm categories={categories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="แก้ไขรายการประจำ">
        {editing && (
          <RecurringForm categories={categories} onSubmit={handleUpdate} onCancel={() => setEditing(null)}
            defaultValues={{
              type: editing.type,
              amount: String(editing.amount),
              category_id: editing.category_id ?? '',
              note: editing.note ?? '',
              frequency: editing.frequency,
              next_due_date: editing.next_due_date,
            }}
            isEditing />
        )}
      </Modal>
    </div>
  )
}
