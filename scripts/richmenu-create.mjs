/**
 * Creates and sets เงินจด Rich Menu via LINE Messaging API
 * Run: CHANNEL_ACCESS_TOKEN=xxx node scripts/richmenu-create.mjs
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TOKEN = process.env.CHANNEL_ACCESS_TOKEN
if (!TOKEN) {
  console.error('❌  Missing CHANNEL_ACCESS_TOKEN env variable')
  console.error('    Usage: CHANNEL_ACCESS_TOKEN=xxx node scripts/richmenu-create.mjs')
  process.exit(1)
}

const LIFF_URL  = 'https://liff.line.me/2009845150-W1yZvDeK'
const HELP_MSG  = 'เงินจด ช่วยเหลือ'

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type':  'application/json',
}

// ── 1. Delete all existing rich menus ──────────────────────────────────────
console.log('1. Cleaning up old rich menus…')
const listRes = await fetch('https://api.line.me/v2/bot/richmenu/list', { headers })
const { richmenus = [] } = await listRes.json()
for (const rm of richmenus) {
  await fetch(`https://api.line.me/v2/bot/richmenu/${rm.richMenuId}`, {
    method: 'DELETE', headers,
  })
  console.log('   deleted:', rm.richMenuId)
}

// ── 2. Create rich menu structure ──────────────────────────────────────────
console.log('2. Creating rich menu…')

const W = 2500, H = 1686
const LEFT_W = 1500
const BTN_W = 500   // (W - LEFT_W) / 2
const BTN_H = 562   // H / 3

const richMenuBody = {
  size: { width: W, height: H },
  selected: true,
  name: 'เงินจด Main Menu',
  chatBarText: 'เมนู',
  areas: [
    // Left — open LIFF dashboard
    {
      bounds: { x: 0, y: 0, width: LEFT_W, height: H },
      action: { type: 'uri', uri: LIFF_URL, label: 'เปิดแอป' },
    },
    // สรุป
    {
      bounds: { x: LEFT_W, y: 0, width: BTN_W, height: BTN_H },
      action: { type: 'uri', uri: `${LIFF_URL}?page=dashboard`, label: 'สรุป' },
    },
    // วิเคราะห์
    {
      bounds: { x: LEFT_W + BTN_W, y: 0, width: BTN_W, height: BTN_H },
      action: { type: 'uri', uri: `${LIFF_URL}?page=reports`, label: 'วิเคราะห์' },
    },
    // หมวด/งบ
    {
      bounds: { x: LEFT_W, y: BTN_H, width: BTN_W, height: BTN_H },
      action: { type: 'uri', uri: `${LIFF_URL}?page=budgets`, label: 'หมวด/งบ' },
    },
    // รายการ
    {
      bounds: { x: LEFT_W + BTN_W, y: BTN_H, width: BTN_W, height: BTN_H },
      action: { type: 'uri', uri: `${LIFF_URL}?page=transactions`, label: 'รายการ' },
    },
    // ตั้งค่า
    {
      bounds: { x: LEFT_W, y: BTN_H * 2, width: BTN_W, height: BTN_H },
      action: { type: 'uri', uri: `${LIFF_URL}?page=settings`, label: 'ตั้งค่า' },
    },
    // Help
    {
      bounds: { x: LEFT_W + BTN_W, y: BTN_H * 2, width: BTN_W, height: BTN_H },
      action: { type: 'message', text: HELP_MSG, label: 'Help' },
    },
  ],
}

const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
  method: 'POST',
  headers,
  body: JSON.stringify(richMenuBody),
})
const { richMenuId, message } = await createRes.json()
if (!richMenuId) {
  console.error('❌  Create failed:', message)
  process.exit(1)
}
console.log('   richMenuId:', richMenuId)

// ── 3. Upload image ────────────────────────────────────────────────────────
console.log('3. Uploading image…')
const imgPath = path.join(__dirname, 'richmenu.jpg')
const imgBuf  = readFileSync(imgPath)

const uploadRes = await fetch(
  `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'image/jpeg' },
    body: imgBuf,
  }
)
if (!uploadRes.ok) {
  const err = await uploadRes.text()
  console.error('❌  Upload failed:', err)
  process.exit(1)
}
console.log('   image uploaded ✓')

// ── 4. Set as default rich menu ────────────────────────────────────────────
console.log('4. Setting as default…')
const defaultRes = await fetch(
  `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
  { method: 'POST', headers }
)
if (!defaultRes.ok) {
  const err = await defaultRes.text()
  console.error('❌  Set default failed:', err)
  process.exit(1)
}

console.log('\n✅  Rich menu live!')
console.log(`   ID    : ${richMenuId}`)
console.log(`   Image : ${imgPath}`)
console.log(`   LIFF  : ${LIFF_URL}`)
