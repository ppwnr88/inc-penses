export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // TODO: Integrate with Web Speech API or Whisper API
  console.log('[Speech] Mock: transcribing audio', audioBlob.size, 'bytes')
  await new Promise(r => setTimeout(r, 1000))
  return ''
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
}

export function startSpeechRecognition(
  onResult: (text: string) => void,
  onError: (error: string) => void
): (() => void) | null {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser')
    return null
  }

  // TODO: Implement real-time speech recognition using Web Speech API
  // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  // const recognition = new SpeechRecognition()
  // recognition.lang = 'th-TH'
  // recognition.continuous = false
  // recognition.interimResults = false
  // recognition.onresult = (event) => { onResult(event.results[0][0].transcript) }
  // recognition.onerror = (event) => { onError(event.error) }
  // recognition.start()
  // return () => recognition.stop()

  onError('Mock mode — real speech recognition not integrated')
  return null
}
