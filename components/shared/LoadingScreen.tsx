'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

export function LoadingScreen() {
  const [isEn, setIsEn] = useState(false)

  useEffect(() => {
    setIsEn(localStorage.getItem('pref_lang') === 'en')
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50">
      <div className="flex flex-col items-center gap-4">
        <Image src="/images/wallet-mascot.webp" width={112} height={112} alt="" aria-hidden="true" className="w-24 h-24 object-contain" />
        <div className="text-4xl font-bold text-[#382814] tracking-tight">
          {isEn ? 'Record' : 'จด'}
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-brand-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-gray-400">{isEn ? 'Loading...' : 'กำลังโหลด...'}</p>
      </div>
    </div>
  )
}
