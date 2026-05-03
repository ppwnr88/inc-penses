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
import { createAdminClient } from '@/lib/supabase/server'
import { DEFAULT_CATEGORIES } from '@/lib/utils/categories'
import { readSlipWithGemini, downloadLineImage } from '@/lib/ai/gemini'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  return NextResponse.json({ ok: true, service: 'จด webhook', ts: new Date().toISOString() })
}

// LINE event types (minimal)
interface LineTextEvent {
  type: 'message'
  replyToken: string
  source: { userId: string }
  message: { type: 'text'; text: string }
}
interface LineImageEvent {
  type: 'message'
  replyToken: string
  source: { userId: string }
  message: { type: 'image'; id: string }
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

  console.log('[webhook] POST received, sig:', signature.slice(0, 10) + '...')

  if (!verifyLineSignature(rawBody, signature)) {
    console.log('[webhook] Invalid signature — secret length:', process.env.LINE_CHANNEL_SECRET?.trim().length)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as { events: LineEvent[] }
  console.log('[webhook] raw body (200c):', rawBody.slice(0, 200))
  console.log('[webhook] events count:', body.events.length)

  if (body.events.length === 0) {
    console.log('[webhook] empty events — LINE verification ping')
    return NextResponse.json({ ok: true })
  }

  await Promise.all(body.events.map(handleEvent))

  return NextResponse.json({ ok: true })
}

async function handleEvent(event: LineEvent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ev = event as any
  console.log('[event] type:', ev.type, 'msgType:', ev.message?.type, 'msgId:', ev.message?.id)

  if (event.type === 'follow') {
    await replyMessage((event as LineFollowEvent).replyToken, [
      {
        type: 'text',
        text: '👋 สวัสดี! ยินดีต้อนรับสู่ จด\n\nผู้ช่วยจดรายรับรายจ่ายผ่าน LINE 📝\n\nลองพิมพ์ "กินข้าว 80" เพื่อเริ่มบันทึกได้เลย\nหรือพิมพ์ "ช่วยเหลือ" เพื่อดูวิธีใช้',
      },
    ])
    return
  }

  if (event.type === 'postback') {
    await handlePostback(event as LinePostbackEvent)
    return
  }

  if (event.type !== 'message') return
  const e = event as LineTextEvent | LineImageEvent
  console.log('[event] message type:', e.message?.type)
  if (e.message.type === 'image') {
    console.log('[event] routing to handleImageMessage')
    await handleImageMessage(e as LineImageEvent)
    return
  }
  if (e.message.type !== 'text') return

  await handleTextMessage(e as LineTextEvent)
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
      const supabase = createAdminClient()
      const profile = await getOrCreateProfile(supabase, userId)
      const lang = profile?.lang ?? 'th'
      await replyMessage(replyToken, [helpMessage(lang)])
    } else if (parsed.command === 'delete') {
      await deleteLastTransaction(userId, replyToken)
    } else {
      const supabase = createAdminClient()
      const profile = await getOrCreateProfile(supabase, userId)
      const lang = profile?.lang ?? 'th'
      await replyMessage(replyToken, [unknownMessage(lang)])
    }
    return
  }

  // Record transaction
  console.log('[tx] parsed:', parsed.type, parsed.amount, parsed.note)
  const supabase = createAdminClient()
  const profile = await getOrCreateProfile(supabase, userId)
  if (!profile) {
    console.log('[tx] profile not found/created')
    await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่นะ 🙏' }])
    return
  }
  console.log('[tx] profile:', profile.id)

  const lang = profile.lang ?? 'th'

  // Find matching category
  const categoryName = suggestCategory(parsed.note, parsed.type)
  const { data: category } = await supabase
    .from('categories')
    .select('id, name')
    .eq('profile_id', profile.id)
    .eq('name', categoryName)
    .single()
  console.log('[tx] category:', category?.name ?? 'none')

  // Insert transaction
  const { data: tx, error } = await supabase
    .from('transactions')
    .insert({
      profile_id: profile.id,
      category_id: category?.id ?? null,
      type: parsed.type,
      amount: parsed.amount,
      note: parsed.note,
      date: parsed.date ?? new Date().toISOString().split('T')[0],
      input_method: 'manual',
    })
    .select('id')
    .single()

  if (error || !tx) {
    console.log('[tx] insert error:', error?.message)
    await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ 🙏' }])
    return
  }
  console.log('[tx] inserted:', tx.id)

  await replyMessage(replyToken, [
    transactionConfirmedFlex({
      type: parsed.type,
      amount: parsed.amount,
      note: parsed.note,
      category: category?.name ?? categoryName,
      transactionId: tx.id,
      date: parsed.date ?? new Date().toISOString().split('T')[0],
      lang,
    }),
  ])
  console.log('[tx] reply sent')
}

async function handleImageMessage(event: LineImageEvent) {
  const { replyToken, source, message } = event
  const userId = source.userId

  try {
    const { buffer: imageBuffer, mimeType } = await downloadLineImage(message.id)
    const slip = await readSlipWithGemini(imageBuffer, mimeType)

    if (!slip) {
      await replyMessage(replyToken, [{
        type: 'text',
        text: 'อ่าน slip ไม่ได้ 😅\nลองส่งรูปที่ชัดขึ้น หรือพิมพ์ยอดเองก็ได้นะ\nเช่น: กินข้าว 80',
      }])
      return
    }

    console.log('[slip] amount:', slip.amount, 'note:', slip.note)
    const supabase = createAdminClient()
    const profile = await getOrCreateProfile(supabase, userId)
    if (!profile) return

    const lang = profile.lang ?? 'th'

    const categoryName = suggestCategory(slip.note, 'expense')
    const { data: category } = await supabase
      .from('categories').select('id, name')
      .eq('profile_id', profile.id).eq('name', categoryName).single()

    const today = new Date().toISOString().split('T')[0]
    const { data: tx, error } = await supabase
      .from('transactions')
      .insert({
        profile_id: profile.id,
        category_id: category?.id ?? null,
        type: 'expense',
        amount: slip.amount,
        note: slip.note,
        date: slip.date ?? today,
        input_method: 'manual',
      })
      .select('id').single()

    if (error || !tx) {
      console.log('[slip] insert error:', error?.message)
      await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่นะ 🙏' }])
      return
    }

    await replyMessage(replyToken, [
      transactionConfirmedFlex({
        type: 'expense',
        amount: slip.amount,
        note: slip.note,
        category: category?.name ?? categoryName,
        transactionId: tx.id,
        date: slip.date ?? today,
        lang,
      }),
    ])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const isOverloaded = msg.includes('503') || msg.includes('UNAVAILABLE')
    await replyMessage(replyToken, [{
      type: 'text',
      text: isOverloaded
        ? 'ระบบ AI ยุ่งอยู่ ลองส่ง slip ใหม่อีกครั้งสักครู่นะ ⏳\nหรือพิมพ์ยอดเองก็ได้ เช่น: ค่าน้ำ 700'
        : 'อ่าน slip ไม่สำเร็จ ลองส่งใหม่อีกครั้งนะ 🙏',
    }])
  }
}

async function handlePostback(event: LinePostbackEvent) {
  const params = new URLSearchParams(event.postback.data)
  const action = params.get('action')

  if (action === 'delete_tx') {
    const txId = params.get('id')
    if (!txId) return

    const supabase = createAdminClient()
    const profile = await getOrCreateProfile(supabase, event.source.userId)
    const lang = profile?.lang ?? 'th'
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', txId)
      .eq('profile_id', profile?.id ?? '')

    await replyMessage(event.replyToken, [{
      type: 'text',
      text: error
        ? (lang === 'en' ? 'Delete failed 😅' : 'ลบไม่สำเร็จ 😅')
        : (lang === 'en' ? '↩ Transaction deleted' : '↩ ลบรายการแล้ว'),
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
): Promise<{ id: string; lang?: string } | null> {
  const { data: existing } = await supabase
    .from('profiles').select('id, lang').eq('line_user_id', userId).single()
  if (existing) return existing

  // New user — fetch display name from LINE then create profile + seed categories
  const displayName = await fetchLineDisplayName(userId)
  const { data: created } = await supabase
    .from('profiles')
    .insert({ line_user_id: userId, display_name: displayName })
    .select('id, lang')
    .single()
  if (!created) return null

  await supabase.from('categories').insert(
    DEFAULT_CATEGORIES.map(c => ({ ...c, profile_id: created.id }))
  )
  return created
}

async function deleteLastTransaction(userId: string, replyToken: string) {
  const supabase = createAdminClient()
  const profile = await getOrCreateProfile(supabase, userId)

  if (!profile) return

  const lang = profile.lang ?? 'th'

  const { data: last } = await supabase
    .from('transactions')
    .select('id, amount, note, type')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!last) {
    await replyMessage(replyToken, [{
      type: 'text',
      text: lang === 'en' ? 'No transactions to delete' : 'ไม่มีรายการที่จะลบ',
    }])
    return
  }

  await supabase.from('transactions').delete().eq('id', last.id)
  const sign = last.type === 'income' ? '+' : '-'
  await replyMessage(replyToken, [{
    type: 'text',
    text: lang === 'en'
      ? `↩ Deleted: ${last.note} (${sign}฿${Number(last.amount).toLocaleString('th-TH')})`
      : `↩ ลบแล้ว: ${last.note} (${sign}฿${Number(last.amount).toLocaleString('th-TH')})`,
  }])
}

async function sendSummary(userId: string, replyToken: string) {
  const supabase = createAdminClient()
  const profile = await getOrCreateProfile(supabase, userId)
  if (!profile) {
    await replyMessage(replyToken, [{ type: 'text', text: 'เกิดข้อผิดพลาด ลองใหม่นะ 🙏' }])
    return
  }

  const lang = profile.lang ?? 'th'

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
    const name = (t.categories as any)?.name ?? (lang === 'en' ? 'Other' : 'อื่นๆ')
    catMap[name] = (catMap[name] ?? 0) + Number(t.amount)
  })
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amount]) => ({ name, amount }))

  const monthLocale = lang === 'en' ? 'en-US' : 'th-TH'
  const monthName = now.toLocaleDateString(monthLocale, { month: 'long', year: 'numeric' })

  await replyMessage(replyToken, [
    summaryFlex({
      month: monthName,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      topCategories,
      lang,
    }),
  ])
}
