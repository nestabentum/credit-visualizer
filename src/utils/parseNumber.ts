/**
 * Parses a German-formatted number string to a JS number.
 * Thousands separator is "." and decimal separator is ",".
 * Examples: "20.000" → 20000, "3,5" → 3.5, "1.234,56" → 1234.56
 */
export function parseGermanNumber(s: string): number {
  return Number(s.replace(/\./g, '').replace(',', '.'));
}
