import { readSlipWithOpenThai } from './openthai'
import { readSlipWithGemini } from './gemini'
import type { SlipResult } from './gemini'

export async function readSlip(image: Buffer, mimeType: string): Promise<SlipResult | null> {
  if (process.env.IAPP_API_KEY) {
    try {
      return await readSlipWithOpenThai(image, mimeType)
    } catch (error) {
      console.warn('[slip] OpenThai unavailable; trying Gemini', error instanceof Error ? error.name : 'Error')
    }
  }
  return readSlipWithGemini(image, mimeType)
}
