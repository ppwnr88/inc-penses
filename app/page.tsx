import React from 'react'
import Link from 'next/link'
import { LandingNav } from '@/components/layout/LandingNav'
import { Footer } from '@/components/layout/Footer'

const features = [
  {
    icon: '⌨️',
    title: 'บันทึกจากข้อความ',
    description: 'พิมพ์ง่าย บันทึกเร็ว ไม่ยุ่งยาก',
    badge: null,
  },
  {
    icon: '📷',
    title: 'สแกนใบเสร็จ',
    description: 'ถ่ายรูปใบเสร็จ ระบบจดให้เอง',
    badge: 'Coming Soon',
  },
  {
    icon: '🎙️',
    title: 'บันทึกด้วยเสียง',
    description: 'พูดปุ๊บ จดเลย ไม่ต้องพิมพ์',
    badge: 'Coming Soon',
  },
  {
    icon: '🏷️',
    title: 'หมวดหมู่อัจฉริยะ',
    description: 'จำพฤติกรรมจากประวัติ แนะนำอัตโนมัติ',
    badge: null,
  },
  {
    icon: '🎯',
    title: 'ตั้งงบประมาณ',
    description: 'กำหนดงบต่อหมวด ติดตามการใช้จ่าย',
    badge: null,
  },
  {
    icon: '📊',
    title: 'รายงานรายเดือน',
    description: 'สรุปอัตโนมัติทุกสิ้นเดือน',
    badge: null,
  },
  {
    icon: '🔄',
    title: 'รายการประจำ',
    description: 'ตั้งรายรับ/จ่ายซ้ำอัตโนมัติ',
    badge: null,
  },
  {
    icon: '📈',
    title: 'กราฟวิเคราะห์',
    description: 'เข้าใจพฤติกรรมการใช้เงิน',
    badge: null,
  },
  {
    icon: '📥',
    title: 'Export ข้อมูล',
    description: 'ดาวน์โหลด CSV / Excel',
    badge: null,
  },
  {
    icon: '🔔',
    title: 'แจ้งเตือนรายวัน',
    description: 'เตือนให้จดทุกวัน ไม่หลงลืม',
    badge: null,
  },
]

const steps = [
  {
    step: '1',
    icon: '📱',
    title: 'เปิดใน LINE',
    description: 'เปิดแอปผ่าน LINE LIFF ได้ทันที ไม่ต้องดาวน์โหลดเพิ่ม',
  },
  {
    step: '2',
    icon: '✏️',
    title: 'จดรายการ',
    description: 'บันทึกรายรับรายจ่ายได้ในไม่กี่วินาที',
  },
  {
    step: '3',
    icon: '📊',
    title: 'ดูสรุป',
    description: 'ดูรายงานและกราฟ เข้าใจการใช้เงินของตัวเอง',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <LandingNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span>✨</span>
            <span>ผู้ช่วยจดรายรับรายจ่ายส่วนตัว ผ่าน LINE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            จดรายรับรายจ่าย
            <br />
            <span className="text-brand-600">ง่ายกว่าที่คิด</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
            เงินจด คือผู้ช่วยจดรายรับรายจ่ายส่วนตัวที่อยู่ใน LINE ของคุณ
            บันทึกง่าย ดูสรุปชัด ไม่ยุ่งยาก
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/liff"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors text-base shadow-sm"
            >
              เริ่มใช้งานฟรี →
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-brand-50 text-brand-700 font-semibold px-8 py-3.5 rounded-2xl border border-brand-200 transition-colors text-base"
            >
              ดูฟีเจอร์ทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="px-4 mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-brand-500 rounded-3xl p-6 grid grid-cols-3 gap-4 text-center text-white">
            <div>
              <div className="text-2xl font-bold">10+</div>
              <div className="text-xs text-brand-100 mt-1">ฟีเจอร์ครบ</div>
            </div>
            <div className="border-x border-brand-400">
              <div className="text-2xl font-bold">ฟรี</div>
              <div className="text-xs text-brand-100 mt-1">ทุกฟีเจอร์</div>
            </div>
            <div>
              <div className="text-2xl font-bold">LINE</div>
              <div className="text-xs text-brand-100 mt-1">รองรับ LIFF</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 mb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">วิธีใช้งาน</h2>
            <p className="text-gray-500">ง่ายแค่ 3 ขั้นตอน</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative bg-white rounded-3xl p-6 shadow-card text-center">
                <div className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 mb-20 bg-white py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ฟีเจอร์ที่ครบครัน</h2>
            <p className="text-gray-500">ทุกสิ่งที่ต้องการ รวมอยู่ในที่เดียว</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-cream-50 hover:bg-brand-50 transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-800">{f.title}</h3>
                    {f.badge && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                        {f.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free CTA */}
      <section className="px-4 mb-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-10 text-center text-white">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-3">
              ทุกฟีเจอร์ ใช้ฟรีทั้งหมด
            </h2>
            <p className="text-brand-100 mb-6 text-sm leading-relaxed">
              ไม่มีแผนชำระเงิน ไม่มีค่าสมาชิก ไม่มีฟีเจอร์ล็อค
              <br />ใช้ได้เต็มที่ ไม่มีวันหมดอายุ
            </p>
            <Link
              href="/liff"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-2xl hover:bg-brand-50 transition-colors"
            >
              เริ่มใช้งานเลย →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
