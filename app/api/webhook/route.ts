import { NextRequest, NextResponse } from 'next/server'
import { verifyLineSignature } from '@/lib/line/verify'
import { parseMessage } from '@/lib/nlp/parser'
import { suggestCategory } from '@/lib/nlp/categorize'
import {
  replyMessage,
  transactionConfirmedFlex,
  summaryFlex,
  helpMessage,
  unknownMessage,
} from '@/lib/line/reply'
import { createServerClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES } from '@/lib/utils/categories'

export const runtime = 'nodejs'

// LINE event types (minimal)
interface LineTextEvent {
  type: 'message'
  replyToken: string
  source: { userId: string }
  message: { type: 'text'; text: string }
}
interface LinePostbackEvent {
  type: 'postback'
  replyToken: string
  source: { userId: string }
  postback: { data: string }
}
interface LineFollowEvent {
  type: 'follow'
  replyToken: string
  source: { userId: string }
}
type LineEvent = LineTextEvent | LinePostbackEvent | LineFollowEvent | { type: string }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-line-signature') ?? ''

  if (!verifyLineSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as { events: LineEvent[] }
  await Promise.all(body.events.map(handleEvent))

  return NextResponse.json({ ok: true })
}

async function handleEvent(event: LineEvent) {
  if (event.type === 'follow') {
    await replyMessage((event as LineFollowEvent).replyToken, [
      {
        type: 'text',
        text: '👋 สวัสดี! ยินดีต้อนรับสู่ เงินจด\n\nผู้ช่วยจดรายรับรายจ่ายผ่าน LINE 📝\n\nลองพิมพ์ "กินข้าว 80" เพื่อเริ่มบันทึกได้เลย\nหรือพิมพ์ "ช่วยเหลือ" เพื่อดูวิธีใช้',
      },
    ])
    return
  }

  if (event.type === 'postback') {
    await handlePostback(event as LinePostbackEvent)
    return
  }

  if (event.type !== 'message') return
  const e = event as LineTextEvent
  if (e.message.type !== 'text') return

  await handleTextMessage(e)
}

async function handleTextMessage(event: LineTextEvent) {
  const { replyToken, source, message } = event
  const userId = source.userId
  const text = message.text.trim()

  const parsed = parseMessage(text)

  if (parsed.isCommand) {
    if (parsed.command === 'summary') {
      await sendSummary(userId, replyToken)
    } else if (parsed.command === 'help') {
      await replyMessage(replyToken, [helpMessage()])
    } else if (parsed.command === 'delete') {
      await deleteLastTransaction(userId, replyToken)
    } else {
      await replyMessage(replyToken, [unknownMessage()])
    }
    return
  }

  // Record transaction
  const supabase = createServerClient()
  const profile = await getOrCreateProfile(supabase, userId)
  if (!profile) {
    await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่นะ 🙏' }])
    return
  }

  // Find matching category
  const categoryName = suggestCategory(parsed.note, parsed.type)
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('profile_id', profile.id)
    .eq('name', categoryName)
    .single()

  // Insert transaction
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert({
      profile_id: profile.id,
      category_id: category?.id ?? null,
      type: parsed.type,
      amount: parsed.amount,
      note: parsed.note,
      date: new Date().toISOString().split('T')[0],
      input_method: 'manual',
    })
    .select('id')
    .single()

  if (error || !tx) {
    await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ 🙏' }])
    return
  }

  await replyMessage(replyToken, [
    transactionConfirmedFlex({
      type: parsed.type,
      amount: parsed.amount,
      note: parsed.note,
      category: category?.name ?? categoryName,
      transactionId: tx.id,
    }),
  ])
}

async function handlePostback(event: LinePostbackEvent) {
  const params = new URLSearchParams(event.postback.data)
  const action = params.get('action')

  if (action === 'delete_tx') {
    const txId = params.get('id')
    if (!txId) return

    const supabase = createServerClient()
    const profile = await getOrCreateProfile(supabase, event.source.userId)
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txId)
      .eq('profile_id', profile?.id ?? '')

    await replyMessage(event.replyToken, [{
      type: 'text',
      text: error ? 'ลบไม่สำเร็จ 😅' : '↩ ลบรายการแล้ว',
    }])
  }
}

// ── Auto-create profile from LINE userId ─────────────────────────────────────
async function fetchLineDisplayName(userId: string): Promise<string> {
  try {
    const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    })
    if (res.ok) {
      const data = await res.json() as { displayName?: string }
      return data.displayName ?? 'คุณ'
    }
  } catch { /* ignore */ }
  return 'คุณ'
}

async function getOrCreateProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<{ id: string } | null> {
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('line_user_id', userId).single()
  if (existing) return existing

  // New user — fetch display name from LINE then create profile + seed categories
  const displayName = await fetchLineDisplayName(userId)
  const { data: created } = await supabase
    .from('profiles')
    .insert({ line_user_id: userId, display_name: displayName })
    .select('id')
    .single()
  if (!created) return null

  await supabase.from('categories').insert(
    DEFAULT_CATEGORIES.map(c => ({ ...c, profile_id: created.id }))
  )
  return created
}

async function deleteLastTransaction(userId: string, replyToken: string) {
  const supabase = createServerClient()
  const profile = await getOrCreateProfile(supabase, userId)

  if (!profile) return

  const { data: last } = await supabase
    .from('transactions')
    .select('id, amount, note, type')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!last) {
    await replyMessage(replyToken, [{ type: 'text', text: 'ไม่มีรายการที่จะลบ' }])
    return
  }

  await supabase.from('transactions').delete().eq('id', last.id)
  const sign = last.type === 'income' ? '+' : '-'
  await replyMessage(replyToken, [{
    type: 'text',
    text: `↩ ลบแล้ว: ${last.note} (${sign}฿${Number(last.amount).toLocaleString('th-TH')})`,
  }])
}

async function sendSummary(userId: string, replyToken: string) {
  const supabase = createServerClient()
  const profile = await getOrCreateProfile(supabase, userId)
  if (!profile) {
    await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่นะ 🙏' }])
    return
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`

  // Totals
  const { data: txs } = await supabase
    .from('transactions')
    .select('type, amount, category_id, categories(name)')
    .eq('profile_id', profile.id)
    .gte('date', startDate)

  const totalIncome  = txs?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) ?? 0
  const totalExpense = txs?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) ?? 0

  // Top categories by expense
  const catMap: Record<string, number> = {}
  txs?.filter(t => t.type === 'expense').forEach(t => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const name = (t.categories as any)?.name ?? 'อื่นๆ'
    catMap[name] = (catMap[name] ?? 0) + Number(t.amount)
  })
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amount]) => ({ name, amount }))

  const monthName = now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })

  await replyMessage(replyToken, [
    summaryFlex({
      month: monthName,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topCategories,
    }),
  ])
}
