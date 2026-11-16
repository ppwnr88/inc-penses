import { z } from 'zod'

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models'
const responseSchema = z.object({ candidates: z.array(z.object({ content: z.object({ parts: z.array(z.object({ text: z.string().optional(), thought: z.boolean().optional() })) }) })).min(1) })
const slipSchema = z.object({ amount: z.union([z.number(), z.string()]), note: z.string().nullish(), date: z.string().nullish(), error: z.string().optional() })

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
    generationConfig: { maxOutputTokens: 4096, responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'low' } },
  }

  let parsed: z.infer<typeof slipSchema> | undefined
  for (const [model, timeout] of [['gemini-3.8-flash', 10000], ['gemini-3.5-flash-lite', 20000]] as const) {
    try {
      const res = await fetch(`${GEMINI_API}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeout),
      })
      if (!res.ok) throw new Error(`GEMINI_${res.status}`)
      const data = responseSchema.parse(await res.json())
      const text = data.candidates[0].content.parts.filter(part => !part.thought).map(part => part.text ?? '').join('')
      const candidate = slipSchema.parse(JSON.parse(text))
      const candidateAmount = Number(String(candidate.amount).replace(/,/g, ''))
      if (candidate.error || !Number.isFinite(candidateAmount) || candidateAmount <= 0) throw new Error('GEMINI_BAD_RESULT')
      parsed = candidate
      break
    } catch {
      console.warn(`[gemini] ${model} unavailable or returned invalid data`)
    }
  }
  if (!parsed) throw new Error('GEMINI_UNAVAILABLE')
  const amount = Number(String(parsed.amount).replace(/,/g, ''))

  let date: string | undefined
  const match = parsed.date?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) {
    const year = Number(match[1]) >= 2400 ? Number(match[1]) - 543 : Number(match[1])
    const candidate = `${year}-${match[2]}-${match[3]}`
    const check = new Date(`${candidate}T00:00:00Z`)
    const currentYear = new Date().getUTCFullYear()
    if (year >= currentYear - 1 && year <= currentYear + 1 && !Number.isNaN(check.valueOf()) && check.toISOString().slice(0, 10) === candidate) date = candidate
  }

  return {
    amount,
    note: parsed.note?.trim().slice(0, 60) || 'slip โอนเงิน',
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
