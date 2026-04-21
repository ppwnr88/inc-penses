import type { TransactionType } from '@/types'

const LINE_API = 'https://api.line.me/v2/bot'

function authHeader() {
  return {
    'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function replyMessage(replyToken: string, messages: object[]) {
  await fetch(`${LINE_API}/message/reply`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ replyToken, messages }),
  })
}

export async function pushMessage(userId: string, messages: object[]) {
  await fetch(`${LINE_API}/message/push`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ to: userId, messages }),
  })
}

// ── Flex: Transaction confirmed ───────────────────────────────────────────────
export function transactionConfirmedFlex(opts: {
  type: TransactionType
  amount: number
  note: string
  category: string
  transactionId: string
}) {
  const isIncome = opts.type === 'income'
  const color   = isIncome ? '#4a7c59' : '#c0392b'
  const bgColor = isIncome ? '#e8f5e9' : '#fdecea'
  const emoji   = isIncome ? '💚' : '🧾'
  const label   = isIncome ? 'รายรับ' : 'รายจ่าย'
  const sign    = isIncome ? '+' : '-'
  const amount  = opts.amount.toLocaleString('th-TH', { minimumFractionDigits: 0 })

  return {
    type: 'flex',
    altText: `${emoji} บันทึกแล้ว! ${sign}฿${amount}`,
    contents: {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'horizontal',
        backgroundColor: color,
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: `${emoji}  บันทึก${label}แล้ว`,
            color: '#ffffff',
            weight: 'bold',
            size: 'md',
            flex: 1,
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: bgColor,
        paddingAll: '20px',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'จำนวน', size: 'sm', color: '#888888', flex: 2 },
              {
                type: 'text',
                text: `${sign}฿${amount}`,
                size: 'xl',
                weight: 'bold',
                color,
                flex: 3,
                align: 'end',
              },
            ],
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: 'หมวด', size: 'sm', color: '#888888', flex: 2 },
              { type: 'text', text: opts.category, size: 'sm', weight: 'bold', color: '#333333', flex: 3, align: 'end' },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'บันทึก', size: 'sm', color: '#888888', flex: 2 },
              { type: 'text', text: opts.note, size: 'sm', color: '#333333', flex: 3, align: 'end', wrap: true },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'วันที่', size: 'sm', color: '#888888', flex: 2 },
              {
                type: 'text',
                text: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
                size: 'sm',
                color: '#333333',
                flex: 3,
                align: 'end',
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '↩ ยกเลิก',
              data: `action=delete_tx&id=${opts.transactionId}`,
              displayText: 'ยกเลิกรายการล่าสุด',
            },
            style: 'secondary',
            height: 'sm',
            flex: 1,
          },
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '📊 ดูสรุป',
              uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`,
            },
            style: 'primary',
            color,
            height: 'sm',
            flex: 1,
          },
        ],
      },
    },
  }
}

// ── Flex: Monthly summary ─────────────────────────────────────────────────────
export function summaryFlex(opts: {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  topCategories: { name: string; amount: number }[]
}) {
  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 0 })
  const balColor = opts.balance >= 0 ? '#4a7c59' : '#c0392b'
  const balSign  = opts.balance >= 0 ? '+' : ''

  return {
    type: 'flex',
    altText: `📊 สรุปเดือน ${opts.month}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#4a5e3a',
        paddingAll: '20px',
        contents: [
          { type: 'text', text: '📊 สรุปเดือน', color: '#c5d9b0', size: 'sm' },
          { type: 'text', text: opts.month, color: '#ffffff', size: 'xl', weight: 'bold' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        spacing: 'md',
        contents: [
          // Income / Expense row
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'box', layout: 'vertical', flex: 1,
                contents: [
                  { type: 'text', text: '💚 รายรับ', size: 'xs', color: '#888888' },
                  { type: 'text', text: `฿${fmt(opts.totalIncome)}`, size: 'lg', weight: 'bold', color: '#4a7c59' },
                ],
              },
              {
                type: 'box', layout: 'vertical', flex: 1,
                contents: [
                  { type: 'text', text: '🧾 รายจ่าย', size: 'xs', color: '#888888' },
                  { type: 'text', text: `฿${fmt(opts.totalExpense)}`, size: 'lg', weight: 'bold', color: '#c0392b' },
                ],
              },
            ],
          },
          { type: 'separator' },
          // Balance
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'คงเหลือ', size: 'sm', color: '#555555', flex: 1 },
              { type: 'text', text: `${balSign}฿${fmt(opts.balance)}`, size: 'lg', weight: 'bold', color: balColor, align: 'end', flex: 2 },
            ],
          },
          // Top categories
          ...(opts.topCategories.length > 0 ? [
            { type: 'separator' as const },
            { type: 'text' as const, text: 'หมวดที่ใช้มากสุด', size: 'xs' as const, color: '#888888', margin: 'md' as const },
            ...opts.topCategories.slice(0, 3).map(c => ({
              type: 'box' as const,
              layout: 'horizontal' as const,
              contents: [
                { type: 'text' as const, text: c.name, size: 'sm' as const, color: '#333333', flex: 2 },
                { type: 'text' as const, text: `฿${fmt(c.amount)}`, size: 'sm' as const, color: '#c0392b', align: 'end' as const, flex: 1 },
              ],
            })),
          ] : []),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: '📈 ดูรายงานเต็ม',
              uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?page=reports`,
            },
            style: 'primary',
            color: '#84a06e',
          },
        ],
      },
    },
  }
}

// ── Text: Help message ────────────────────────────────────────────────────────
export function helpMessage() {
  return {
    type: 'text',
    text:
      '📝 วิธีใช้ เงินจด\n\n' +
      '💸 บันทึกรายจ่าย\nพิมพ์: [รายการ] [จำนวน]\nเช่น: กินข้าว 80\nเช่น: grab 120\n\n' +
      '💚 บันทึกรายรับ\nพิมพ์: เงินเดือน 48000\nพิมพ์: freelance 5000\n\n' +
      '📊 ดูสรุป\nพิมพ์: สรุป\n\n' +
      '↩ ยกเลิกล่าสุด\nพิมพ์: ลบ\n\n' +
      'หรือกดปุ่มเมนูด้านล่าง 👇',
  }
}

export function unknownMessage() {
  return {
    type: 'text',
    text: 'ไม่เข้าใจคำสั่ง 😅\n\nลองพิมพ์แบบนี้:\n• กินข้าว 80\n• grab 120\n• สรุป\n\nหรือพิมพ์ "ช่วยเหลือ" เพื่อดูวิธีใช้',
  }
}
