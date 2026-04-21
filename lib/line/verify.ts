import { createHmac } from 'crypto'

export function verifyLineSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  return expected === signature
}
