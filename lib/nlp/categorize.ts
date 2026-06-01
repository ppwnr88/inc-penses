import type { TransactionType } from '@/types'

interface CategoryRule {
  name: string
  keywords: string[]
}

interface TrieMatch {
  name: string
  keywordLength: number
  ruleIndex: number
}

interface TrieNode {
  children: Map<string, TrieNode>
  matches: TrieMatch[]
}

const EXPENSE_RULES: CategoryRule[] = [
  {
    name: 'อาหาร',
    keywords: [
      'grabfood','line man','lineman','foodpanda','robinhood','delivery',
      'tops daily','ข้าวเย็น','ข้าวกลางวัน','ข้าวเช้า','อาหารตามสั่ง','ข้าวแกง',
      'ข้าวกล่อง','ข้าวหมูแดง','ข้าวขาหมู','ขนมปัง','กาแฟสด','bubble tea',
      'after you','breadtalk','กิน','ข้าว','อาหาร','ก๋วยเตี๋ยว',
      'บะหมี่','ราดหน้า','ผัด','ต้ม','แกง','ลาบ',
      'ยำ','ส้มตำ','หมูกะทะ','ชาบู','สุกี้','บุฟเฟ่ต์',
      'ปิ้งย่าง','หมูทอด','ไก่ทอด','ไก่ย่าง','กาแฟ','cafe',
      'coffee','ชา','นม','ขนม','เบเกอรี่','pizza',
      'burger','ส้มตำ','mcdonald','kfc','7-eleven','เซเว่น',
      'โจ๊ก','ข้าวต้ม','ข้าวหน้า','ข้าวมัน','ร้านอาหาร','เป็ด',
      'หมู','ไก่','กุ้','ปลา','หอย','ทะเล',
      'ญี่ปุ่น','yayoi','fuji','mk','mk ','swensen',
      'amazon','starbucks','sushi','ramen','ก๋วย','เย็นตาโฟ',
      'ผัดไทย','ต้มยำ','แซนวิช','sandwich','สเต็ก','สุกี้ตี๋น้อย',
      'ชานม','matcha','โกโก้','โดนัท','ข้าวเหนียว','ข้าวผัด',
      'ข้าวไข่เจียว','ข้าวหมูกรอบ','ข้าวมันไก่','อาหารเช้า','อาหารเย็น','อาหารกลางวัน',
      'ของกิน','กับข้าว','ข้าวราดแกง','อาหารคลีน','สลัด','สลัดผัก',
      'ซูชิ','ราเมง','หมาล่า','หม่าล่า','ติ่มซำ','ขนมจีบ',
      'ซาลาเปา','ข้าวซอย','ข้าวหน้าเป็ด','ข้าวหน้าหมู','ข้าวหน้าไก่','ข้าวกะเพรา',
      'กะเพรา','ผัดซีอิ๊ว','ผัดกะเพรา','ผัดกะหล่ำ','แกงเขียวหวาน','แกงส้ม',
      'แกงจืด','แกงกะหรี่','ต้มข่า','ต้มเล้ง','ต้มเลือดหมู','บิงซู',
      'ไอศกรีม','ไอติม','เค้ก','ครัวซองต์','croissant','bakery',
      'dessert','ช็อกโกแลต','ช็อคโกแลต','น้ำปั่น','น้ำผลไม้','ชาไทย',
      'ชาเขียว','americano','latte','cappuccino','espresso','nescafe',
      'black canyon','au bon pain','bonchon','texas chicken','burger king','pizza company',
      'domino','sizzler','bar b q plaza','barbq','oishi','shinkanzen',
      'zen','pepper lunch','subway','auntie anne','krispy kreme','dairy queen',
      'mr donut','potato corner','food court','ฟู้ดคอร์ท','ตลาดนัด',
    ],
  },
  {
    name: 'เดินทาง',
    keywords: [
      'grab car','easy pass','m-flow','thai vietjet','nok air','airasia',
      'วินมอไซ','เติมน้ำมัน','ค่าล้างรถ','เปลี่ยนยาง','ค่าจอด','ทางด่วน',
      'grab','bolt','taxi','แท็กซี่','แท็กซี','bts',
      'mrt','รถไฟฟ้า','น้ำมัน','ปั๊ม','shell','ptt',
      'esso','caltex','จอดรถ','ค่าทาง','expressway','tollway',
      'ค่ารถ','รถโดยสาร','bus','รถเมล์','มอเตอร์ไซ','winbike',
      'เดินทาง','สนามบิน','airport','ตั๋ว','ticket','lyft',
      'indriver','วิน','มอไซ','รถตู้','รถไฟ','srt',
      'แก๊ส','gas','ngv','lpg','parking','ล้างรถ',
      'ยางรถ','ค่าแท็กซี่','ค่า grab','ค่า bolt','grabtaxi','grab bike',
      'grabcar','muvmi','cabb','all thai taxi','รถสองแถว','เรือ',
      'เรือด่วน','เรือข้ามฟาก','ทางพิเศษ','ค่าทางด่วน','ค่าผ่านทาง','ค่าที่จอด',
      'parking fee','เติมแก๊ส','น้ำมันเครื่อง','ซ่อมรถ','ตรวจสภาพรถ','ต่อภาษีรถ',
      'พรบ','ประกันรถ','ล้างอัดฉีด','เช่ารถ','rent car','car rental',
      'รถเช่า','ตั๋วเครื่องบิน','เครื่องบิน','flight','air ticket','thai airways',
      'bangkok airways','vietjet','lion air','รถทัวร์','รถบัส','นครชัยแอร์',
      'บขส','เดินทางไป','ขนส่ง','ขนส่งสาธารณะ','commute','fare',
      'ค่าโดยสาร',
    ],
  },
  {
    name: 'ค่าเช่า',
    keywords: [
      'room rent','ค่าห้อง','ค่าบ้าน','ห้องพัก','ห้องเช่า','ค่าส่วนกลาง',
      'นิติบุคคล','ประกันห้อง','มัดจำห้อง','ค่าที่พัก','ค่าโรงแรม','ค่าเช่า',
      'เช่าห้อง','เช่า','ที่พัก','โรงแรม','hotel','airbnb',
      'หอพัก','คอนโด','อพาร์ทเมนต์','อพาร์ตเมนต์','rent','apartment',
      'condo','นิติ','booking','agoda','ค่าเช่าบ้าน','ค่าเช่าคอนโด',
      'ค่าเช่าหอ','ค่าเช่าออฟฟิศ','office rent','ค่าเช่าที่','ค่าเช่าพื้นที่','ค่าเช่าร้าน',
      'ค่าเช่ารายเดือน','ค่าเช่ารายวัน','ค่าเช่ารายปี','ค่าเช่าโกดัง','โกดัง','warehouse rent',
      'ค่ามัดจำ','deposit','ค่าประกัน','lease','leasing','property',
      'ห้องรายวัน','ที่พักรายวัน','hostel','mansion','serviced apartment',
    ],
  },
  {
    name: 'ชอปปิง',
    keywords: [
      'tiktok shop','ของใช้ในบ้าน','เครื่องใช้ไฟฟ้า','shopee','lazada','tiktok',
      'supermarket','watsons','eveandboy','beautrium','homepro','powerbuy',
      'เสื้อยืด','ของขวัญ','ชอปปิง','shopping','shop','เสื้อ',
      'กางเกง','รองเท้า','กระเป๋า','uniqlo','h&m','zara',
      'central','siam','paragon','emquartier','iconsiam','lotus',
      'bigc','tops','makro','เซ็นทรัล','แฟชั่น','แต่งตัว',
      'เสื้อผ้า','ของใช้','ของตกแต่ง','เครื่องสำอาง','skincare','ครีม',
      'ออนไลน์','online','grocery','boots','muji','ikea',
      'banana','jib','advice','ชุด','gift','ซื้อของ',
      'ของใช้ส่วนตัว','ของใช้ประจำวัน','เครื่องครัว','เครื่องนอน','ผ้าปู','หมอน',
      'ผ้าห่ม','เฟอร์นิเจอร์','furniture','โต๊ะ','เก้าอี้','ตู้',
      'ชั้นวาง','เครื่องซักผ้า','ตู้เย็น','แอร์','พัดลม','iphone',
      'ipad','macbook','notebook','laptop','computer','คอม',
      'เมาส์','keyboard','คีย์บอร์ด','หูฟัง','earphone','airpods',
      'charger','สายชาร์จ','เคส','ฟิล์ม','powerbank','เครื่องเขียน',
      'ปากกา','สมุด','กระดาษ','printer','หมึกพิมพ์','น้ำหอม',
      'perfume','makeup','ลิป','แป้ง','รองพื้น','สบู่',
      'แชมพู','ยาสีฟัน','แปรงสีฟัน','ผงซักฟอก','น้ำยาปรับผ้านุ่ม','น้ำยาล้างจาน',
      'daiso','miniso','mr diy','office mate','b2s','supersports',
      'โซฟา','ที่นอน','ผ้าม่าน','ตู้เสื้อผ้า','เครื่องอบผ้า','ไมโครเวฟ',
      'เตาไฟฟ้า','หม้อ','กระทะ','จาน','ชาม','ช้อน',
      'ส้อม','thaiwatsadu','บุญถาวร','sb design square','index living mall','apple',
      'imac','apple watch','samsung','xiaomi','oppo','vivo',
      'สมาร์ทโฟน','tablet','แท็บเล็ต','pc','จอ','monitor',
      'mouse','scanner','airtag','it city','power mall','อาหารหมา',
      'อาหารแมว','dog food','cat food','royal canin','smartheart','pedigree',
      'me-o','whiskas','jerhigh','โรงพยาบาลสัตว์','คลินิกสัตว์','วัคซีนหมา',
      'วัคซีนแมว','อาบน้ำหมา','ตัดขน','pet','pet shop','pet lover',
      'ทรายแมว','ของเล่นสัตว์','pet club','นมผง','แพมเพิส','ผ้าอ้อม',
      'ของเล่นเด็ก','baby','kids',
      'babyshop','mothercare','ละมุนเบบี้',
    ],
  },
  {
    name: 'สุขภาพ',
    keywords: [
      'boots pharmacy','ตรวจสุขภาพ','ตรวจเลือด','ประกันสุขภาพ','คอนแทคเลนส์','ขูดหินปูน',
      'หาหมอ','ค่ายา','ร้านยา','ตัดแว่น','หมอฟัน','ทำฟัน',
      'หมอ','โรงพยาบาล','โรงบาล','คลินิก','clinic','hospital',
      'ยา','วิตามิน','vitamin','ออกกำลัง','gym','ฟิตเนส',
      'fitness','ทันตกรรม','ฟัน','ตรวจ','ตรวจร่างกาย','สุขภาพ',
      'โปรตีน','protein','supplement','สเกล','สายตา','เภสัช',
      'xray','x-ray','วัคซีน','แว่น','เลนส์','กายภาพ',
      'physio','fitwhey','whey','แพทย์','แพทย์เฉพาะทาง','เวชภัณฑ์',
      'อุปกรณ์การแพทย์','ค่ารักษา','ตรวจฟัน','อุดฟัน','ถอนฟัน','จัดฟัน',
      'รีเทนเนอร์','รากฟัน','ฟอกสีฟัน','แปรงสีฟันไฟฟ้า','น้ำยาบ้วนปาก','ยาแก้ปวด',
      'ยาแก้แพ้','ยาแก้ไอ','ยาลดไข้','พารา','paracetamol','ibuprofen',
      'mask','หน้ากากอนามัย','atk','insurance','life insurance','นวด',
      'นวดแผนไทย','กายภาพบำบัด','ตรวจตา','eye test','แว่นตา','contact lens',
      'คอนแทค','อาหารเสริม','เวย์','คอลลาเจน','collagen','คลินิกผิว',
      'ผิวหนัง','เลเซอร์','dermatology','ประกันชีวิต','ประกันรถ','ประกันบ้าน',
      'ประกันอัคคีภัย','aia','axa','fwd','allianz','เมืองไทยประกันชีวิต',
      'ไทยประกันชีวิต','viriyah','วิริยะ','กรุงเทพประกันภัย','muang thai life','ocean life',
    ],
  },
  {
    name: 'บันเทิง',
    keywords: [
      'youtube premium','prime video','apple music','ticketmelon','thaiticket','dream world',
      'playstation','subscription','disney+','ไปเที่ยว','คาเฟ่เที่ยว','ดูบอล',
      'สวนสนุก','หนัง','ดูหนัง','คอนเสิร์ต','concert','เที่ยว',
      'netflix','spotify','youtube','game','เกม','บันเทิง',
      'karaoke','คาราโอเกะ','บาร์','bar','เบียร์','เหล้า',
      'ไวน์','สังสรรค์','ปาร์ตี้','party','ป๊อปคอร์น','กิจกรรม',
      'ท่องเที่ยว','รีสอร์ท','resort','ทะเล','ภูเขา','steam',
      'psn','nintendo','xbox','disney','บอล','คอน',
      'event','ทริป','สวนน้ำ','โรงหนัง','cinema','major',
      'sf cinema','netflix premium','viu','iqiyi','wetv','hbo',
      'max','monomax','apple tv','true id','ดูซีรีส์','ซีรีส์',
      'ละคร','เพลง','music','joox','soundcloud','เกมมือถือ',
      'rov','genshin','valorant','เติมเกม','เกม steam','board game',
      'บอร์ดเกม','escape room','bowling','โบว์ลิ่ง','สวนสัตว์','พิพิธภัณฑ์',
      'museum','นิทรรศการ','exhibition','งานแฟร์','fair','เทศกาล',
      'festival','คาเฟ่','ร้านนั่งชิล','pub','club','nightlife',
      'พูลวิลล่า','pool villa','ที่เที่ยว','ค่าเข้า','บัตรเข้า','บัตรคอน',
    ],
  },
  {
    name: 'การศึกษา',
    keywords: [
      'frontend masters','future skill','เรียนออนไลน์','หนังสือเรียน','ค่าสอบ','ภาษาอังกฤษ',
      'certificate','codecademy','pluralsight','คอร์ส','course','เรียน',
      'หนังสือ','book','udemy','coursera','การศึกษา','โรงเรียน',
      'มหาวิทยาลัย','ค่าเทอม','ค่าเรียน','อนุบาล','ค่าเรียนลูก','workshop','seminar','training',
      'อบรม','ตำรา','สอบ','ielts','toeic','toefl',
      'cert','bootcamp','ติว','skilllane','datacamp','masterclass',
      'สัมมนา','เรียนพิเศษ','ติวเตอร์','ค่าอบรม','อบรมออนไลน์','เรียนภาษา',
      'เรียนเขียนโปรแกรม','coding','programming','javascript','typescript','react',
      'nodejs','nestjs','sql','database','docker',
      'devops','ai course','chatgpt course','คอร์สออนไลน์','ebook',
      'e-book','หนังสือภาษาอังกฤษ','หนังสือพัฒนา','หนังสือโปรแกรม','สอบใบ cert','aws cert',
      'microsoft cert','google cert','exam fee','ค่าใบประกาศ','ใบประกาศ','license fee',
      'github copilot','cursor',
    ],
  },
  {
    name: 'ค่าสาธารณูปโภค',
    keywords: [
      'ค่าเน็ตบ้าน','true online','ais fibre','google one','บิลค่าไฟ','บิลค่าน้ำ',
      'เน็ตบ้าน','ค่าแพ็กเกจ','ค่าไฟ','ค่าน้ำ','ค่าน้ำไฟ','น้ำไฟ',
      'อินเทอร์เน็ต','internet','wifi','ค่าโทรศัพท์','มือถือ','ais',
      'dtac','true','nt','ค่าโทร','ค่าบริการ','ค่าอินเทอร์',
      'broadband','บิล','mea','pea','mwa','pwa',
      'ค่าเน็ต','fiber','3bb','โทรศัพท์','รายเดือน','แพ็กเกจ',
      'postpaid','cloudflare','icloud','ค่าไฟฟ้า','ไฟฟ้า','น้ำประปา',
      'ประปา','ค่าแก๊สบ้าน','แก๊สหุงต้ม','gas bill','ค่าโทรรายเดือน','ค่าโทรเติมเงิน',
      'เติมเงินมือถือ','top up','prepaid','ซิม','sim','ซิมรายเดือน',
      'ais fiber','true internet','3bb fiber','nt broadband','server',
      'vps','hosting','domain','โดเมน','ssl','email hosting',
      'google workspace','microsoft 365','office 365','onedrive','dropbox','notion',
      'figma','vercel','supabase','digitalocean','ec2',
      's3','rds','route53','openai','ค่า api',
    ],
  },
  {
    name: 'อื่นๆ (จ่าย)',
    keywords: [
      'ภาษี','tax','vat','withholding tax','ค่าธรรมเนียม','fee',
      'ค่าปรับ','fine','ค่าต่อทะเบียน','ภาษีรถ','สรรพากร','กรมขนส่ง',
      'ค่าธรรมเนียมธนาคาร','bank fee','transfer fee','hosting','domain','ssl',
      'server','vps','amazon web services','ec2','s3',
      'rds','route53','cloudfront','azure','gcp','google cloud',
      'digitalocean','linode','vultr','cloudflare','vercel','railway',
      'render','supabase','firebase','mongodb atlas','openai','anthropic',
      'github','github copilot','cursor','บริจาค',
      'donate','donation','ทำบุญ','วัด','มูลนิธิ','charity',
      'red cross','สภากาชาด','โรงพยาบาลสงฆ์',
    ],
  },
]

const INCOME_RULES: CategoryRule[] = [
  {
    name: 'เงินเดือน',
    keywords: [
      'เงินเดือน','salary','โบนัส','bonus','ค่าจ้าง','เงินปลายเดือน',
      'payroll','wage','เงินเข้า','ค่าตอบแทน','ot','โอที',
      'commission','คอมมิชชั่น','allowance','เบี้ยเลี้ยง','รายได้ประจำ','รายรับประจำ',
      'เงินเดือนเข้า','เงินเดือนออก','salary payment','base salary','ค่าล่วงเวลา','incentive',
      'performance bonus','annual bonus','เบี้ยขยัน','ค่าตำแหน่ง','ค่ารถ','ค่าเดินทางบริษัท',
      'ค่าอาหารบริษัท','เงินพิเศษ','เงินชดเชย','severance','ค่าตอบแทนพิเศษ',
    ],
  },
  {
    name: 'ลงทุน',
    keywords: [
      'capital gain','mutual fund','กำไรหุ้น','ขายหุ้น','ปันผล','dividend',
      'กองทุน','หุ้น','crypto','ดอกเบี้ย','ssf','rmf',
      'ลงทุน','interest','yield','bond','พันธบัตร','คริปโต',
      'bitcoin','btc','eth','ขายกองทุน','ซื้อกองทุน','ผลตอบแทน',
      'กำไร','ขาดทุน','หุ้นปันผล','dividend income','ดอกเบี้ยเงินฝาก','เงินฝาก',
      'fixed deposit','treasury','bond yield','etf','reit','dr',
      'กอง reit','กองอสังหา','ทอง','ทองคำ','gold','ขายทอง',
      'กำไรทอง','คริปโท','binance','bitkub','satang','orbix',
      'usdt','staking','airdrop','token',
    ],
  },
  {
    name: 'อื่นๆ (รับ)',
    keywords: [
      'ขายของ','ขาย','shopee','lazada','facebook','รับเงิน',
      'ได้รับ','รางวัล','ของขวัญ','tip','ทิป','โอนคืน',
      'คืนมัดจำ','คืนค่าประกัน','ได้เงินคืน','รับโอน','เงินโอนเข้า','โอนเงินเข้า',
      'รับจาก','เพื่อนคืน','ครอบครัวโอน','พ่อโอน','แม่โอน','ยืมเงินคืน',
      'คืนหนี้','ขายของเก่า','ขายมือถือ','ขายคอม','ขายกล้อง','ขายรถ',
      'ขายทรัพย์สิน','รับจ้าง','งานนอก','side job','part time','รายได้เสริม',
      'affiliate','referral','นายหน้า','commission income','เงินรางวัล','lottery',
      'ถูกหวย','เงินช่วยเหลือ','client payment','project payment','ค่าจ้างพัฒนา','ค่าพัฒนาเว็บ',
      'ค่าพัฒนาโปรแกรม','ค่าที่ปรึกษา','consulting','software development','website','web app',
      'api','system development','รับงาน','freelance','ฟรีแลนซ์','commission',
      'คืนเงิน','refund','ยืมคืน','รับชำระหนี้','เงินกู้','loan',
      'cashback','ญาติโอน','ค่าใช้จ่ายจากครอบครัว','allowance family',
    ],
  },
]

function createTrieNode(): TrieNode {
  return {
    children: new Map(),
    matches: [],
  }
}

function buildKeywordTrie(rules: CategoryRule[]): TrieNode {
  const root = createTrieNode()

  for (const [ruleIndex, rule] of rules.entries()) {
    for (const rawKeyword of rule.keywords) {
      const keyword = rawKeyword.toLowerCase()
      if (!keyword) continue

      let node = root
      for (const char of keyword) {
        let child = node.children.get(char)
        if (!child) {
          child = createTrieNode()
          node.children.set(char, child)
        }
        node = child
      }

      node.matches.push({
        name: rule.name,
        keywordLength: keyword.length,
        ruleIndex,
      })
    }
  }

  return root
}

const EXPENSE_TRIE = buildKeywordTrie(EXPENSE_RULES)
const INCOME_TRIE = buildKeywordTrie(INCOME_RULES)

function betterMatch(current: TrieMatch | null, candidate: TrieMatch): TrieMatch {
  if (
    !current ||
    candidate.keywordLength > current.keywordLength ||
    (candidate.keywordLength === current.keywordLength && candidate.ruleIndex < current.ruleIndex)
  ) {
    return candidate
  }

  return current
}

function findBestTrieMatch(text: string, root: TrieNode): TrieMatch | null {
  let bestMatch: TrieMatch | null = null

  for (let start = 0; start < text.length; start += 1) {
    let node: TrieNode | undefined = root

    for (let index = start; index < text.length; index += 1) {
      node = node.children.get(text[index])
      if (!node) break

      for (const match of node.matches) {
        bestMatch = betterMatch(bestMatch, match)
      }
    }
  }

  return bestMatch
}

export function suggestCategory(note: string, type: TransactionType): string {
  const lower = note.toLowerCase()
  const bestMatch = findBestTrieMatch(lower, type === 'expense' ? EXPENSE_TRIE : INCOME_TRIE)

  if (bestMatch) return bestMatch.name

  return type === 'expense' ? 'อื่นๆ (จ่าย)' : 'อื่นๆ (รับ)'
}
