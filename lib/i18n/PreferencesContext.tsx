'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Lang, type Translations } from './translations'

export const CURRENCIES = [
  { code: 'THB', symbol: '฿', label: 'บาท (THB)' },
  { code: 'USD', symbol: '$', label: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (JPY)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (GBP)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (SGD)' },
]

interface PreferencesContextValue {
  lang: Lang
  currency: string
  currencySymbol: string
  setLang: (lang: Lang) => void
  setCurrency: (code: string) => void
  t: Translations
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th')
  const [currency, setCurrencyState] = useState('THB')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('pref_lang') as Lang | null
    const savedCurrency = localStorage.getItem('pref_currency')
    if (savedLang && translations[savedLang]) setLangState(savedLang)
    if (savedCurrency) setCurrencyState(savedCurrency)
    setReady(true)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('pref_lang', l)
  }

  function setCurrency(code: string) {
    setCurrencyState(code)
    localStorage.setItem('pref_currency', code)
  }

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '฿'

  if (!ready) return null

  return (
    <PreferencesContext.Provider
      value={{ lang, currency, currencySymbol, setLang, setCurrency, t: translations[lang] }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
