/**
 * Calculate age from date of birth
 * This correctly handles the case where the birthday hasn't occurred yet this year
 * 
 * @param dateOfBirth - Date of birth as string, Date, or null
 * @returns The calculated age, or null if dateOfBirth is not provided
 */
export function calculateAge(dateOfBirth: string | Date | null | undefined): number | null {
  if (!dateOfBirth) return null
  
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  
  // Handle invalid dates
  if (isNaN(birthDate.getTime())) return null
  
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  // If birthday hasn't occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format a date of birth for display
 * @param dateOfBirth - Date of birth as string or Date
 * @param locale - Locale for formatting (default: 'de-CH')
 * @returns Formatted date string
 */
export function formatBirthDate(dateOfBirth: string | Date | null | undefined, locale: string = 'de-CH'): string {
  if (!dateOfBirth) return '-'
  
  const date = new Date(dateOfBirth)
  if (isNaN(date.getTime())) return '-'
  
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
