import type { TransactionType } from '@/types'

interface CategoryRule {
  name: string
  keywords: string[]
}

const EXPENSE_RULES: CategoryRule[] = [
  {
    name: 'อาหาร',
    keywords: [
      'grabfood','line man','lineman','foodpanda','robinhood','delivery','tops daily',
      'ข้าวเย็น','ข้าวกลางวัน','ข้าวเช้า','อาหารตามสั่ง','ข้าวแกง','ข้าวกล่อง',
      'ข้าวหมูแดง','ข้าวขาหมู','ขนมปัง','กาแฟสด','bubble tea','after you','breadtalk',
      'กิน','ข้าว','อาหาร','ก๋วยเตี๋ยว','บะหมี่','ราดหน้า','ผัด','ต้ม','แกง','ลาบ','ยำ',
      'ส้มตำ','หมูกะทะ','ชาบู','สุกี้','บุฟเฟ่ต์','ปิ้งย่าง','หมูทอด','ไก่ทอด','ไก่ย่าง',
      'กาแฟ','cafe','coffee','ชา','นม','ขนม','เบเกอรี่','pizza','burger','ส้มตำ',
      'mcdonald','kfc','7-eleven','เซเว่น','โจ๊ก','ข้าวต้ม','ข้าวหน้า','ข้าวมัน',
      'ร้านอาหาร','เป็ด','หมู','ไก่','กุ้','ปลา','หอย','ทะเล','ญี่ปุ่น',
      'yayoi','fuji','mk','mk ','swensen','amazon','starbucks','sushi','ramen',
      'ก๋วย','เย็นตาโฟ','ผัดไทย','ต้มยำ','แซนวิช','sandwich','สเต็ก','สุกี้ตี๋น้อย',
      'ชานม','matcha','โกโก้','โดนัท',
    ],
  },
  {
    name: 'เดินทาง',
    keywords: [
      'grab car','easy pass','m-flow','thai vietjet','nok air','airasia',
      'วินมอไซ','เติมน้ำมัน','ค่าล้างรถ','เปลี่ยนยาง','ค่าจอด','ทางด่วน',
      'grab','bolt','taxi','แท็กซี่','แท็กซี','bts','mrt','รถไฟฟ้า','น้ำมัน',
      'ปั๊ม','shell','ptt','esso','caltex','จอดรถ','ค่าทาง','expressway','tollway',
      'ค่ารถ','รถโดยสาร','bus','รถเมล์','มอเตอร์ไซ','winbike','เดินทาง',
      'สนามบิน','airport','ตั๋ว','ticket','lyft','indriver','วิน','มอไซ',
      'รถตู้','รถไฟ','srt','แก๊ส','gas','ngv','lpg','parking','ล้างรถ','ยางรถ',
    ],
  },
  {
    name: 'ค่าเช่า',
    keywords: [
      'room rent','ค่าห้อง','ค่าบ้าน','ห้องพัก','ห้องเช่า','ค่าส่วนกลาง',
      'นิติบุคคล','ประกันห้อง','มัดจำห้อง','ค่าที่พัก','ค่าโรงแรม',
      'ค่าเช่า','เช่าห้อง','เช่า','ที่พัก','โรงแรม','hotel','airbnb',
      'หอพัก','คอนโด','อพาร์ทเมนต์','อพาร์ตเมนต์',
      'rent','apartment','condo','นิติ','booking','agoda',
    ],
  },
  {
    name: 'ชอปปิง',
    keywords: [
      'tiktok shop','ของใช้ในบ้าน','เครื่องใช้ไฟฟ้า','shopee','lazada','tiktok',
      'supermarket','watsons','eveandboy','beautrium','homepro','powerbuy',
      'เสื้อยืด','ของขวัญ','ชอปปิง','shopping','shop','เสื้อ','กางเกง','รองเท้า','กระเป๋า',
      'uniqlo','h&m','zara','central','siam','paragon','emquartier','iconsiam',
      'lotus','bigc','tops','makro','เซ็นทรัล','แฟชั่น','แต่งตัว',
      'เสื้อผ้า','ของใช้','ของตกแต่ง','เครื่องสำอาง','skincare','ครีม',
      'ออนไลน์','online','grocery','boots','muji','ikea','banana','jib','advice',
      'ชุด','gift',
    ],
  },
  {
    name: 'สุขภาพ',
    keywords: [
      'boots pharmacy','ตรวจสุขภาพ','ตรวจเลือด','ประกันสุขภาพ','คอนแทคเลนส์',
      'ขูดหินปูน','หาหมอ','ค่ายา','ร้านยา','ตัดแว่น','หมอฟัน','ทำฟัน',
      'หมอ','โรงพยาบาล','โรงบาล','คลินิก','clinic','hospital','ยา','วิตามิน',
      'vitamin','ออกกำลัง','gym','ฟิตเนส','fitness','ทันตกรรม','ฟัน','ตรวจ',
      'ตรวจร่างกาย','สุขภาพ','โปรตีน','protein','supplement','สเกล','สายตา',
      'เภสัช','xray','x-ray','วัคซีน','แว่น','เลนส์','กายภาพ','physio','fitwhey','whey',
    ],
  },
  {
    name: 'บันเทิง',
    keywords: [
      'youtube premium','prime video','apple music','ticketmelon','thaiticket',
      'dream world','playstation','subscription','disney+','ไปเที่ยว','คาเฟ่เที่ยว',
      'ดูบอล','สวนสนุก',
      'หนัง','ดูหนัง','คอนเสิร์ต','concert','เที่ยว','netflix','spotify',
      'youtube','game','เกม','บันเทิง','karaoke','คาราโอเกะ','บาร์','bar',
      'เบียร์','เหล้า','ไวน์','สังสรรค์','ปาร์ตี้','party','ป๊อปคอร์น',
      'กิจกรรม','ท่องเที่ยว','รีสอร์ท','resort','ทะเล','ภูเขา',
      'steam','psn','nintendo','xbox','disney','บอล','คอน','event','ทริป','สวนน้ำ',
    ],
  },
  {
    name: 'การศึกษา',
    keywords: [
      'frontend masters','future skill','เรียนออนไลน์','หนังสือเรียน','ค่าสอบ',
      'ภาษาอังกฤษ','certificate','codecademy','pluralsight',
      'คอร์ส','course','เรียน','หนังสือ','book','udemy','coursera',
      'การศึกษา','โรงเรียน','มหาวิทยาลัย','ค่าเทอม','ค่าเรียน',
      'workshop','seminar','training','อบรม','ตำรา','สอบ','ielts','toeic','toefl',
      'cert','bootcamp','ติว','skilllane','datacamp','masterclass','สัมมนา',
    ],
  },
  {
    name: 'ค่าสาธารณูปโภค',
    keywords: [
      'ค่าเน็ตบ้าน','true online','ais fibre','google one','บิลค่าไฟ','บิลค่าน้ำ',
      'เน็ตบ้าน','ค่าแพ็กเกจ',
      'ค่าไฟ','ค่าน้ำ','ค่าน้ำไฟ','น้ำไฟ','อินเทอร์เน็ต','internet','wifi',
      'ค่าโทรศัพท์','มือถือ','ais','dtac','true','nt','ค่าโทร',
      'ค่าบริการ','ค่าอินเทอร์','broadband',
      'บิล','mea','pea','mwa','pwa','ค่าเน็ต','fiber','3bb','โทรศัพท์',
      'รายเดือน','แพ็กเกจ','postpaid','cloudflare','icloud',
    ],
  },
]

const INCOME_RULES: CategoryRule[] = [
  {
    name: 'เงินเดือน',
    keywords: [
      'เงินเดือน','salary','โบนัส','bonus','ค่าจ้าง','เงินปลายเดือน',
      'payroll','wage','เงินเข้า','ค่าตอบแทน','ot','โอที','commission',
      'คอมมิชชั่น','allowance','เบี้ยเลี้ยง',
    ],
  },
  {
    name: 'ลงทุน',
    keywords: [
      'capital gain','mutual fund','กำไรหุ้น','ขายหุ้น','ปันผล','dividend',
      'กองทุน','หุ้น','crypto','ดอกเบี้ย','ssf','rmf','ลงทุน',
      'interest','yield','bond','พันธบัตร','คริปโต','bitcoin','btc','eth',
    ],
  },
  {
    name: 'อื่นๆ (รับ)',
    keywords: [
      'gift money','ขายของออนไลน์','ลูกหนี้คืน','ขายมือสอง','คืนเงิน',
      'refund','cashback','เงินคืน','ยืมคืน','ค่าคอม',
      'freelance','ฟรีแลนซ์','รับงาน','project','ค่างาน','ออกแบบ','เว็บ','โปรแกรม',
    ],
  },
  {
    name: 'อื่นๆ (รับ)',
    keywords: [
      'ขายของ','ขาย','shopee','lazada','facebook','รับเงิน','ได้รับ','รางวัล',
      'ของขวัญ','tip','ทิป',
    ],
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

  return type === 'expense' ? 'อื่นๆ (จ่าย)' : 'อื่นๆ (รับ)'
}
