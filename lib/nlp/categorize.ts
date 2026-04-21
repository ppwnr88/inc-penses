import type { TransactionType } from '@/types'

interface CategoryRule {
  name: string
  keywords: string[]
}

const EXPENSE_RULES: CategoryRule[] = [
  {
    name: 'อาหาร',
    keywords: [
      'กิน','ข้าว','อาหาร','ก๋วยเตี๋ยว','บะหมี่','ราดหน้า','ผัด','ต้ม','แกง','ลาบ','ยำ',
      'ส้มตำ','หมูกะทะ','ชาบู','สุกี้','บุฟเฟ่ต์','ปิ้งย่าง','หมูทอด','ไก่ทอด','ไก่ย่าง',
      'กาแฟ','cafe','coffee','ชา','นม','ขนม','เบเกอรี่','pizza','burger','ส้มตำ',
      'mcdonald','kfc','7-eleven','เซเว่น','โจ๊ก','ข้าวต้ม','ข้าวหน้า','ข้าวมัน',
      'ร้านอาหาร','ร้าน','เป็ด','หมู','ไก่','กุ้','ปลา','หอย','ทะเล','ญี่ปุ่น',
      'yayoi','fuji','mk','mk ','swensen','amazon','starbucks','sushi','ramen',
      'ก๋วย','เย็นตาโฟ','ผัดไทย','ต้มยำ','แซนวิช','sandwich',
    ],
  },
  {
    name: 'เดินทาง',
    keywords: [
      'grab','bolt','taxi','แท็กซี่','แท็กซี','bts','mrt','รถไฟฟ้า','น้ำมัน',
      'ปั๊ม','shell','ptt','esso','caltex','จอดรถ','ค่าทาง','expressway','tollway',
      'ค่ารถ','รถโดยสาร','bus','รถเมล์','มอเตอร์ไซ','winbike','เดินทาง',
      'สนามบิน','airport','ตั๋ว','ticket','grab car','lyft','indriver',
    ],
  },
  {
    name: 'ที่พัก',
    keywords: [
      'ค่าเช่า','เช่าห้อง','เช่า','ที่พัก','โรงแรม','hotel','airbnb',
      'หอพัก','คอนโด','อพาร์ทเมนต์','อพาร์ตเมนต์','บ้าน','ห้อง',
    ],
  },
  {
    name: 'ชอปปิง',
    keywords: [
      'ซื้อ','ชอปปิง','shopping','shop','เสื้อ','กางเกง','รองเท้า','กระเป๋า',
      'uniqlo','h&m','zara','central','siam','paragon','emquartier','iconsiam',
      'lotus','bigc','tops','makro','เซ็นทรัล','แฟชั่น','แต่งตัว',
      'เสื้อผ้า','ของใช้','ของตกแต่ง','เครื่องสำอาง','skincare','ครีม',
    ],
  },
  {
    name: 'สุขภาพ',
    keywords: [
      'หมอ','โรงพยาบาล','โรงบาล','คลินิก','clinic','hospital','ยา','วิตามิน',
      'vitamin','ออกกำลัง','gym','ฟิตเนส','fitness','ทันตกรรม','ฟัน','ตรวจ',
      'ตรวจร่างกาย','สุขภาพ','โปรตีน','protein','supplement','สเกล','สายตา',
    ],
  },
  {
    name: 'บันเทิง',
    keywords: [
      'หนัง','ดูหนัง','คอนเสิร์ต','concert','เที่ยว','netflix','spotify',
      'youtube','game','เกม','บันเทิง','karaoke','คาราโอเกะ','บาร์','bar',
      'เบียร์','เหล้า','ไวน์','สังสรรค์','ปาร์ตี้','party','ป๊อปคอร์น',
      'กิจกรรม','ท่องเที่ยว','รีสอร์ท','resort','ทะเล','ภูเขา',
    ],
  },
  {
    name: 'การศึกษา',
    keywords: [
      'คอร์ส','course','เรียน','หนังสือ','book','udemy','coursera',
      'การศึกษา','โรงเรียน','มหาวิทยาลัย','ค่าเทอม','ค่าเรียน',
      'workshop','seminar','training','อบรม','frontend masters',
    ],
  },
  {
    name: 'ค่าสาธารณูปโภค',
    keywords: [
      'ค่าไฟ','ค่าน้ำ','ค่าน้ำไฟ','น้ำไฟ','อินเทอร์เน็ต','internet','wifi',
      'ค่าโทรศัพท์','มือถือ','ais','dtac','true','nt','ค่าโทร',
      'ค่าบริการ','ค่าอินเทอร์','broadband',
    ],
  },
]

const INCOME_RULES: CategoryRule[] = [
  {
    name: 'เงินเดือน',
    keywords: ['เงินเดือน','salary','โบนัส','bonus','ค่าจ้าง','เงินปลายเดือน'],
  },
  {
    name: 'ลงทุน/ปันผล',
    keywords: ['ปันผล','dividend','กองทุน','หุ้น','crypto','ดอกเบี้ย','ssf','rmf','ลงทุน'],
  },
  {
    name: 'ฟรีแลนซ์',
    keywords: ['freelance','ฟรีแลนซ์','รับงาน','งาน','project','ค่างาน','ออกแบบ','เว็บ','โปรแกรม'],
  },
  {
    name: 'รายได้อื่นๆ',
    keywords: ['ขายของ','ขาย','shopee','lazada','facebook','รับเงิน','ได้รับ','รางวัล'],
  },
]

export function suggestCategory(note: string, type: TransactionType): string {
  const lower = note.toLowerCase()
  const rules = type === 'expense' ? EXPENSE_RULES : INCOME_RULES

  for (const rule of rules) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return rule.name
    }
  }

  return type === 'expense' ? 'อื่นๆ' : 'รายได้อื่นๆ'
}
