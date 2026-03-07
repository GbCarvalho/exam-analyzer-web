import { describe, it, expect } from 'vitest'
import { cebraspecSchema, fgvSchema } from '@/lib/upload-schemas'

describe('cebraspecSchema', () => {
  it('rejects when cargo is empty', () => {
    const result = cebraspecSchema.safeParse({
      basicosFile: new File([''], 'a.pdf', { type: 'application/pdf' }),
      especificosFile: new File([''], 'b.pdf', { type: 'application/pdf' }),
      cargo: '',
      expectedQuestions: 100,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid cebraspe input', () => {
    const result = cebraspecSchema.safeParse({
      basicosFile: new File(['x'], 'a.pdf', { type: 'application/pdf' }),
      especificosFile: new File(['x'], 'b.pdf', { type: 'application/pdf' }),
      cargo: 'Auditor Fiscal',
      expectedQuestions: 100,
    })
    expect(result.success).toBe(true)
  })

  it('rejects expectedQuestions below 1', () => {
    const result = cebraspecSchema.safeParse({
      basicosFile: new File(['x'], 'a.pdf', { type: 'application/pdf' }),
      especificosFile: new File(['x'], 'b.pdf', { type: 'application/pdf' }),
      cargo: 'Auditor Fiscal',
      expectedQuestions: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('fgvSchema', () => {
  it('rejects when examType is empty', () => {
    const result = fgvSchema.safeParse({
      file: new File(['x'], 'a.pdf', { type: 'application/pdf' }),
      cargo: 'Auditor Fiscal',
      examType: '',
      expectedQuestions: 60,
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid fgv input', () => {
    const result = fgvSchema.safeParse({
      file: new File(['x'], 'a.pdf', { type: 'application/pdf' }),
      cargo: 'Auditor Fiscal',
      examType: 'TIPO 1',
      expectedQuestions: 60,
    })
    expect(result.success).toBe(true)
  })
})
