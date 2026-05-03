import { NextRequest, NextResponse } from 'next/server'
import type { Lang } from '@/lib/i18n/translations'

const LINE_API = 'https://api.line.me/v2/bot'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { line_user_id, lang } = await req.json() as { line_user_id: string; lang: Lang }

  if (!line_user_id || !lang) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 })
  }

  const menuId = lang === 'en'
    ? process.env.LINE_RICH_MENU_EN
    : process.env.LINE_RICH_MENU_TH

  if (!menuId) {
    // Env vars not set yet — silently skip, not an error for the user
    return NextResponse.json({ ok: true, skipped: true })
  }

  const res = await fetch(`${LINE_API}/user/${line_user_id}/richmenu/${menuId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[richmenu/switch] LINE error', res.status, body)
    return NextResponse.json({ error: 'LINE API error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
