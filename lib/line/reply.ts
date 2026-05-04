import type { TransactionType } from '@/types'

const LINE_API = 'https://api.line.me/v2/bot'

function authHeader() {
  return {
    'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function replyMessage(replyToken: string, messages: object[]) {
  const res = await fetch(`${LINE_API}/message/reply`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ replyToken, messages }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.log('[reply] LINE error', res.status, body)
  } else {
    console.log('[reply] sent ok', res.status)
  }
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
  date?: string  // YYYY-MM-DD
  lang?: string
  totalIncome?: number
  totalExpense?: number
}) {
  const isIncome  = opts.type === 'income'
  const isEn      = opts.lang === 'en'
  const accentClr = isIncome ? '#4a7c59' : '#d9526b'
  const headerBg  = isIncome ? '#edf7ed' : '#fdeef0'
  const iconBg    = isIncome ? '#c8e6ca' : '#f9c7cf'
  const label     = isIncome
    ? (isEn ? 'Income' : 'รายรับ')
    : (isEn ? 'Expense' : 'รายจ่าย')
  const sign      = isIncome ? '+' : '-'
  const amount    = opts.amount.toLocaleString('th-TH', { minimumFractionDigits: 0 })
  const dateLocale = isEn ? 'en-US' : 'th-TH'
  const dateStr   = opts.date
    ? new Date(opts.date + 'T12:00:00').toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' })

  const altText = isEn
    ? `Recorded ${label} ${sign}฿${amount}`
    : `บันทึก${label}แล้ว ${sign}฿${amount}`

  const headerText = isEn ? `Recorded ${label}` : `บันทึก${label}แล้ว`

  const labelCategory = isEn ? 'Category' : 'หมวดหมู่'
  const labelDescription = isEn ? 'Description' : 'รายการ'
  const labelDate = isEn ? 'Date' : 'วันที่'

  const cancelLabel = isEn ? 'Cancel' : 'ยกเลิก'
  const summaryLabel = isEn ? 'Summary' : 'ดูสรุป'
  const cancelDisplayText = isEn ? 'Cancel last item' : 'ยกเลิกรายการล่าสุด'
  const incomeTotalLabel = isEn ? 'Income' : 'รวมรับ'
  const expenseTotalLabel = isEn ? 'Expense' : 'รวมจ่าย'
  const totalIncome = (opts.totalIncome ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })
  const totalExpense = (opts.totalExpense ?? 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })

  // Font Awesome 6 icons served as PNG from own API route
  const fa = (name: string, color: string) =>
    `https://inc-penses.vercel.app/api/icon/${name}?c=${color.replace('#', '')}&s=64`

  // Icon circle with FA image
  const iconCircle = (iconUrl: string, bg: string, circleSize = '40px', imgSize = '20px'): object => ({
    type: 'box',
    layout: 'vertical',
    width: circleSize,
    height: circleSize,
    backgroundColor: bg,
    cornerRadius: '50px',
    justifyContent: 'center',
    alignItems: 'center',
    contents: [{
      type: 'image',
      url: iconUrl,
      size: imgSize,
      aspectMode: 'fit',
      aspectRatio: '1:1',
    }],
  })

  // Row: icon circle | label | value
  const row = (iconUrl: string, iconBg: string, labelText: string, value: string) => ({
    type: 'box' as const,
    layout: 'horizontal' as const,
    paddingTop: '5px',
    paddingBottom: '5px',
    alignItems: 'center' as const,
    contents: [
      iconCircle(iconUrl, iconBg, '30px', '15px'),
      { type: 'text' as const, text: labelText, size: 'xs' as const, color: '#888888', flex: 3, margin: 'md' as const },
      { type: 'text' as const, text: value, size: 'xs' as const, color: '#1a1a1a', align: 'end' as const, flex: 4, wrap: true },
    ],
  })

  // Action box (icon image + label text)
  const actionBox = (iconUrl: string, text: string, bg: string, action: object, flex = 1) => ({
    type: 'box' as const,
    layout: 'horizontal' as const,
    backgroundColor: bg,
    cornerRadius: '10px',
    paddingTop: '8px',
    paddingBottom: '8px',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    flex,
    action,
    contents: [
      { type: 'image' as const, url: iconUrl, size: '14px', aspectMode: 'fit' as const, aspectRatio: '1:1', flex: 0 },
      { type: 'text' as const, text, color: '#ffffff', size: 'xs' as const, margin: 'sm' as const, flex: 0 },
    ],
  })

  const headerRight: object = isIncome
    ? {
        type: 'box',
        layout: 'vertical',
        width: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        contents: [
          { type: 'text', text: '✦', size: 'xs', color: accentClr, align: 'center' },
          { type: 'text', text: '✦', size: 'xxs', color: accentClr, align: 'center' },
        ],
      }
    : iconCircle(fa('arrow-down', accentClr), iconBg, '34px', '15px')

  return {
    type: 'flex',
    altText,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'horizontal' as const,
        backgroundColor: headerBg,
        paddingAll: '10px',
        alignItems: 'center' as const,
        contents: [
          iconCircle(
            isIncome ? fa('arrow-up', accentClr) : fa('wallet', accentClr),
            iconBg, '42px', '20px'
          ),
          {
            type: 'box' as const,
            layout: 'vertical' as const,
            flex: 1,
            paddingStart: '12px',
            contents: [
              { type: 'text' as const, text: headerText, size: 'xs' as const, color: accentClr },
              {
                type: 'text' as const,
                text: `${sign}฿${amount}`,
                size: 'lg' as const,
                color: accentClr,
                adjustMode: 'shrink-to-fit' as const,
              },
            ],
          },
          headerRight,
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical' as const,
        backgroundColor: '#f5f5f5',
        paddingAll: '10px',
        paddingTop: '6px',
        spacing: 'none' as const,
        contents: [
          {
            type: 'box' as const,
            layout: 'vertical' as const,
            backgroundColor: '#ffffff',
            cornerRadius: '12px',
            paddingStart: '12px',
            paddingEnd: '12px',
            paddingTop: '3px',
            paddingBottom: '3px',
            contents: [
              row(isIncome ? fa('tag', '4a7c59') : fa('utensils', '4a7c59'), '#d5edd5', labelCategory, opts.category),
              { type: 'separator' as const, color: '#f0f0f0' },
              row(isIncome ? fa('wallet', '7b5ea7') : fa('basket-shopping', '7b5ea7'), '#e8e0f0', labelDescription, opts.note),
              { type: 'separator' as const, color: '#f0f0f0' },
              row(fa('calendar-days', '3a7bc8'), '#dce8f5', labelDate, dateStr),
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical' as const,
        spacing: 'xs' as const,
        backgroundColor: '#f5f5f5',
        paddingAll: '10px',
        paddingTop: '4px',
        contents: [
          {
            type: 'box' as const,
            layout: 'horizontal' as const,
            spacing: 'md' as const,
            contents: [
              actionBox(fa('trash-can', 'ffffff'), cancelLabel, '#e8837a', {
                type: 'postback',
                label: cancelLabel,
                data: `action=delete_tx&id=${opts.transactionId}`,
                displayText: cancelDisplayText,
              }, 1),
              actionBox(fa('circle-check', 'ffffff'), summaryLabel, '#6b8f5e', {
                type: 'uri',
                label: summaryLabel,
                uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`,
              }, 1),
            ],
          },
          {
            type: 'box' as const,
            layout: 'horizontal' as const,
            paddingTop: '3px',
            margin: 'xs' as const,
            alignItems: 'center' as const,
            contents: [
              {
                type: 'text' as const,
                text: `${incomeTotalLabel}: ${totalIncome}`,
                size: 'xxs' as const,
                color: '#4a7c59',
                flex: 1,
                align: 'start' as const,
              },
              {
                type: 'text' as const,
                text: `${expenseTotalLabel}: ${totalExpense}`,
                size: 'xxs' as const,
                color: '#d9526b',
                flex: 1,
                align: 'start' as const,
                margin: 'lg' as const,
              },
            ],
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
  lang?: string
}) {
  const isEn = opts.lang === 'en'
  const fmt = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 0 })
  const balColor = opts.balance >= 0 ? '#2d5c3e' : '#8b2020'
  const balBg    = opts.balance >= 0 ? '#ddebd5' : '#f5dada'
  const balSign  = opts.balance >= 0 ? '+' : ''

  const altText = isEn ? `Summary ${opts.month}` : `สรุปเดือน ${opts.month}`
  const headerLabel = isEn ? 'Monthly Summary' : 'สรุปรายเดือน'
  const incomeLabel = isEn ? 'Income' : 'รายรับ'
  const expenseLabel = isEn ? 'Expense' : 'รายจ่าย'
  const balanceLabel = isEn ? 'Net Balance' : 'คงเหลือสุทธิ'
  const topCatLabel = isEn ? 'Top Categories' : 'หมวดที่ใช้มากสุด'
  const fullReportLabel = isEn ? 'Full Report' : 'ดูรายงานเต็ม'

  return {
    type: 'flex',
    altText,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#e8dfc8',
        paddingAll: '20px',
        paddingBottom: '16px',
        contents: [
          { type: 'text', text: headerLabel, size: 'xs', color: '#8a7a60', weight: 'bold' as const },
          { type: 'text', text: opts.month, size: 'xl', weight: 'bold' as const, color: '#3d2e1e' },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#faf8f4',
        paddingAll: '20px',
        paddingTop: '16px',
        spacing: 'md',
        contents: [
          // Income / Expense cards
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
              {
                type: 'box', layout: 'vertical', flex: 1,
                backgroundColor: '#ddebd5',
                cornerRadius: '12px',
                paddingAll: '14px',
                contents: [
                  { type: 'text', text: incomeLabel, size: 'xs', color: '#4a7c59', weight: 'bold' as const },
                  { type: 'text', text: `฿${fmt(opts.totalIncome)}`, size: 'lg', weight: 'bold' as const, color: '#2d5c3e' },
                ],
              },
              {
                type: 'box', layout: 'vertical', flex: 1,
                backgroundColor: '#f5dada',
                cornerRadius: '12px',
                paddingAll: '14px',
                contents: [
                  { type: 'text', text: expenseLabel, size: 'xs', color: '#b94040', weight: 'bold' as const },
                  { type: 'text', text: `฿${fmt(opts.totalExpense)}`, size: 'lg', weight: 'bold' as const, color: '#8b2020' },
                ],
              },
            ],
          },
          // Balance
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: balBg,
            cornerRadius: '12px',
            paddingAll: '14px',
            contents: [
              { type: 'text', text: balanceLabel, size: 'sm', color: balColor, flex: 1 },
              { type: 'text', text: `${balSign}฿${fmt(opts.balance)}`, size: 'lg', weight: 'bold' as const, color: balColor, align: 'end' as const, flex: 2 },
            ],
          },
          // Top categories
          ...(opts.topCategories.length > 0 ? [
            {
              type: 'box' as const,
              layout: 'vertical' as const,
              backgroundColor: '#ffffff',
              cornerRadius: '12px',
              paddingAll: '4px',
              paddingStart: '16px',
              paddingEnd: '16px',
              contents: [
                { type: 'text' as const, text: topCatLabel, size: 'xs' as const, color: '#9a8a7a', weight: 'bold' as const, paddingTop: '10px', paddingBottom: '6px' },
                ...opts.topCategories.slice(0, 3).map((c, i) => ({
                  type: 'box' as const,
                  layout: 'horizontal' as const,
                  paddingTop: '6px',
                  paddingBottom: i < 2 ? '6px' : '10px',
                  borderWidth: i > 0 ? '1px' : '0px',
                  borderColor: '#f0ebe0',
                  contents: [
                    { type: 'text' as const, text: c.name, size: 'sm' as const, color: '#3d2e1e', flex: 3 },
                    { type: 'text' as const, text: `฿${fmt(c.amount)}`, size: 'sm' as const, color: '#8b2020', align: 'end' as const, flex: 2, weight: 'bold' as const },
                  ],
                })),
              ],
            },
          ] : []),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#faf8f4',
        paddingAll: '16px',
        paddingTop: '8px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: fullReportLabel,
              uri: `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}?page=reports`,
            },
            style: 'primary',
            color: '#6b8f5e',
          },
        ],
      },
    },
  }
}

// ── Text: Help message ────────────────────────────────────────────────────────
export function helpMessage(lang?: string) {
  if (lang === 'en') {
    return {
      type: 'text',
      text:
        '📝 How to use Record\n\n' +
        '💸 Record Expense\nType: [item] [amount]\nE.g.: lunch 80\nE.g.: grab 120\n\n' +
        '💚 Record Income\nType: salary 48000\nType: freelance 5000\n\n' +
        '📅 Specify Date\nAdd "date [N]" in message\nE.g.: lunch date 10 100\n\n' +
        '🖼 Read Slip\nSend a transfer slip image\n\n' +
        '📊 Summary\nType: summary\n\n' +
        '↩ Cancel Last\nType: delete\n\nOr tap the menu below 👇',
    }
  }
  return {
    type: 'text',
    text:
      '📝 วิธีใช้ จด\n\n' +
      '💸 บันทึกรายจ่าย\nพิมพ์: [รายการ] [จำนวน]\nเช่น: กินข้าว 80\nเช่น: grab 120\n\n' +
      '💚 บันทึกรายรับ\nพิมพ์: เงินเดือน 48000\nพิมพ์: freelance 5000\n\n' +
      '📅 ระบุวันที่\nเพิ่ม "วันที่ [เลข]" ในประโยค\nเช่น: กินข้าวเที่ยง วันที่ 10 100\nเช่น: grab วันที่ 5 120\nเช่น: เงินเดือน วันที่ 25 48000\n\n' +
      '🖼 อ่าน slip อัตโนมัติ\nส่งรูป slip โอนเงิน → บันทึกให้เลย\n\n' +
      '📊 ดูสรุป\nพิมพ์: สรุป\n\n' +
      '↩ ยกเลิกล่าสุด\nพิมพ์: ลบ\n\n' +
      'หรือกดปุ่มเมนูด้านล่าง 👇',
  }
}

export function unknownMessage(lang?: string) {
  if (lang === 'en') {
    return {
      type: 'text',
      text: "I didn't understand that 😅\n\nTry typing:\n• lunch 80\n• grab 120\n• summary\n\nOr type \"help\" to see how to use",
    }
  }
  return {
    type: 'text',
    text: 'ไม่เข้าใจคำสั่ง 😅\n\nลองพิมพ์แบบนี้:\n• กินข้าว 80\n• grab 120\n• สรุป\n\nหรือพิมพ์ "ช่วยเหลือ" เพื่อดูวิธีใช้',
  }
}
