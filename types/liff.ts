export interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export interface LiffContext {
  type: 'utou' | 'room' | 'group' | 'square_chat' | 'external' | 'none' | 'unknown'
  utouId?: string
  roomId?: string
  groupId?: string
  squareChatId?: string
}

export interface LiffOs {
  os: 'ios' | 'android' | 'web'
  lineVersion?: string
}

export interface AuthState {
  isInitialized: boolean
  isLoggedIn: boolean
  profile: import('./index').Profile | null
  lineProfile: LiffProfile | null
  loading: boolean
  error: string | null
}
