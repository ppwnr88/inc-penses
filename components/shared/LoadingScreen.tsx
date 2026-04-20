import React from 'react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl font-bold text-brand-600 tracking-tight">เงินจด</div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-gray-400">กำลังโหลด...</p>
      </div>
    </div>
  )
}
