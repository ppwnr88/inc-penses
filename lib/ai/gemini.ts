const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'

export interface SlipResult {
  amount: number
  note: string
  date?: string      // YYYY-MM-DD
  type: 'expense'
}

export async function readSlipWithGemini(imageBuffer: Buffer, mimeType = 'image/jpeg'): Promise<SlipResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.log('[gemini] GEMINI_API_KEY not set')
    return null
  }

  console.log('[gemini] sending image, size:', imageBuffer.length, 'mime:', mimeType)
  const base64 = imageBuffer.toString('base64')

  const prompt = `Look at this Thai payment slip image. Extract:
- amount: the exact transferred amount as a number. IMPORTANT: preserve decimal point (e.g. "700.00" → 700, "1,234.50" → 1234.5, "70,000" → 70000). Remove commas only, keep decimals. Do NOT remove the decimal point.
- note: ONLY the recipient name (short, e.g. "นางสาว วรรณรัตน์" or "Payment to Shopee"), max 30 chars
- date: the transaction date converted to Gregorian YYYY-MM-DD (Thai year is Buddhist Era = Gregorian+543, so ปี 2569 = 2026, ปี 69 = 2026)

Reply ONLY with JSON, no explanation:
{"amount": <number>, "note": "<short recipient name>", "date": "<YYYY-MM-DD>"}
If not a payment slip, reply: {"error": "not_a_slip"}`

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64 } },
      ],
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 1024 },
  }

  let res: Response | null = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (err) {
      if (attempt === 3) throw new Error(`GEMINI_FETCH: ${err}`)
      await new Promise(r => setTimeout(r, attempt * 1500))
      continue
    }
    if (res.status === 503 || res.status === 429) {
      if (attempt === 3) throw new Error(`GEMINI_${res.status}: overloaded`)
      await new Promise(r => setTimeout(r, attempt * 2000))
      continue
    }
    break
  }

  if (!res || !res.ok) {
    const errBody = res ? await res.text() : 'no response'
    throw new Error(`GEMINI_${res?.status ?? 0}: ${errBody.slice(0, 200)}`)
  }

  const data = await res.json() as { candidates?: { content: { parts: { text: string }[] } }[] }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  const jsonMatch = text.match(/\{[\s\S]*?\}/)
  if (!jsonMatch) throw new Error(`GEMINI_NO_JSON: ${text.slice(0, 100)}`)

  const parsed = JSON.parse(jsonMatch[0]) as { error?: string; amount?: number | string; note?: string; date?: string }
  if (parsed.error) throw new Error(`GEMINI_NOT_SLIP: ${parsed.error}`)
  if (parsed.amount === undefined || parsed.amount === null) throw new Error('GEMINI_NO_AMOUNT')

  const amount = Number(String(parsed.amount).replace(/,/g, ''))
  if (!amount || amount <= 0) throw new Error(`GEMINI_BAD_AMOUNT: ${parsed.amount}`)

  // Validate date — reject if year is unreasonably old (Gemini sometimes miscalculates BE→CE)
  let date: string | undefined
  if (parsed.date && parsed.date !== 'null') {
    const year = parseInt(parsed.date.slice(0, 4))
    const currentYear = new Date().getFullYear()
    date = (year >= currentYear - 1 && year <= currentYear + 1) ? parsed.date : undefined
  }

  return {
    amount,
    note: (parsed.note ?? 'slip โอนเงิน').slice(0, 60),
    date,
    type: 'expense',
  }
}

export async function downloadLineImage(messageId: string): Promise<{ buffer: Buffer; mimeType: string }> {
  console.log('[line] downloading image:', messageId)
  const res = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
  })
  if (!res.ok) throw new Error(`LINE image download failed: ${res.status}`)
  const mimeType = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0].trim()
  const buffer = Buffer.from(await res.arrayBuffer())
  console.log('[line] downloaded, size:', buffer.length, 'type:', mimeType)
  return { buffer, mimeType }
}
