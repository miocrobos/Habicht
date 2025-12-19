/**
 * Format a number with abbreviation for large values
 * @param num - The number to format
 * @returns Formatted string (e.g., 1234 -> "1.2K", 1500000 -> "1.5M")
 */
export function formatViewCount(num: number): string {
  if (num < 1000) {
    return num.toString()
  }
  
  if (num < 1000000) {
    const thousands = num / 1000
    return thousands % 1 === 0 
      ? `${Math.floor(thousands)}K` 
      : `${thousands.toFixed(1)}K`
  }
  
  const millions = num / 1000000
  return millions % 1 === 0 
    ? `${Math.floor(millions)}M` 
    : `${millions.toFixed(1)}M`
}
