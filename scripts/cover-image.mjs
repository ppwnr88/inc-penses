/**
 * จด — LINE OA Cover Photo
 * Spec: 1200×675 px (16:9)
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'cover.jpg')

const W = 1200, H = 675

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#ede5d0"/>
      <stop offset="100%" stop-color="#d8cdb0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="14" flood-color="#3d2e1e" flood-opacity="0.13"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="8" flood-color="#3d2e1e" flood-opacity="0.09"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Dot grid -->
  ${Array.from({length: 7}, (_,row) =>
    Array.from({length: 18}, (_,col) =>
      `<circle cx="${36 + col*68}" cy="${36 + row*100}" r="2.5" fill="#6b8f5e" opacity="0.10"/>`
    ).join('')
  ).join('')}

  <!-- Blobs top-right -->
  <circle cx="1160" cy="40"  r="200" fill="#6b8f5e" opacity="0.07"/>
  <circle cx="1100" cy="-20" r="140" fill="#6b8f5e" opacity="0.06"/>
  <!-- Blobs bottom-left -->
  <circle cx="30"   cy="640" r="160" fill="#d4946a" opacity="0.08"/>
  <circle cx="-10"  cy="590" r="100" fill="#d4946a" opacity="0.06"/>

  <!-- ── LEFT BRAND PANEL ── -->

  <!-- Accent bar -->
  <rect x="44" y="44" width="8" height="${H-88}" fill="#6b8f5e" rx="4" opacity="0.55"/>

  <!-- Brand "จด" -->
  <text x="72" y="248"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="210" font-weight="900"
    fill="#3d2e1e" opacity="0.88">จด</text>

  <!-- Tagline -->
  <text x="72" y="288"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="28" font-weight="400" letter-spacing="1"
    fill="#6b8f5e" opacity="0.88">รายรับ · รายจ่าย · งบประมาณ</text>

  <!-- Divider -->
  <line x1="72" y1="314" x2="440" y2="314"
    stroke="#6b8f5e" stroke-width="1.5" opacity="0.28"/>

  <!-- Pills row -->
  <rect x="72"  y="328" width="116" height="44" fill="#ddebd5" rx="22"/>
  <text x="130" y="356"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="22" font-weight="600" fill="#3d6b30" text-anchor="middle">จดเร็ว</text>

  <rect x="200" y="328" width="144" height="44" fill="#f0e0cc" rx="22"/>
  <text x="272" y="356"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="22" font-weight="600" fill="#7a3d1a" text-anchor="middle">วิเคราะห์</text>

  <rect x="356" y="328" width="84" height="44" fill="#d8e8e0" rx="22"/>
  <text x="398" y="356"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="22" font-weight="600" fill="#2a6652" text-anchor="middle">ฟรี</text>

  <!-- Sub caption -->
  <text x="72" y="432"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="22" fill="#3d2e1e" opacity="0.36">ผ่าน LINE · ไม่ต้องโหลดแอป · ใช้ได้เลย</text>

  <!-- LINE badge -->
  <rect x="72" y="568" width="210" height="58" fill="#06c755" rx="29"/>
  <text x="177" y="604"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="28" font-weight="700" fill="white" text-anchor="middle">LINE  จด</text>

  <!-- ── CENTER DASHED DIVIDER ── -->
  <line x1="500" y1="60" x2="500" y2="${H-60}"
    stroke="#c8bda0" stroke-width="1" opacity="0.4" stroke-dasharray="5 5"/>

  <!-- ── RIGHT CARD ILLUSTRATION ── -->

  <!-- Stacked card backs -->
  <rect x="520" y="54"  width="630" height="230" fill="#f0e0cc" rx="24" opacity="0.50"
    transform="rotate(-5 835 169)"/>
  <rect x="520" y="68"  width="630" height="230" fill="#ddebd5" rx="24" opacity="0.65"
    transform="rotate(-1.5 835 183)"/>

  <!-- Front card — expense -->
  <rect x="516" y="78" width="640" height="245" fill="white" rx="24" filter="url(#shadow)"/>
  <rect x="516" y="78" width="640" height="60" fill="#c0392b" rx="24"/>
  <rect x="516" y="114" width="640" height="24" fill="#c0392b"/>
  <text x="554" y="120"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="26" font-weight="600" fill="white">รายจ่าย</text>
  <text x="554" y="194"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="58" font-weight="800" fill="#3d2e1e">-฿850</text>
  <text x="554" y="228"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="24" fill="#9a8a78">กินข้าว · อาหาร</text>
  <line x1="554" y1="246" x2="1124" y2="246" stroke="#f0ebe0" stroke-width="1.5"/>
  <text x="554" y="268"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="20" fill="#b0a090">22 เม.ย. 2569</text>

  <!-- Income card -->
  <rect x="552" y="342" width="530" height="150" fill="white" rx="20" filter="url(#softShadow)" opacity="0.95"/>
  <rect x="552" y="342" width="530" height="52" fill="#4a7c59" rx="20"/>
  <rect x="552" y="374" width="530" height="20" fill="#4a7c59"/>
  <text x="586" y="378"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="22" font-weight="600" fill="white">รายรับ</text>
  <text x="586" y="434"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="44" font-weight="800" fill="#3d6b30">+฿48,000</text>
  <text x="586" y="464"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="20" fill="#9a8a78">เงินเดือน</text>

  <!-- Balance pill -->
  <rect x="570" y="514" width="500" height="52" fill="#f5efe0" rx="26" filter="url(#softShadow)"/>
  <text x="820" y="547"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="26" font-weight="700" fill="#4a7c59" text-anchor="middle">คงเหลือ  +฿47,150</text>

</svg>`

await sharp(Buffer.from(svg))
  .jpeg({ quality: 95 })
  .toFile(OUT)

console.log(`✓ Cover image saved: ${OUT}`)
console.log(`  Size: ${W}×${H} px (16:9)`)
