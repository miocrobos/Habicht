import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_TRANSLATE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'gsw' } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      )
    }

    // Return original text if no API key
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn('Google Translate API key not configured')
      return NextResponse.json({ translatedText: text })
    }

    // If source and target are the same, return original
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({ translatedText: text })
    }

    // Call Google Translate API
    const response = await fetch(
      `${GOOGLE_TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }

    const data = await response.json()
    const translatedText = data.data.translations[0].translatedText

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    // Return original text on error
    const { text } = await request.json()
    return NextResponse.json({ translatedText: text })
  }
}
