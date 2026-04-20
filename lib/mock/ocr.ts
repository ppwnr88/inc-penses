export interface OcrResult {
  amount?: number
  merchant?: string
  date?: string
  rawText: string
}

export async function processReceiptImage(imageFile: File): Promise<OcrResult> {
  // TODO: Integrate with Google Vision API, AWS Textract, or Thai OCR service
  console.log('[OCR] Mock: processing image', imageFile.name)
  await new Promise(r => setTimeout(r, 1500))
  return {
    amount: undefined,
    merchant: undefined,
    date: undefined,
    rawText: 'Mock OCR result — integrate real OCR service',
  }
}
