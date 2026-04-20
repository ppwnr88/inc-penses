'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Budget, Category } from '@/types'

const schema = z.object({
  category_id: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  amount: z.string().min(1, 'กรุณาระบุจำนวนเงิน').refine(v => parseFloat(v) > 0, 'ต้องมากกว่า 0'),
})

type FormData = z.infer<typeof schema>

interface BudgetFormProps {
  categories: Category[]
  month: number
  year: number
  onSubmit: (data: Omit<Budget, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'category' | 'spent'>) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<FormData>
  isEditing?: boolean
}

export function BudgetForm({ categories, month, year, onSubmit, onCancel, defaultValues, isEditing = false }: BudgetFormProps) {
  const expenseCategories = categories.filter(c => c.type === 'expense')
  const categoryOptions = expenseCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onFormSubmit(data: FormData) {
    await onSubmit({
      category_id: data.category_id,
      amount: parseFloat(data.amount),
      month,
      year,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <Select
        label="หมวดหมู่"
        options={categoryOptions}
        placeholder="เลือกหมวดหมู่"
        {...register('category_id')}
        error={errors.category_id?.message}
      />

      <Input
        label="งบประมาณ (บาท)"
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        placeholder="0.00"
        leftAddon={<span className="text-sm">฿</span>}
        {...register('amount')}
        error={errors.amount?.message}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {isEditing ? 'บันทึก' : 'ตั้งงบประมาณ'}
        </Button>
      </div>
    </form>
  )
}
