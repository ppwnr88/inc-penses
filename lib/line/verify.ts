import { createHmac } from 'crypto'

export function verifyLineSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET?.trim()
  if (!secret) {
    console.log('[verify] LINE_CHANNEL_SECRET missing')
    return false
  }
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  const match = expected === signature
  console.log('[verify] secret_len:', secret.length, 'body_len:', rawBody.length, 'match:', match)
  if (!match) {
    console.log('[verify] expected prefix:', expected.slice(0, 12), 'got:', signature.slice(0, 12))
  }
  return match
}
