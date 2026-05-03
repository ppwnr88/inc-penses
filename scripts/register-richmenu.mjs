/**
 * Register Thai + English rich menus with LINE API.
 * Run: node scripts/register-richmenu.mjs
 *
 * Reads LINE_CHANNEL_ACCESS_TOKEN and NEXT_PUBLIC_LIFF_ID from .env.local
 * Outputs menu IDs to be set as LINE_RICH_MENU_TH and LINE_RICH_MENU_EN env vars.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = path.join(__dirname, '../.env.local')
const envVars = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const TOKEN   = envVars['LINE_CHANNEL_ACCESS_TOKEN']
const LIFF_ID = envVars['NEXT_PUBLIC_LIFF_ID']

if (!TOKEN)   { console.error('Missing LINE_CHANNEL_ACCESS_TOKEN'); process.exit(1) }
if (!LIFF_ID) { console.error('Missing NEXT_PUBLIC_LIFF_ID'); process.exit(1) }

const LINE_API = 'https://api.line.me/v2/bot'
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

const liff = (path = '') => `https://liff.line.me/${LIFF_ID}${path}`

// ── Rich menu layout ──────────────────────────────────────────────────────────
// Total: 2500×1686, left panel 960px, right 2×3 grid (BW=770, BH=562)
const LEFT_W = 960
const BW = 770, BH = 562

function menuAreas(labels, menuLang = 'th') {
  // labels: [summary, analyze, categories, transactions, settings, help]
  const helpText = menuLang === 'en' ? 'help' : 'ช่วยเหลือ'
  const actions = [
    { type: 'uri', uri: liff(''),              label: labels[0] },
    { type: 'uri', uri: liff('/reports'),      label: labels[1] },
    { type: 'uri', uri: liff('/categories'),   label: labels[2] },
    { type: 'uri', uri: liff('/transactions'), label: labels[3] },
    { type: 'uri', uri: liff('/settings'),     label: labels[4] },
    { type: 'message', text: helpText,         label: labels[5] },
  ]
  const areas = []
  // Left panel → open LIFF home
  areas.push({
    bounds: { x: 0, y: 0, width: LEFT_W, height: 1686 },
    action: { type: 'uri', uri: liff(''), label: 'Open app' },
  })
  // 2×3 button grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const idx = row * 2 + col
      areas.push({
        bounds: {
          x: LEFT_W + col * BW,
          y: row * BH,
          width: BW,
          height: BH,
        },
        action: actions[idx],
      })
    }
  }
  return areas
}

function richMenuDef(name, chatBarText, labels, menuLang = 'th') {
  return {
    size: { width: 2500, height: 1686 },
    selected: true,
    name,
    chatBarText,
    areas: menuAreas(labels, menuLang),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
async function createMenu(def) {
  const res = await fetch(`${LINE_API}/richmenu`, {
    method: 'POST', headers,
    body: JSON.stringify(def),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`createMenu ${res.status}: ${t}`)
  }
  const { richMenuId } = await res.json()
  return richMenuId
}

async function uploadImage(richMenuId, filePath) {
  const img = readFileSync(filePath)
  const res = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'image/jpeg',
    },
    body: img,
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`uploadImage ${res.status}: ${t}`)
  }
}

async function setDefaultMenu(richMenuId) {
  const res = await fetch(`${LINE_API}/user/all/richmenu/${richMenuId}`, {
    method: 'POST', headers,
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`setDefault ${res.status}: ${t}`)
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('Creating Thai rich menu...')
const thDef = richMenuDef('จด-TH', 'เมนู จด', ['สรุป', 'วิเคราะห์', 'หมวดหมู่', 'รายการ', 'ตั้งค่า', 'ช่วยเหลือ'], 'th')
const thId = await createMenu(thDef)
console.log('  Created:', thId)
await uploadImage(thId, path.join(__dirname, 'richmenu.jpg'))
console.log('  Image uploaded')

console.log('Creating English rich menu...')
const enDef = richMenuDef('จด-EN', 'Record Menu', ['Summary', 'Analyze', 'Categories', 'Transactions', 'Settings', 'Help'], 'en')
const enId = await createMenu(enDef)
console.log('  Created:', enId)
await uploadImage(enId, path.join(__dirname, 'richmenu-en.jpg'))
console.log('  Image uploaded')

console.log('Setting Thai menu as default for all users...')
await setDefaultMenu(thId)
console.log('  Done')

console.log('\nRegistration complete!\n')
console.log('Add these to Vercel env vars:')
console.log(`  LINE_RICH_MENU_TH=${thId}`)
console.log(`  LINE_RICH_MENU_EN=${enId}`)
