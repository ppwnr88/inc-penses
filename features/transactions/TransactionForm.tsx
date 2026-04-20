'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mic, Camera, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Category, Transaction, TransactionType } from '@/types'
import { todayString } from '@/lib/utils/date'
import { twMerge } from 'tailwind-merge'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'กรุณาระบุจำนวนเงิน').refine(v => parseFloat(v) > 0, 'จำนวนเงินต้องมากกว่า 0'),
  category_id: z.string().optional(),
  date: z.string().min(1, 'กรุณาเลือกวันที่'),
  note: z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

type InputTab = 'manual' | 'voice' | 'ocr'

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (data: Omit<Transaction, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category'>) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<FormData>
  isEditing?: boolean
}

export function TransactionForm({
  categories,
  onSubmit,
  onCancel,
  defaultValues,
  isEditing = false,
}: TransactionFormProps) {
  const [activeType, setActiveType] = useState<TransactionType>(defaultValues?.type ?? 'expense')
  const [activeTab, setActiveTab] = useState<InputTab>('manual')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: activeType,
      date: todayString(),
      ...defaultValues,
    },
  })

  const filteredCategories = categories.filter(c => c.type === activeType)

  const categoryOptions = [
    { value: '', label: 'ไม่ระบุหมวดหมู่' },
    ...filteredCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` })),
  ]

  function handleTypeChange(type: TransactionType) {
    setActiveType(type)
    setValue('type', type)
    setValue('category_id', '')
  }

  async function onFormSubmit(data: FormData) {
    setSubmitting(true)
    try {
      await onSubmit({
        type: data.type,
        amount: parseFloat(data.amount),
        category_id: data.category_id || null,
        date: data.date,
        note: data.note || null,
        receipt_url: null,
        input_method: activeTab === 'voice' ? 'voice' : activeTab === 'ocr' ? 'ocr' : 'manual',
        recurring_id: null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Type Toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(['expense', 'income'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => handleTypeChange(type)}
            className={twMerge(
              'flex-1 py-2 text-sm font-medium rounded-xl transition-all duration-150',
              activeType === type
                ? type === 'income'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'bg-white text-red-500 shadow-sm'
                : 'text-gray-500'
            )}
          >
            {type === 'income' ? '+ รายรับ' : '- รายจ่าย'}
          </button>
        ))}
      </div>

      {/* Input Method Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { id: 'manual', icon: Keyboard, label: 'พิมพ์' },
          { id: 'voice', icon: Mic, label: 'เสียง' },
          { id: 'ocr', icon: Camera, label: 'สแกน' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={twMerge(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all',
              activeTab === tab.id
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-gray-400'
            )}
          >
            <tab.icon size={13} />
            {tab.label}
            {(tab.id === 'voice' || tab.id === 'ocr') && (
              <span className="text-[10px] bg-brand-100 text-brand-600 px-1 rounded">เร็วๆนี้</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'voice' && (
        <div className="bg-brand-50 rounded-2xl p-4 text-center text-sm text-brand-600">
          <div className="text-3xl mb-2">🎙️</div>
          <p className="font-medium">บันทึกด้วยเสียง</p>
          <p className="text-xs text-brand-400 mt-1">ฟีเจอร์นี้กำลังพัฒนา จะเปิดใช้งานเร็วๆ นี้</p>
        </div>
      )}

      {activeTab === 'ocr' && (
        <div className="bg-brand-50 rounded-2xl p-4 text-center text-sm text-brand-600">
          <div className="text-3xl mb-2">📷</div>
          <p className="font-medium">สแกนใบเสร็จ</p>
          <p className="text-xs text-brand-400 mt-1">ฟีเจอร์นี้กำลังพัฒนา จะเปิดใช้งานเร็วๆ นี้</p>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          จำนวนเงิน (บาท)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 text-sm">฿</span>
          <input
            {...register('amount')}
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            className={twMerge(
              'w-full rounded-xl border bg-white pl-8 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all',
              'text-lg font-semibold',
              errors.amount ? 'border-red-400' : 'border-gray-200'
            )}
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <Select
        label="หมวดหมู่"
        options={categoryOptions}
        {...register('category_id')}
        error={errors.category_id?.message}
      />

      {/* Date */}
      <Input
        label="วันที่"
        type="date"
        {...register('date')}
        error={errors.date?.message}
      />

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          หมายเหตุ
        </label>
        <textarea
          {...register('note')}
          rows={2}
          placeholder="เพิ่มหมายเหตุ (ไม่บังคับ)"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none transition-all"
        />
        {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={submitting}
          variant={activeType === 'income' ? 'primary' : 'danger'}
        >
          {isEditing ? 'บันทึกการแก้ไข' : activeType === 'income' ? 'บันทึกรายรับ' : 'บันทึกรายจ่าย'}
        </Button>
      </div>
    </form>
  )
}
