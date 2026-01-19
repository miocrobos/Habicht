'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translateText, getGoogleLanguageCode } from '@/lib/translate'
import { gswTranslations } from './translations/gsw'
import { deTranslations } from './translations/de'
import { frTranslations } from './translations/fr'
import { itTranslations } from './translations/it'
import { rmTranslations } from './translations/rm'
import { enTranslations } from './translations/en'

type Language = 'gsw' | 'de' | 'fr' | 'it' | 'rm' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translate: (text: string, sourceLanguage?: string) => Promise<string>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  gsw: gswTranslations,
  de: deTranslations,
  fr: frTranslations,
  it: itTranslations,
  rm: rmTranslations,
  en: enTranslations,
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('de')

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['gsw', 'de', 'fr', 'it', 'rm', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    // First try to find the key as a flat key (e.g., 'nav.players')
    const flatValue = (translations[language] as any)[key]
    if (typeof flatValue === 'string') {
      return flatValue
    }
    
    // If not found as flat key, try nested navigation (e.g., players.title)
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  // Dynamic translation using Google Translate API
  const translate = async (text: string, sourceLanguage: string = 'gsw'): Promise<string> => {
    const targetLanguageCode = getGoogleLanguageCode(language)
    return await translateText(text, targetLanguageCode, sourceLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
