'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface TranslateProps {
  text: string
  sourceLanguage?: string
  as?: keyof JSX.IntrinsicElements
  className?: string
  children?: never
}

/**
 * Auto-translate component using Google Translate API
 * Usage: <Translate text="Hello World" />
 * Or: <Translate text="Hello" as="h1" className="text-xl" />
 */
export default function Translate({ 
  text, 
  sourceLanguage = 'en', 
  as: Component = 'span',
  className 
}: TranslateProps) {
  const { language, translate } = useLanguage()
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const performTranslation = async () => {
      // Skip if language is English (source)
      if (language === 'en') {
        setTranslatedText(text)
        return
      }

      setIsLoading(true)
      try {
        const result = await translate(text, sourceLanguage)
        if (isMounted) {
          setTranslatedText(result)
        }
      } catch (error) {
        console.error('Translation error:', error)
        if (isMounted) {
          setTranslatedText(text) // Fallback to original
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    performTranslation()

    return () => {
      isMounted = false
    }
  }, [text, language, sourceLanguage, translate])

  return (
    <Component className={className}>
      {isLoading ? text : translatedText}
    </Component>
  )
}
