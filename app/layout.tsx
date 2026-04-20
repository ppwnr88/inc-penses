import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'เงินจด — ผู้ช่วยจดรายรับรายจ่ายส่วนตัว',
  description: 'ผู้ช่วยจดรายรับรายจ่ายส่วนตัว ผ่าน LINE — ง่าย เร็ว ไม่ยุ่งยาก',
  keywords: ['บัญชีรายรับรายจ่าย', 'LINE LIFF', 'เงินจด', 'จดรายรับ', 'จดรายจ่าย'],
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#84a06e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
