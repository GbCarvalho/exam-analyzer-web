import { describe, it, expect } from 'vitest'
import {
  sanitizeAnswerString,
  parseAnswerString,
  isValidAnswerKey,
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

  it('strips whitespace before parsing', () => {
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
