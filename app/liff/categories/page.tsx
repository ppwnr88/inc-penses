'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { CategoryList } from '@/features/categories/CategoryList'
import { CategoryForm } from '@/features/categories/CategoryForm'
import { Modal } from '@/components/ui/Modal'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCategories } from '@/features/categories/useCategories'
import type { Category } from '@/types'
import { twMerge } from 'tailwind-merge'

export default function CategoriesPage() {
  const { categories, loading, error, refetch, createCategory, updateCategory, deleteCategory, filterByType } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')

  async function handleCreate(data: Omit<Category, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) {
    await createCategory(data)
    setShowForm(false)
  }

  async function handleUpdate(data: Omit<Category, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) {
    if (!editingCategory) return
    await updateCategory(editingCategory.id, data)
    setEditingCategory(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('ต้องการลบหมวดหมู่นี้?')) return
    await deleteCategory(id)
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <div className="page-container pt-0 space-y-3">
      <Header
        title="หมวดหมู่"
        rightAction={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl"
          >
            <Plus size={14} />
            เพิ่ม
          </button>
        }
      />

      <div className="pt-3 space-y-3">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          {(['expense', 'income'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={twMerge(
                'flex-1 py-2 text-sm font-medium rounded-xl transition-all',
                activeTab === tab ? 'bg-white shadow-sm text-brand-700' : 'text-gray-500'
              )}
            >
              {tab === 'expense' ? 'รายจ่าย' : 'รายรับ'}
            </button>
          ))}
        </div>

        <CategoryList
          categories={filterByType(activeTab)}
          loading={loading}
          onEdit={setEditingCategory}
          onDelete={handleDelete}
        />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="เพิ่มหมวดหมู่">
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          defaultValues={{ type: activeTab }}
        />
      </Modal>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="แก้ไขหมวดหมู่"
      >
        {editingCategory && (
          <CategoryForm
            onSubmit={handleUpdate}
            onCancel={() => setEditingCategory(null)}
            defaultValues={{
              name: editingCategory.name,
              type: editingCategory.type,
              icon: editingCategory.icon,
              color: editingCategory.color,
            }}
            isEditing
          />
        )}
      </Modal>
    </div>
  )
}
