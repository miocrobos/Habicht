// Club name normalization and matching utility
// Handles variations in club names (spacing, language, abbreviations)

export interface ClubMatch {
  id: string
  name: string
  shortName?: string
  logo?: string
  similarity: number
}

/**
 * Normalize club name for matching
 * - Remove extra spaces, dots, dashes
 * - Convert to uppercase
 * - Handle common abbreviations
 */
export function normalizeClubName(name: string): string {
  if (!name) return ''
  
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ')           // Multiple spaces to single
    .replace(/\./g, '')             // Remove dots
    .replace(/-/g, ' ')             // Dashes to spaces
    .replace(/'/g, '')              // Remove apostrophes
    .replace(/È/g, 'E')
    .replace(/É/g, 'E')
    .replace(/Ê/g, 'E')
    .replace(/Ë/g, 'E')
    .replace(/À/g, 'A')
    .replace(/Á/g, 'A')
    .replace(/Â/g, 'A')
    .replace(/Ä/g, 'A')
    .replace(/Ö/g, 'O')
    .replace(/Ü/g, 'U')
    .replace(/Ç/g, 'C')
}

/**
 * Common club name variations and abbreviations
 */
const CLUB_VARIATIONS: Record<string, string[]> = {
  'VBC': ['VOLLEYBALL CLUB', 'VOLLEY BALL CLUB', 'VOLLEY CLUB'],
  'VOLLEYBALL CLUB': ['VBC'],
  'VOLLEY': ['VOLLEYBALL'],
  'VOLLEYBALL': ['VOLLEY'],
  'UC': ['UNIVERSITE CLUB', 'UNIVERSITY CLUB'],
  'GENEVE': ['GENF', 'GENEVA'],
  'GENF': ['GENEVE', 'GENEVA'],
  'BALE': ['BASEL', 'BASLE'],
  'BASEL': ['BALE', 'BASLE'],
  'ZURICH': ['ZUERICH', 'ZURICH'],
  'LUZERN': ['LUCERNE'],
  'LUCERNE': ['LUZERN'],
  'BERN': ['BERNE'],
  'BERNE': ['BERN'],
}

/**
 * Calculate similarity score between two normalized club names
 * Returns a score from 0 (no match) to 1 (exact match)
 */
export function calculateSimilarity(name1: string, name2: string): number {
  const norm1 = normalizeClubName(name1)
  const norm2 = normalizeClubName(name2)
  
  // Exact match
  if (norm1 === norm2) return 1.0
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    const longer = Math.max(norm1.length, norm2.length)
    const shorter = Math.min(norm1.length, norm2.length)
    return shorter / longer * 0.95
  }
  
  // Check for variation matches
  const words1 = norm1.split(' ')
  const words2 = norm2.split(' ')
  
  let matchingWords = 0
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) {
        matchingWords++
        break
      }
      // Check variations
      const variations1 = CLUB_VARIATIONS[word1] || []
      const variations2 = CLUB_VARIATIONS[word2] || []
      if (variations1.includes(word2) || variations2.includes(word1)) {
        matchingWords += 0.8
        break
      }
    }
  }
  
  const totalWords = Math.max(words1.length, words2.length)
  return matchingWords / totalWords * 0.9
}

/**
 * Find matching clubs from a list based on search query
 * Returns clubs sorted by similarity score
 */
export function findMatchingClubs(
  searchQuery: string,
  clubs: Array<{ id: string; name: string; shortName?: string; logo?: string }>,
  threshold: number = 0.3
): ClubMatch[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return []
  }
  
  const matches: ClubMatch[] = []
  
  for (const club of clubs) {
    // Calculate similarity with main name
    const nameSimilarity = calculateSimilarity(searchQuery, club.name)
    
    // Calculate similarity with short name if available
    const shortNameSimilarity = club.shortName 
      ? calculateSimilarity(searchQuery, club.shortName)
      : 0
    
    // Use the higher similarity score
    const similarity = Math.max(nameSimilarity, shortNameSimilarity)
    
    if (similarity >= threshold) {
      matches.push({
        id: club.id,
        name: club.name,
        shortName: club.shortName,
        logo: club.logo,
        similarity
      })
    }
  }
  
  // Sort by similarity (highest first)
  return matches.sort((a, b) => b.similarity - a.similarity)
}

/**
 * Find the best matching club (highest similarity)
 */
export function findBestMatch(
  searchQuery: string,
  clubs: Array<{ id: string; name: string; shortName?: string; logo?: string }>,
  minThreshold: number = 0.5
): ClubMatch | null {
  const matches = findMatchingClubs(searchQuery, clubs, minThreshold)
  return matches.length > 0 ? matches[0] : null
}
