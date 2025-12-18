// Simple translation service using Google Translate API
// Note: For production, consider using a caching layer to reduce API calls

const GOOGLE_TRANSLATE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

// In-memory cache to avoid repeated translations
const translationCache = new Map<string, string>();

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'gsw'
): Promise<string> {
  // Create cache key
  const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`;
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // If source and target are the same, return original
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    // Call our API route instead of directly calling Google
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.translatedText;

    // Cache the result
    translationCache.set(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

// Map language codes to Google Translate API codes
export const languageCodeMap: { [key: string]: string } = {
  'gsw': 'de', // Swiss German -> German (closest match)
  'de': 'de',
  'fr': 'fr',
  'it': 'it',
  'rm': 'de', // Romansh -> German (fallback)
  'en': 'en'
};

export function getGoogleLanguageCode(appLanguageCode: string): string {
  return languageCodeMap[appLanguageCode] || 'en';
}

// Batch translation function for multiple texts
export async function translateBatch(
  texts: string[],
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string[]> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return texts;
  }

  const googleTargetLang = getGoogleLanguageCode(targetLanguage);
  
  return Promise.all(
    texts.map(text => translateText(text, googleTargetLang, sourceLanguage))
  );
}
