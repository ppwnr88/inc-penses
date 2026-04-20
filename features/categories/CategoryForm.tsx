'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Category } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อหมวดหมู่').max(30),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, 'กรุณาเลือก icon'),
  color: z.string().min(1),
})

type FormData = z.infer<typeof schema>

const ICON_OPTIONS = ['🍜', '🚗', '🏠', '🛍️', '💊', '🎬', '📚', '💸', '💼', '📈', '💰', '🎯', '☕', '✈️', '🎓', '🛒', '🏋️', '🎮', '🐾', '👶']

interface CategoryFormProps {
  onSubmit: (data: Omit<Category, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  defaultValues?: Partial<FormData>
  isEditing?: boolean
}

export function CategoryForm({ onSubmit, onCancel, defaultValues, isEditing = false }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      icon: '💰',
      color: '#84a06e',
      ...defaultValues,
    },
  })

  const selectedIcon = watch('icon')

  async function onFormSubmit(data: FormData) {
    await onSubmit({
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      is_default: false,
      sort_order: 99,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        {(['expense', 'income'] as const).map(type => (
          <button
            key={type}
            type="button"
            onClick={() => setValue('type', type)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
              watch('type') === type ? 'bg-white shadow-sm text-brand-700' : 'text-gray-500'
            }`}
          >
            {type === 'income' ? 'รายรับ' : 'รายจ่าย'}
          </button>
        ))}
      </div>

      <Input
        label="ชื่อหมวดหมู่"
        placeholder="เช่น ค่ากาแฟ"
        {...register('name')}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ไอคอน</label>
        <div className="grid grid-cols-10 gap-1">
          {ICON_OPTIONS.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => setValue('icon', icon)}
              className={`aspect-square flex items-center justify-center text-xl rounded-xl transition-all ${
                selectedIcon === icon ? 'bg-brand-100 ring-2 ring-brand-400' : 'hover:bg-gray-100'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
        {errors.icon && <p className="mt-1 text-xs text-red-500">{errors.icon.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">สี</label>
        <input
          type="color"
          {...register('color')}
          className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" fullWidth loading={isSubmitting}>
          {isEditing ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
        </Button>
      </div>
    </form>
  )
}
