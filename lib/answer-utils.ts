export const VALID_KEYS = {
  cebraspe: ['C', 'E'],
  fgv: ['A', 'B', 'C', 'D', 'E'],
  unknown: ['A', 'B', 'C', 'D', 'E'],
} as const

/**
 * Strip markdown formatting characters, collapse whitespace, uppercase.
 */
export function sanitizeAnswerString(input: string): string {
  return input
    .replace(/[*_~`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

/**
 * Convert a concatenated answer string (e.g. "C C E E") into a fixed-length
 * array of answers. Missing positions are null.
 */
export function parseAnswerString(input: string, count: number): (string | null)[] {
  const cleaned = input.replace(/\s/g, '').toUpperCase()
  return Array.from({ length: count }, (_, i) => cleaned[i] ?? null)
}

/**
 * Check if a key is valid for the given provider. Input must be uppercase.
 */
export function isValidAnswerKey(key: string, provider: string): boolean {
  const valid = (VALID_KEYS[provider as keyof typeof VALID_KEYS] ??
    VALID_KEYS.unknown) as readonly string[]
  return valid.includes(key)
}
