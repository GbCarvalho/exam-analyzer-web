export const VALID_KEYS = {
  cebraspe: ['C', 'E'],
  fgv: ['A', 'B', 'C', 'D', 'E'],
  unknown: ['A', 'B', 'C', 'D', 'E'],
} as const

const NUMERIC_MAP = {
  cebraspe: { '1': 'C', '2': 'E' },
  fgv: { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' },
  unknown: { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' },
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
 * Convert a concatenated answer string into a fixed-length array of answers.
 * - Spaces are stripped (not treated as empty slots).
 * - X (or x) is treated as null (empty/blank answer).
 * - Missing positions beyond the string length are null.
 */
export function parseAnswerString(input: string, count: number): (string | null)[] {
  const cleaned = input.replace(/\s/g, '').toUpperCase()
  return Array.from({ length: count }, (_, i) => {
    const char = cleaned[i]
    if (char === undefined) return null
    if (char === 'X') return null
    return char
  })
}

/**
 * Map a numeric key ('1'–'5') to its letter equivalent for the given provider.
 * Returns null if the key is out of range for the provider.
 */
export function mapNumericKey(key: string, provider: string): string | null {
  const map = (NUMERIC_MAP[provider as keyof typeof NUMERIC_MAP] ??
    NUMERIC_MAP.unknown) as Record<string, string>
  return map[key] ?? null
}

/**
 * Check if a key is valid for the given provider. Input must be uppercase.
 */
export function isValidAnswerKey(key: string, provider: string): boolean {
  const valid = (VALID_KEYS[provider as keyof typeof VALID_KEYS] ??
    VALID_KEYS.unknown) as readonly string[]
  return valid.includes(key)
}

/**
 * Check if a key is a valid input when typing answers on the platform.
 * Accepts: letter answer keys, numeric shortcuts, and space (= blank answer).
 * Input must be a single character.
 */
export function isValidInputKey(key: string, provider: string): boolean {
  if (isValidAnswerKey(key, provider)) return true
  if (mapNumericKey(key, provider) !== null) return true
  if (key === ' ') return true
  return false
}
