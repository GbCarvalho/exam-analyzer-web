import { describe, it, expect } from 'vitest'
import {
  sanitizeAnswerString,
  parseAnswerString,
  isValidAnswerKey,
  mapNumericKey,
  isValidInputKey,
} from '@/lib/answer-utils'

describe('sanitizeAnswerString', () => {
  it('removes markdown bold formatting', () => {
    expect(sanitizeAnswerString('**C**')).toBe('C')
  })

  it('removes markdown italic formatting', () => {
    expect(sanitizeAnswerString('_E_')).toBe('E')
  })

  it('removes backticks', () => {
    expect(sanitizeAnswerString('`C`')).toBe('C')
  })

  it('collapses internal whitespace', () => {
    expect(sanitizeAnswerString('C  E   C')).toBe('C E C')
  })

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeAnswerString('  C  ')).toBe('C')
  })

  it('uppercases input', () => {
    expect(sanitizeAnswerString('cee')).toBe('CEE')
  })

  it('handles empty string', () => {
    expect(sanitizeAnswerString('')).toBe('')
  })
})

describe('parseAnswerString', () => {
  it('parses contiguous string into array', () => {
    expect(parseAnswerString('CCE', 3)).toEqual(['C', 'C', 'E'])
  })

  it('strips whitespace before parsing (spaces are not empty slots)', () => {
    expect(parseAnswerString('C C E', 3)).toEqual(['C', 'C', 'E'])
  })

  it('fills with null when input is shorter than count', () => {
    expect(parseAnswerString('CC', 4)).toEqual(['C', 'C', null, null])
  })

  it('truncates when input is longer than count', () => {
    expect(parseAnswerString('CCEECC', 3)).toEqual(['C', 'C', 'E'])
  })

  it('returns all nulls for empty input', () => {
    expect(parseAnswerString('', 3)).toEqual([null, null, null])
  })

  it('uppercases answers', () => {
    expect(parseAnswerString('cce', 3)).toEqual(['C', 'C', 'E'])
  })

  it('treats X as null (empty answer slot)', () => {
    expect(parseAnswerString('CCXC', 4)).toEqual(['C', 'C', null, 'C'])
  })

  it('treats lowercase x as null', () => {
    expect(parseAnswerString('CxE', 3)).toEqual(['C', null, 'E'])
  })

  it('handles X at start and end', () => {
    expect(parseAnswerString('XCX', 3)).toEqual([null, 'C', null])
  })

  it('strips spaces then applies X-as-null: CC XC → CCC (space stripped, X→null)', () => {
    expect(parseAnswerString('CC XC', 4)).toEqual(['C', 'C', null, 'C'])
  })
})

describe('mapNumericKey', () => {
  it('maps 1→C and 2→E for cebraspe', () => {
    expect(mapNumericKey('1', 'cebraspe')).toBe('C')
    expect(mapNumericKey('2', 'cebraspe')).toBe('E')
  })

  it('returns null for out-of-range keys for cebraspe', () => {
    expect(mapNumericKey('3', 'cebraspe')).toBeNull()
  })

  it('maps 1→A, 2→B, 3→C, 4→D, 5→E for fgv', () => {
    expect(mapNumericKey('1', 'fgv')).toBe('A')
    expect(mapNumericKey('2', 'fgv')).toBe('B')
    expect(mapNumericKey('3', 'fgv')).toBe('C')
    expect(mapNumericKey('4', 'fgv')).toBe('D')
    expect(mapNumericKey('5', 'fgv')).toBe('E')
  })

  it('returns null for out-of-range keys for fgv', () => {
    expect(mapNumericKey('6', 'fgv')).toBeNull()
  })

  it('falls back to fgv mapping for unknown provider', () => {
    expect(mapNumericKey('1', 'unknown')).toBe('A')
  })
})

describe('isValidInputKey', () => {
  it('accepts letter answer keys for cebraspe', () => {
    expect(isValidInputKey('C', 'cebraspe')).toBe(true)
    expect(isValidInputKey('E', 'cebraspe')).toBe(true)
  })

  it('accepts numeric shortcuts for cebraspe', () => {
    expect(isValidInputKey('1', 'cebraspe')).toBe(true)
    expect(isValidInputKey('2', 'cebraspe')).toBe(true)
  })

  it('rejects out-of-range number for cebraspe', () => {
    expect(isValidInputKey('3', 'cebraspe')).toBe(false)
  })

  it('accepts letter answer keys for fgv', () => {
    for (const k of ['A', 'B', 'C', 'D', 'E']) {
      expect(isValidInputKey(k, 'fgv')).toBe(true)
    }
  })

  it('accepts numeric shortcuts for fgv', () => {
    for (const k of ['1', '2', '3', '4', '5']) {
      expect(isValidInputKey(k, 'fgv')).toBe(true)
    }
  })

  it('accepts space as empty/blank answer', () => {
    expect(isValidInputKey(' ', 'cebraspe')).toBe(true)
    expect(isValidInputKey(' ', 'fgv')).toBe(true)
  })

  it('rejects unknown keys', () => {
    expect(isValidInputKey('Z', 'cebraspe')).toBe(false)
    expect(isValidInputKey('6', 'fgv')).toBe(false)
  })
})

describe('isValidAnswerKey', () => {
  it('accepts C for cebraspe', () => {
    expect(isValidAnswerKey('C', 'cebraspe')).toBe(true)
  })

  it('accepts E for cebraspe', () => {
    expect(isValidAnswerKey('E', 'cebraspe')).toBe(true)
  })

  it('rejects A for cebraspe', () => {
    expect(isValidAnswerKey('A', 'cebraspe')).toBe(false)
  })

  it('accepts A-E for fgv', () => {
    for (const k of ['A', 'B', 'C', 'D', 'E']) {
      expect(isValidAnswerKey(k, 'fgv')).toBe(true)
    }
  })

  it('rejects lowercase (must pass uppercase)', () => {
    expect(isValidAnswerKey('c', 'cebraspe')).toBe(false)
  })

  it('falls back to A-E for unknown provider', () => {
    expect(isValidAnswerKey('A', 'unknown')).toBe(true)
  })
})
