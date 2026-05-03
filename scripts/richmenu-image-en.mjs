/**
 * จด rich menu image — English version (2500×1686 px) — Modern dark redesign
 */
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'richmenu-en.jpg')

const W = 2500, H = 1686
const LEFT_W = 960        // brand panel
const RIGHT_W = W - LEFT_W // 1540 px → 2 cols
const COLS = 2
const ROWS = 3
const BW = RIGHT_W / COLS  // 770 px
const BH = H / ROWS        // 562 px
const PAD = 22
const BR = 44  // button corner radius

// ── Palette — Earth Tone Pastel ────────────────────────────────────────────
const BG       = '#f2ece0'   // warm cream
const DIVIDER  = '#d6c9b0'
const WHITE    = '#ffffff'
const DARK     = '#3d2e1e'   // warm dark brown for text
const SAGE     = '#6b8f5e'   // medium sage
const SAGE_DIM = '#8aab7a'

// Per-button: [card-bg, icon-circle, icon-color, label-color]
const BTNS = [
  { bg: '#ddebd5', circle: '#8ab87a', icon: '#3d6b30', label: '#2d4a24' },  // Summary — sage green
  { bg: '#f0e0cc', circle: '#d4946a', icon: '#7a3d1a', label: '#5c2e10' },  // Analyze — terracotta
  { bg: '#d8e8e0', circle: '#7ab8a0', icon: '#2a6652', label: '#1e4a3c' },  // Categories — teal sage
  { bg: '#e8ddf0', circle: '#b09ac8', icon: '#5c3d82', label: '#3d2460' },  // Transactions — dusty lavender
  { bg: '#f0e8d0', circle: '#d4b870', icon: '#7a5a10', label: '#5c4010' },  // Settings — warm amber
  { bg: '#dde8f0', circle: '#7aaac8', icon: '#1e4d6b', label: '#163850' },  // Help — dusty blue
]

// ── SVG helpers ─────────────────────────────────────────────────────────────
const r = (x, y, w, h, fill, rx = 0) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`

// Button card
function card(col, row) {
  const x = LEFT_W + col * BW + PAD
  const y = row * BH + PAD
  const b = BTNS[row * COLS + col]
  return `<rect x="${x}" y="${y}" width="${BW - PAD*2}" height="${BH - PAD*2}" fill="${b.bg}" rx="${BR}"/>`
}

// Icon circle behind icon
function iconCircle(col, row) {
  const b = BTNS[row * COLS + col]
  const cx = LEFT_W + col * BW + BW / 2
  const cy = row * BH + BH * 0.40
  return `<circle cx="${cx}" cy="${cy}" r="145" fill="${b.circle}"/>`
}

// Label
function label(text, col, row) {
  const b = BTNS[row * COLS + col]
  const x = LEFT_W + col * BW + BW / 2
  const y = row * BH + BH * 0.82
  return `<text x="${x}" y="${y}" font-family="Thonburi,'Noto Sans Thai','Sarabun',sans-serif"
    font-size="76" font-weight="700" fill="${b.label}" text-anchor="middle">${text}</text>`
}

// Icon at button center — FA6 Solid filled style
function icon(vb, d, col, row, renderSize = 120) {
  const b = BTNS[row * COLS + col]
  const cx = LEFT_W + col * BW + BW / 2
  const cy = row * BH + BH * 0.40
  const [,, vbW, vbH] = vb.split(' ').map(Number)
  const scaleX = renderSize / vbW
  const scaleY = renderSize / vbH
  const tx = cx - renderSize / 2
  const ty = cy - renderSize / 2
  return `<g transform="translate(${tx},${ty}) scale(${scaleX},${scaleY})"><path fill="${b.icon}" d="${d}"/></g>`
}

// ── Icon paths (FA6 Solid) ─────────────────────────────────────────────────
const ICONS = {
  // chart-simple (Summary)
  barChart: {
    vb: '0 0 448 512',
    d: 'M160 80c0-26.5 21.5-48 48-48h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V80zM0 272c0-26.5 21.5-48 48-48H80c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V272zM368 96h32c26.5 0 48 21.5 48 48V432c0 26.5-21.5 48-48 48H368c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48z',
  },

  // arrow-trend-up (Analyze)
  trendUp: {
    vb: '0 0 576 512',
    d: 'M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z',
  },

  // table-cells (Categories)
  grid: {
    vb: '0 0 512 512',
    d: 'M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 64V256h160V160H64zm0 192V448h160V352H64zm224 96h160V352H288v96zm160-192V160H288V256H448z',
  },

  // list (Transactions)
  list: {
    vb: '0 0 512 512',
    d: 'M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z',
  },

  // gear (Settings)
  gear: {
    vb: '0 0 512 512',
    d: 'M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z',
  },

  // circle-question (Help)
  question: {
    vb: '0 0 512 512',
    d: 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z',
  },
}

// ── Left panel decorative elements ─────────────────────────────────────────
function circles() {
  return `
    <!-- Decorative rings -->
    <circle cx="${LEFT_W / 2}" cy="980" r="330" fill="none" stroke="${SAGE}" stroke-width="3" opacity="0.18"/>
    <circle cx="${LEFT_W / 2}" cy="980" r="250" fill="none" stroke="${SAGE}" stroke-width="2" opacity="0.22"/>
    <circle cx="${LEFT_W / 2}" cy="980" r="170" fill="${SAGE}" opacity="0.1"/>
    <!-- Wallet/coin icon inside circle -->
    <g transform="translate(${LEFT_W/2 - 90},${980 - 90}) scale(7.5)" fill="none" stroke="${SAGE}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <path d="M16 12h.01"/>
      <path d="M1 9h22"/>
    </g>
  `
}

// ── Assemble SVG ────────────────────────────────────────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="leftGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#e8dfc8"/>
      <stop offset="100%" stop-color="#d4c9a8"/>
    </linearGradient>
  </defs>

  <!-- Global background -->
  ${r(0, 0, W, H, BG)}

  <!-- Left panel -->
  <rect x="0" y="0" width="${LEFT_W}" height="${H}" fill="url(#leftGrad)"/>

  <!-- Divider line -->
  <line x1="${LEFT_W}" y1="0" x2="${LEFT_W}" y2="${H}" stroke="${DIVIDER}" stroke-width="4"/>

  <!-- Brand tag — text only -->
  <text x="${LEFT_W/2}" y="165"
    font-family="Thonburi,'Noto Sans Thai','Sarabun',sans-serif"
    font-size="50" font-weight="600" fill="${SAGE}" text-anchor="middle" opacity="0.8">Track expenses</text>

  <!-- Main brand name -->
  <text x="${LEFT_W/2}" y="420"
    font-family="Thonburi,'Noto Sans Thai','Sarabun',sans-serif"
    font-size="240" font-weight="900"
    fill="${DARK}" text-anchor="middle" opacity="0.92">Record</text>

  <!-- Tagline -->
  <text x="${LEFT_W/2}" y="530"
    font-family="Thonburi,'Noto Sans Thai','Sarabun',sans-serif"
    font-size="68" font-weight="400"
    fill="${SAGE}" text-anchor="middle" opacity="0.85">Income · Expense · Budget</text>

  <!-- Decorative circles + wallet icon -->
  ${circles()}

  <!-- Bottom hint — text only -->
  <text x="${LEFT_W/2}" y="1530"
    font-family="Thonburi,'Noto Sans Thai','Sarabun',sans-serif"
    font-size="56" font-weight="500"
    fill="${DARK}" text-anchor="middle" opacity="0.45">Tap to open app  →</text>

  <!-- ===== RIGHT BUTTON GRID ===== -->

  <!-- Row 0 -->
  ${card(0,0)}
  ${iconCircle(0,0)}
  ${icon(ICONS.barChart.vb, ICONS.barChart.d, 0, 0)}
  ${label('Summary', 0, 0)}

  ${card(1,0)}
  ${iconCircle(1,0)}
  ${icon(ICONS.trendUp.vb, ICONS.trendUp.d, 1, 0)}
  ${label('Analyze', 1, 0)}

  <!-- Row 1 -->
  ${card(0,1)}
  ${iconCircle(0,1)}
  ${icon(ICONS.grid.vb, ICONS.grid.d, 0, 1)}
  ${label('Categories', 0, 1)}

  ${card(1,1)}
  ${iconCircle(1,1)}
  ${icon(ICONS.list.vb, ICONS.list.d, 1, 1)}
  ${label('Transactions', 1, 1)}

  <!-- Row 2 -->
  ${card(0,2)}
  ${iconCircle(0,2)}
  ${icon(ICONS.gear.vb, ICONS.gear.d, 0, 2)}
  ${label('Settings', 0, 2)}

  ${card(1,2)}
  ${iconCircle(1,2)}
  ${icon(ICONS.question.vb, ICONS.question.d, 1, 2)}
  ${label('Help', 1, 2)}
</svg>`

writeFileSync(path.join(__dirname, 'richmenu-en.svg'), svg)

await sharp(Buffer.from(svg))
  .jpeg({ quality: 94 })
  .toFile(OUT)

console.log('✓ Rich menu EN image saved:', OUT)
