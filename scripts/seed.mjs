import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PROFILE_ID = '00000000-0000-0000-0000-000000000001'
const LINE_USER_ID = 'demo_user_line_001'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function upsert(table, rows, conflict) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict, ignoreDuplicates: true })
  if (error) {
    console.error(`  ✗ ${table}:`, error.message)
  } else {
    console.log(`  ✓ ${table} (${rows.length} rows)`)
  }
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
await upsert('profiles', [{
  id: PROFILE_ID,
  line_user_id: LINE_USER_ID,
  display_name: 'สมชาย ใจดี',
  picture_url: null,
  budget_cycle_day: 1,
  timezone: 'Asia/Bangkok',
  notify_daily: true,
  notify_time: '20:00',
}], 'line_user_id')

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const C = (id, name, type, icon, color, order) => ({
  id: `10000000-0000-0000-0000-00000000000${id}`,
  profile_id: PROFILE_ID,
  name, type, icon, color,
  is_default: true,
  sort_order: order,
})

await upsert('categories', [
  C(1, 'อาหาร',           'expense', '🍜', '#e07b54',  1),
  C(2, 'เดินทาง',          'expense', '🚗', '#5b8dd9',  2),
  C(3, 'ที่พัก',           'expense', '🏠', '#9b59b6',  3),
  C(4, 'ชอปปิง',           'expense', '🛍️', '#e91e8c', 4),
  C(5, 'สุขภาพ',           'expense', '💊', '#2ecc71',  5),
  C(6, 'บันเทิง',          'expense', '🎬', '#f39c12',  6),
  C(7, 'การศึกษา',         'expense', '📚', '#3498db',  7),
  C(8, 'ค่าสาธารณูปโภค', 'expense', '⚡', '#7f8c8d',  8),
  C(9, 'อื่นๆ',            'expense', '💸', '#95a5a6',  9),
  C('a', 'เงินเดือน',      'income',  '💼', '#27ae60', 10),
  C('b', 'ลงทุน/ปันผล',   'income',  '📈', '#16a085', 11),
  C('c', 'ฟรีแลนซ์',       'income',  '💻', '#8e44ad', 12),
  C('d', 'รายได้อื่นๆ',   'income',  '💰', '#84a06e', 13),
], 'id')

const cat = (n) => `10000000-0000-0000-0000-00000000000${n}`

// ---------------------------------------------------------------------------
// Recurring
// ---------------------------------------------------------------------------
const R = (id, cat_n, type, amount, note, freq, dom, next) => ({
  id: `20000000-0000-0000-0000-00000000000${id}`,
  profile_id: PROFILE_ID,
  category_id: cat(cat_n),
  type, amount, note,
  frequency: freq,
  day_of_month: dom,
  next_due_date: next,
  is_active: true,
})

await upsert('recurring_transactions', [
  R(1, 3, 'expense', 8500,  'ค่าเช่าห้อง',       'monthly', 1,  '2026-05-01'),
  R(2, 'a','income', 48000, 'เงินเดือน',          'monthly', 25, '2026-05-25'),
  R(3, 6, 'expense', 349,   'Netflix',            'monthly', 5,  '2026-05-05'),
  R(4, 6, 'expense', 99,    'Spotify',            'monthly', 12, '2026-05-12'),
  R(5, 8, 'expense', 650,   'อินเทอร์เน็ตบ้าน',  'monthly', 8,  '2026-05-08'),
  R(6, 'b','income', 1200,  'เงินปันผล SSF',      'monthly', 15, '2026-05-15'),
], 'id')

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------
const { error: remErr } = await supabase.from('reminders').upsert([
  {
    profile_id: PROFILE_ID,
    title: 'จดรายจ่ายวันนี้',
    message: 'อย่าลืมบันทึกค่าใช้จ่ายของวันนี้นะ 📝',
    remind_time: '20:00',
    is_active: true,
    days_of_week: [1,2,3,4,5,6,0],
  },
  {
    profile_id: PROFILE_ID,
    title: 'สรุปสัปดาห์',
    message: 'ดูสรุปค่าใช้จ่ายสัปดาห์นี้กันเถอะ 📊',
    remind_time: '19:00',
    is_active: true,
    days_of_week: [0],
  },
], { ignoreDuplicates: true })
if (remErr) console.error('  ✗ reminders:', remErr.message)
else console.log('  ✓ reminders (2 rows)')

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------
const T = (cat_n, type, amount, note, date, method = 'manual') => ({
  profile_id: PROFILE_ID,
  category_id: cat(cat_n),
  type, amount, note, date,
  input_method: method,
})

const transactions = [
  // ---- February 2026 ----
  T('a', 'income',  48000, 'เงินเดือนกุมภาพันธ์',              '2026-02-01', 'recurring'),
  T(3,   'expense',  8500, 'ค่าเช่าห้องกุมภาพันธ์',            '2026-02-01', 'recurring'),
  T(1,   'expense',   120, 'ข้าวเหนียวหมูทอด + น้ำเต้าหู้',    '2026-02-02'),
  T(2,   'expense',    75, 'BTS ไปทำงาน-กลับ',                 '2026-02-02'),
  T(1,   'expense',   280, 'ข้าวกลางวัน + กาแฟ + ขนม',         '2026-02-03', 'voice'),
  T(1,   'expense',   150, 'ก๋วยเตี๋ยวเรือ',                    '2026-02-04'),
  T(6,   'expense',   349, 'Netflix รายเดือน',                  '2026-02-05', 'recurring'),
  T(1,   'expense',   380, 'ชาบูหมูกระทะกับเพื่อน',             '2026-02-07'),
  T(2,   'expense',   130, 'Grab ไปห้างฯ',                      '2026-02-07'),
  T(8,   'expense',   650, 'ค่าอินเทอร์เน็ต AIS',              '2026-02-08', 'recurring'),
  T(1,   'expense',    95, 'กาแฟ Cafe Amazon',                 '2026-02-09', 'voice'),
  T(4,   'expense',  2400, 'เสื้อผ้า H&M + Uniqlo',            '2026-02-09'),
  T(1,   'expense',   180, 'ผัดไทย + น้ำมะนาว',                '2026-02-10'),
  T(6,   'expense',    99, 'Spotify รายเดือน',                  '2026-02-12', 'recurring'),
  T(1,   'expense',   420, 'อาหารญี่ปุ่น Yayoi',               '2026-02-13'),
  T(6,   'expense',   480, 'ดูหนัง Major + ป๊อปคอร์น',          '2026-02-14'),
  T('b', 'income',   1200, 'เงินปันผล SSF',                     '2026-02-15', 'recurring'),
  T(1,   'expense',   130, 'ข้าวหมูแดง + ไข่ต้ม',              '2026-02-16', 'voice'),
  T(2,   'expense',   160, 'ค่าน้ำมัน Honda Jazz',              '2026-02-17', 'ocr'),
  T(5,   'expense',   550, 'คลินิก ค่ายา แก้ไข้',              '2026-02-18'),
  T(1,   'expense',   200, 'ส้มตำปู + ไก่ย่าง',                '2026-02-19'),
  T(7,   'expense',  1990, 'คอร์ส Figma ออนไลน์',              '2026-02-20'),
  T(1,   'expense',   110, 'ข้าวต้มหมู',                        '2026-02-21'),
  T('c', 'income',   8000, 'งาน freelance ออกแบบ logo',         '2026-02-22'),
  T(4,   'expense',   890, 'รองเท้า Nike Sale',                 '2026-02-23', 'ocr'),
  T(1,   'expense',   260, "บุฟเฟ่ต์ไอศกรีม Swensen's",        '2026-02-24'),
  T(8,   'expense',   380, 'ค่าน้ำ-ไฟ',                         '2026-02-25', 'ocr'),
  T(2,   'expense',    90, 'BTS ไปเดินห้าง',                    '2026-02-25'),
  T(1,   'expense',   195, 'ข้าวมันไก่ + ชาเย็น',              '2026-02-26', 'voice'),
  T(9,   'expense',   340, "ซื้อของใช้ Lotus's",                '2026-02-27'),
  T(1,   'expense',   230, 'ร้านอาหารอีสาน ลาบเป็ด',            '2026-02-28'),

  // ---- March 2026 ----
  T('a', 'income',  48000, 'เงินเดือนมีนาคม',                   '2026-03-01', 'recurring'),
  T(3,   'expense',  8500, 'ค่าเช่าห้องมีนาคม',                 '2026-03-01', 'recurring'),
  T(1,   'expense',   140, 'ข้าวเหนียวไก่ทอด + ชาเย็น',        '2026-03-02', 'voice'),
  T(2,   'expense',   210, 'Grab ไปประชุม นอกสถานที่',          '2026-03-02'),
  T(1,   'expense',   165, 'ก๋วยเตี๋ยวคั่วไก่',                 '2026-03-03'),
  T(6,   'expense',   349, 'Netflix รายเดือน',                  '2026-03-05', 'recurring'),
  T(1,   'expense',   320, 'ปิ้งย่างกับเพื่อนออฟฟิศ',           '2026-03-06'),
  T(4,   'expense',  1650, 'กระเป๋า Kipling ลดราคา',            '2026-03-07', 'ocr'),
  T(8,   'expense',   650, 'ค่าอินเทอร์เน็ต',                  '2026-03-08', 'recurring'),
  T(1,   'expense',    85, 'กาแฟโอเลี้ยง แม่ค้าข้างออฟฟิศ',   '2026-03-09', 'voice'),
  T(5,   'expense',   280, 'วิตามิน C + D + Fish Oil',          '2026-03-10'),
  T(1,   'expense',   175, 'ข้าวผัดกระเพรา + ไข่ดาว',          '2026-03-10', 'voice'),
  T(2,   'expense',   155, 'ค่าน้ำมัน ปั๊ม PTT',               '2026-03-11', 'ocr'),
  T(6,   'expense',    99, 'Spotify รายเดือน',                  '2026-03-12', 'recurring'),
  T(1,   'expense',   450, 'สุกี้ MK กับครอบครัว',              '2026-03-13'),
  T('d', 'income',   2500, 'ขายของเก่า Shopee',                 '2026-03-14'),
  T('b', 'income',   1200, 'เงินปันผล SSF',                     '2026-03-15', 'recurring'),
  T(1,   'expense',   130, 'โจ๊กหมู ยามดึก',                    '2026-03-16', 'voice'),
  T(7,   'expense',  2490, 'คอร์ส TypeScript Udemy',            '2026-03-17'),
  T(1,   'expense',   190, 'บะหมี่เกี๊ยวกุ้ง',                  '2026-03-18'),
  T(4,   'expense',   550, 'ของใช้ในห้องน้ำ + Skincare',        '2026-03-19', 'ocr'),
  T(1,   'expense',   220, 'ข้าวหน้าเป็ด ร้านประจำ',            '2026-03-20', 'voice'),
  T(6,   'expense',   680, 'คอนเสิร์ต โจ้ กนกพล',              '2026-03-21'),
  T('c', 'income',   5500, 'freelance เว็บไซต์ลูกค้าใหม่',      '2026-03-22'),
  T(1,   'expense',   145, 'แซนวิช 7-Eleven + นม',              '2026-03-23', 'voice'),
  T(8,   'expense',   410, 'ค่าน้ำ-ไฟ',                         '2026-03-25', 'ocr'),
  T(2,   'expense',   180, 'Grab ไปสนามบิน รับเพื่อน',          '2026-03-26'),
  T(1,   'expense',   860, 'ข้าวเย็นร้านอาหาร + เบียร์',        '2026-03-27'),
  T(9,   'expense',   490, 'ซื้อของใช้ BigC',                   '2026-03-28', 'ocr'),
  T(5,   'expense',   800, 'ตรวจฟัน สเกลลิ่ง',                 '2026-03-30'),
  T(1,   'expense',   200, 'ส้มตำ + ปลาเผา',                    '2026-03-31', 'voice'),

  // ---- April 2026 ----
  T('a', 'income',  48000, 'เงินเดือนเมษายน',                   '2026-04-01', 'recurring'),
  T(3,   'expense',  8500, 'ค่าเช่าห้องเมษายน',                 '2026-04-01', 'recurring'),
  T(1,   'expense',   120, 'ข้าวเหนียวหมูทอด ร้านแม่ค้า',      '2026-04-01'),
  T(2,   'expense',    75, 'BTS สยาม-อโศก',                    '2026-04-02'),
  T(1,   'expense',   265, 'กาแฟ + แซนวิช + ขนมปัง',           '2026-04-02', 'voice'),
  T(4,   'expense',  1290, 'เสื้อผ้า Uniqlo ลด 30%',            '2026-04-03', 'ocr'),
  T(1,   'expense',   185, 'ผัดกะเพราหมูสับ ไข่ดาว + น้ำ',     '2026-04-03', 'voice'),
  T(5,   'expense',   450, 'วิตามินรวม + โปรตีนเชค',            '2026-04-04'),
  T(6,   'expense',   349, 'Netflix รายเดือน',                  '2026-04-05', 'recurring'),
  T(1,   'expense',    95, 'กาแฟเย็น Cafe Amazon',              '2026-04-05', 'voice'),
  T('b', 'income',   1200, 'เงินปันผล SSF',                     '2026-04-05', 'recurring'),
  T(2,   'expense',    45, 'BTS ช่วงเย็น',                      '2026-04-06'),
  T(1,   'expense',   320, 'ชาบูหมูกับเพื่อนออฟฟิศ',            '2026-04-07'),
  T(8,   'expense',   650, 'ค่าอินเทอร์เน็ต True',             '2026-04-08', 'recurring'),
  T(7,   'expense',  2500, 'คอร์ส Next.js 15 — Frontend Masters','2026-04-08'),
  T(1,   'expense',   155, 'ข้าวหน้าไก่ + ชาร้อน',              '2026-04-08', 'voice'),
  T(2,   'expense',   120, 'ค่าน้ำมัน ปั๊ม Shell',              '2026-04-09', 'ocr'),
  T(4,   'expense',   680, 'รองเท้าวิ่ง Hoka One One',          '2026-04-10'),
  T('d', 'income',   1500, 'ขายของใช้เก่า',                     '2026-04-10'),
  T(1,   'expense',   200, 'ส้มตำ + ไก่ย่าง + ข้าวเหนียว',      '2026-04-11', 'voice'),
  T(6,   'expense',    99, 'Spotify รายเดือน',                  '2026-04-12', 'recurring'),
  T(5,   'expense',   800, 'ตรวจร่างกายประจำปี',                '2026-04-12'),
  T(1,   'expense',    75, 'กาแฟ + ขนมปังปิ้ง',                '2026-04-13', 'voice'),
  T(6,   'expense',   450, 'ดูหนัง IMAX + ป๊อปคอร์นใหญ่',       '2026-04-14'),
  T(8,   'expense',   350, 'ค่าน้ำ-ไฟ',                         '2026-04-15', 'ocr'),
  T(1,   'expense',   175, 'ข้าวมันไก่ + น้ำจิ้มพิเศษ',         '2026-04-16', 'voice'),
  T(2,   'expense',   200, 'ค่าจอดรถ Mall',                     '2026-04-17'),
  T(1,   'expense',   560, 'อาหารญี่ปุ่น Fuji ครบรอบกับแฟน',   '2026-04-18'),
  T('c', 'income',   7000, 'freelance แก้เว็บเก่าลูกค้า',       '2026-04-18'),
  T(4,   'expense',   390, 'กระเป๋าผ้า + กระบอกน้ำ',            '2026-04-19', 'ocr'),
  T(1,   'expense',   110, 'ก๋วยเตี๋ยวเส้นใหญ่ใส่ทุกอย่าง',     '2026-04-20', 'voice'),
  T(1,   'expense',   240, 'ข้าวเย็น + น้ำผลไม้คั้นสด',         '2026-04-21'),
]

// Insert in batches of 50 to avoid size limits
const BATCH = 50
for (let i = 0; i < transactions.length; i += BATCH) {
  const batch = transactions.slice(i, i + BATCH)
  const { error } = await supabase.from('transactions').insert(batch)
  if (error) {
    console.error(`  ✗ transactions [${i}–${i + batch.length}]:`, error.message)
  } else {
    console.log(`  ✓ transactions [${i + 1}–${i + batch.length}] / ${transactions.length}`)
  }
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------
const B = (cat_n, amount, month, year) => ({
  profile_id: PROFILE_ID,
  category_id: cat(cat_n),
  amount, month, year,
})

await upsert('budgets', [
  // Feb
  B(1, 5000,  2, 2026), B(2, 2000,  2, 2026), B(3, 9000,  2, 2026),
  B(4, 3000,  2, 2026), B(5, 1500,  2, 2026), B(6, 1000,  2, 2026), B(7, 3000,  2, 2026),
  // Mar
  B(1, 5000,  3, 2026), B(2, 2000,  3, 2026), B(3, 9000,  3, 2026),
  B(4, 3000,  3, 2026), B(5, 1500,  3, 2026), B(6, 1500,  3, 2026), B(7, 3500,  3, 2026),
  // Apr
  B(1, 5500,  4, 2026), B(2, 2000,  4, 2026), B(3, 9000,  4, 2026),
  B(4, 3000,  4, 2026), B(5, 2000,  4, 2026), B(6, 1500,  4, 2026), B(7, 3500,  4, 2026),
], 'profile_id,category_id,month,year')

console.log('\n✅ Seed เสร็จสมบูรณ์')
