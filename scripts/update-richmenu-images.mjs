/**
 * Re-upload rich menu images without recreating menu definitions.
 * Run after regenerating images with updated fonts/design.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envVars = Object.fromEntries(
  readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const TOKEN       = envVars['LINE_CHANNEL_ACCESS_TOKEN']
const MENU_TH     = envVars['LINE_RICH_MENU_TH'] ?? 'richmenu-9d216f062bb3c2293daaaa7ad097cb82'
const MENU_EN     = envVars['LINE_RICH_MENU_EN'] ?? 'richmenu-9b54e060f8425b50922c54cace1275cb'

async function uploadImage(richMenuId, filePath) {
  const img = readFileSync(filePath)
  const res = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'image/jpeg' },
    body: img,
  })
  const txt = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${txt}`)
  return txt
}

console.log('Uploading Thai image →', MENU_TH)
await uploadImage(MENU_TH, path.join(__dirname, 'richmenu.jpg'))
console.log('  ✓ done')

console.log('Uploading EN image →', MENU_EN)
await uploadImage(MENU_EN, path.join(__dirname, 'richmenu-en.jpg'))
console.log('  ✓ done')

console.log('\n✓ Both rich menu images updated.')
