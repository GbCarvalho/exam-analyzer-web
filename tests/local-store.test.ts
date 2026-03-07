import { describe, it, expect } from 'vitest'
import { mergeQuestions, type LocalQuestion } from '@/lib/local-store'

describe('mergeQuestions — manual > OCR conflict resolution', () => {
  it('returns remote question when no local override exists', () => {
    const remote: LocalQuestion[] = [
      { number: 1, statement: 'OCR text', manual: false },
    ]
    expect(mergeQuestions(remote, [])).toEqual(remote)
  })

  it('uses manual local question over remote OCR', () => {
    const remote: LocalQuestion[] = [
      { number: 1, statement: 'OCR text', manual: false },
    ]
    const local: LocalQuestion[] = [
      { number: 1, statement: 'Corrected text', manual: true },
    ]
    const result = mergeQuestions(remote, local)
    expect(result[0].statement).toBe('Corrected text')
    expect(result[0].manual).toBe(true)
  })

  it('uses remote when local exists but is not manual', () => {
    const remote: LocalQuestion[] = [
      { number: 1, statement: 'OCR text', manual: false },
    ]
    const local: LocalQuestion[] = [
      { number: 1, statement: 'Auto-synced text', manual: false },
    ]
    const result = mergeQuestions(remote, local)
    expect(result[0].statement).toBe('OCR text')
  })

  it('preserves all remote questions even when only some have local overrides', () => {
    const remote: LocalQuestion[] = [
      { number: 1, statement: 'Q1 OCR', manual: false },
      { number: 2, statement: 'Q2 OCR', manual: false },
      { number: 3, statement: 'Q3 OCR', manual: false },
    ]
    const local: LocalQuestion[] = [
      { number: 2, statement: 'Q2 manual', manual: true },
    ]
    const result = mergeQuestions(remote, local)
    expect(result).toHaveLength(3)
    expect(result[0].statement).toBe('Q1 OCR')
    expect(result[1].statement).toBe('Q2 manual')
    expect(result[2].statement).toBe('Q3 OCR')
  })

  it('returns empty array for empty remote', () => {
    expect(mergeQuestions([], [])).toEqual([])
  })
})
