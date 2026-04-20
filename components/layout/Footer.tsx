import React from 'react'

export function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-200 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xl font-bold text-white mb-1">เงินจด</div>
          <p className="text-sm text-brand-300">ผู้ช่วยจดรายรับรายจ่ายส่วนตัว ผ่าน LINE</p>
        </div>
        <p className="text-xs text-brand-400">© {new Date().getFullYear()} เงินจด · ทุกฟีเจอร์ใช้ฟรี</p>
      </div>
    </footer>
  )
}
