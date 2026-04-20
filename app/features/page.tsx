import React from 'react'
import Link from 'next/link'
import { LandingNav } from '@/components/layout/LandingNav'
import { Footer } from '@/components/layout/Footer'

const features = [
  {
    icon: '⌨️',
    title: 'บันทึกจากข้อความ',
    description:
      'พิมพ์รายการรายรับรายจ่ายได้ทันที กรอกง่าย บันทึกเร็ว เลือกหมวดหมู่และวันที่ได้ตามต้องการ',
    badge: null,
    color: 'bg-blue-50',
  },
  {
    icon: '📷',
    title: 'สแกนใบเสร็จ',
    description:
      'ถ่ายรูปใบเสร็จหรืออัพโหลดภาพ ระบบจะอ่านข้อมูลและจดให้อัตโนมัติ ประหยัดเวลา',
    badge: 'Coming Soon',
    color: 'bg-purple-50',
  },
  {
    icon: '🎙️',
    title: 'บันทึกด้วยเสียง',
    description:
      'พูดรายการค่าใช้จ่ายได้เลย ระบบจะแปลงเสียงเป็นข้อความและจดให้อัตโนมัติ',
    badge: 'Coming Soon',
    color: 'bg-pink-50',
  },
  {
    icon: '🏷️',
    title: 'หมวดหมู่อัจฉริยะ',
    description:
      'ระบบเรียนรู้พฤติกรรมการใช้จ่ายของคุณ และแนะนำหมวดหมู่ที่เหมาะสมโดยอัตโนมัติ',
    badge: null,
    color: 'bg-yellow-50',
  },
  {
    icon: '🎯',
    title: 'ตั้งงบประมาณ',
    description:
      'กำหนดงบประมาณต่อหมวดหมู่ในแต่ละเดือน ติดตามการใช้จ่ายแบบ real-time พร้อม progress bar',
    badge: null,
    color: 'bg-green-50',
  },
  {
    icon: '📊',
    title: 'รายงานรายเดือน',
    description:
      'สรุปรายรับรายจ่ายอัตโนมัติทุกสิ้นเดือน ดูแนวโน้ม เปรียบเทียบ และวิเคราะห์พฤติกรรม',
    badge: null,
    color: 'bg-orange-50',
  },
  {
    icon: '🔄',
    title: 'รายการประจำ',
    description:
      'ตั้งรายรับหรือรายจ่ายที่เกิดซ้ำ เช่น ค่าเช่า เงินเดือน ค่าน้ำค่าไฟ ระบบจะจดให้อัตโนมัติ',
    badge: null,
    color: 'bg-teal-50',
  },
  {
    icon: '📈',
    title: 'กราฟวิเคราะห์',
    description:
      'ดูกราฟวงกลมแยกตามหมวดหมู่ กราฟแท่งรายสัปดาห์ เข้าใจพฤติกรรมการใช้เงินได้ชัดเจน',
    badge: null,
    color: 'bg-indigo-50',
  },
  {
    icon: '📥',
    title: 'Export ข้อมูล',
    description:
      'ดาวน์โหลดรายการทั้งหมดเป็นไฟล์ CSV หรือ Excel พร้อมสรุปรายรับรายจ่าย',
    badge: null,
    color: 'bg-rose-50',
  },
  {
    icon: '🔔',
    title: 'แจ้งเตือนรายวัน',
    description:
      'ตั้งเวลาแจ้งเตือนผ่าน LINE ให้จดรายจ่ายทุกวัน ไม่หลงลืม ปรับเวลาได้ตามต้องการ',
    badge: null,
    color: 'bg-amber-50',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-cream-50">
      <LandingNav />

      <section className="pt-28 pb-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ทุกสิ่งที่ต้องการ
            <br />
            <span className="text-brand-600">รวมอยู่ในที่เดียว</span>
          </h1>
          <p className="text-gray-500 text-lg">
            ทุกฟีเจอร์ใช้ฟรี ไม่มีค่าใช้จ่ายซ่อนเร้น ไม่มีแผนพรีเมียม
          </p>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className={`${f.color} rounded-3xl p-6 flex flex-col gap-3 hover:shadow-card-md transition-shadow`}
            >
              <div className="text-4xl">{f.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-gray-800">{f.title}</h3>
                  {f.badge && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                      {f.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Big CTA */}
      <section className="px-4 mb-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-brand-500 text-white rounded-3xl p-10">
            <h2 className="text-2xl font-bold mb-3">พร้อมเริ่มจดแล้วหรือยัง?</h2>
            <p className="text-brand-100 mb-6 text-sm">
              เปิดใน LINE ได้ทันที ไม่ต้องดาวน์โหลดแอปเพิ่ม
            </p>
            <Link
              href="/liff"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3 rounded-2xl hover:bg-brand-50 transition-colors"
            >
              เริ่มใช้งานฟรี →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
