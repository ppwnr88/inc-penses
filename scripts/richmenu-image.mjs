/**
 * Generates เงินจด rich menu image (2500x1686 px)
 * Layout: left brand panel + right 3×2 button grid
 */
import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'richmenu.jpg')

// Brand colors (earth tone — olive/sage)
const C = {
  bg:        '#4a5e3a',   // dark olive background
  leftBg:    '#f5f0e8',   // cream left panel
  leftAccent:'#84a06e',   // olive accent
  btn1:      '#84a06e',   // สรุป — olive
  btn2:      '#6a8557',   // วิเคราะห์ — dark sage
  btn3:      '#a8c090',   // หมวด/งบ — light sage
  btn4:      '#7a9b5e',   // รายการ — medium olive
  btn5:      '#c5b99a',   // ตั้งค่า — sand
  btn6:      '#5b8a7a',   // Help — teal
  textDark:  '#2d3b22',
  textLight: '#fffdf7',
  white:     '#ffffff',
}

// Canvas: 2500 × 1686
const W = 2500, H = 1686
const LEFT_W = 1500          // left brand panel width
const RIGHT_W = W - LEFT_W   // 1000 px
const ROWS = 3
const BTN_W = RIGHT_W / 2    // 500 px per button
const BTN_H = H / ROWS       // 562 px per button
const R = 40                  // corner radius

function rect(x, y, w, h, fill, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"/>`
}

function btnRect(x, y, fill) {
  const pad = 18
  return `<rect x="${x + pad}" y="${y + pad}" width="${BTN_W - pad * 2}" height="${BTN_H - pad * 2}" fill="${fill}" rx="${R}"/>`
}

// Icon SVG paths (simplified)
const icons = {
  home: `<path d="M50,15 L85,45 L85,85 L60,85 L60,62 L40,62 L40,85 L15,85 L15,45 Z" fill="currentColor"/>
         <path d="M50,15 L85,45" stroke="currentColor" stroke-width="4" fill="none"/>`,
  chart: `<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="55 165" stroke-dashoffset="0"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="40 180" stroke-dashoffset="-55" opacity="0.7"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="30 190" stroke-dashoffset="-95" opacity="0.5"/>`,
  donut: `<circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="14" stroke-dasharray="66 134"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="14" stroke-dasharray="44 156" stroke-dashoffset="-66" opacity="0.6"/>
          <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.2"/>`,
  list:  `<rect x="15" y="20" width="70" height="10" rx="5" fill="currentColor"/>
          <rect x="15" y="40" width="70" height="10" rx="5" fill="currentColor"/>
          <rect x="15" y="60" width="70" height="10" rx="5" fill="currentColor"/>
          <rect x="15" y="80" width="50" height="10" rx="5" fill="currentColor"/>`,
  gear:  `<circle cx="50" cy="50" r="16" fill="currentColor"/>
          <circle cx="50" cy="50" r="8" fill="white"/>
          ${[0,45,90,135,180,225,270,315].map(a => {
            const rad = a * Math.PI / 180
            const x = 50 + 28 * Math.cos(rad)
            const y = 50 + 28 * Math.sin(rad)
            return `<rect x="${x-7}" y="${y-7}" width="14" height="14" rx="4" fill="currentColor" transform="rotate(${a} ${x} ${y})"/>`
          }).join('')}`,
  help:  `<path d="M25,35 Q25,15 50,15 Q75,15 75,35 Q75,50 50,55 L50,65" stroke="currentColor" stroke-width="9" fill="none" stroke-linecap="round"/>
          <circle cx="50" cy="80" r="6" fill="currentColor"/>`,
  coin:  `<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="6"/>
          <text x="50" y="58" font-size="36" text-anchor="middle" fill="currentColor" font-weight="bold">฿</text>`,
}

function iconGroup(name, color, cx, cy, size = 100) {
  const s = size / 100
  return `<g transform="translate(${cx - size/2}, ${cy - size/2}) scale(${s})" color="${color}">${icons[name]}</g>`
}

function btnLabel(text, x, y, color) {
  return `<text x="${x}" y="${y}" font-family="'Sarabun', 'Noto Sans Thai', sans-serif" font-size="72" font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="middle">${text}</text>`
}

// Build SVG
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@700&amp;display=swap');
    </style>
  </defs>

  <!-- Background -->
  ${rect(0, 0, W, H, C.bg)}

  <!-- Left brand panel -->
  <rect x="20" y="20" width="${LEFT_W - 40}" height="${H - 40}" fill="${C.leftBg}" rx="48"/>

  <!-- Brand text: เงินจด -->
  <text x="${LEFT_W / 2}" y="380"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="220" font-weight="900"
    fill="${C.leftAccent}" text-anchor="middle">เงินจด</text>

  <!-- Subtitle -->
  <text x="${LEFT_W / 2}" y="530"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="90" font-weight="600"
    fill="${C.textDark}" text-anchor="middle" opacity="0.75">จดรายรับ · รายจ่าย</text>

  <!-- Coin icon area -->
  <circle cx="${LEFT_W / 2}" cy="950" r="280" fill="${C.leftAccent}" opacity="0.12"/>
  <circle cx="${LEFT_W / 2}" cy="950" r="220" fill="${C.leftAccent}" opacity="0.12"/>
  ${iconGroup('coin', C.leftAccent, LEFT_W / 2, 950, 300)}

  <!-- Tap hint -->
  <text x="${LEFT_W / 2}" y="1420"
    font-family="'Sarabun','Noto Sans Thai',sans-serif"
    font-size="64" font-weight="500"
    fill="${C.leftAccent}" text-anchor="middle" opacity="0.8">แตะเพื่อเปิดแอป →</text>

  <!-- ===== RIGHT BUTTONS ===== -->

  <!-- Row 1: สรุป | วิเคราะห์ -->
  ${btnRect(LEFT_W, 0, C.btn1)}
  ${iconGroup('home', C.textLight, LEFT_W + BTN_W/2, BTN_H * 0.38, 140)}
  ${btnLabel('สรุป', LEFT_W + BTN_W/2, BTN_H * 0.76, C.textLight)}

  ${btnRect(LEFT_W + BTN_W, 0, C.btn2)}
  ${iconGroup('chart', C.textLight, LEFT_W + BTN_W + BTN_W/2, BTN_H * 0.38, 140)}
  ${btnLabel('วิเคราะห์', LEFT_W + BTN_W + BTN_W/2, BTN_H * 0.76, C.textLight)}

  <!-- Row 2: หมวด/งบ | รายการ -->
  ${btnRect(LEFT_W, BTN_H, C.btn3)}
  ${iconGroup('donut', C.textDark, LEFT_W + BTN_W/2, BTN_H + BTN_H * 0.38, 140)}
  ${btnLabel('หมวด/งบ', LEFT_W + BTN_W/2, BTN_H + BTN_H * 0.76, C.textDark)}

  ${btnRect(LEFT_W + BTN_W, BTN_H, C.btn4)}
  ${iconGroup('list', C.textLight, LEFT_W + BTN_W + BTN_W/2, BTN_H + BTN_H * 0.38, 140)}
  ${btnLabel('รายการ', LEFT_W + BTN_W + BTN_W/2, BTN_H + BTN_H * 0.76, C.textLight)}

  <!-- Row 3: ตั้งค่า | Help -->
  ${btnRect(LEFT_W, BTN_H * 2, C.btn5)}
  ${iconGroup('gear', C.textDark, LEFT_W + BTN_W/2, BTN_H * 2 + BTN_H * 0.38, 140)}
  ${btnLabel('ตั้งค่า', LEFT_W + BTN_W/2, BTN_H * 2 + BTN_H * 0.76, C.textDark)}

  ${btnRect(LEFT_W + BTN_W, BTN_H * 2, C.btn6)}
  ${iconGroup('help', C.textLight, LEFT_W + BTN_W + BTN_W/2, BTN_H * 2 + BTN_H * 0.38, 140)}
  ${btnLabel('Help', LEFT_W + BTN_W + BTN_W/2, BTN_H * 2 + BTN_H * 0.76, C.textLight)}
</svg>
`

writeFileSync(path.join(__dirname, 'richmenu.svg'), svg)

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92 })
  .toFile(OUT)

console.log('✓ Rich menu image saved:', OUT)
