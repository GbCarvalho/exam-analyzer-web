import { describe, it, expect } from 'vitest'
import { cebraspecSchema, fgvSchema } from '@/lib/upload-schemas'

const validCebraspecBase = {
  basicosFile: new File(['x'], 'a.pdf', { type: 'application/pdf' }),
  especificosFile: new File(['x'], 'b.pdf', { type: 'application/pdf' }),
  cargo: 'Auditor Fiscal',
  basicosExpectedQuestions: 70,
  especificosExpectedQuestions: 50,
}

describe('cebraspecSchema', () => {
  it('accepts valid cebraspe input', () => {
    expect(cebraspecSchema.safeParse(validCebraspecBase).success).toBe(true)
  })

  it('rejects when cargo is empty', () => {
    expect(cebraspecSchema.safeParse({ ...validCebraspecBase, cargo: '' }).success).toBe(false)
  })

  it('rejects non-PDF file', () => {
    const result = cebraspecSchema.safeParse({
      ...validCebraspecBase,
      basicosFile: new File(['x'], 'a.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    })
    expect(result.success).toBe(false)
  })

  it('rejects basicosExpectedQuestions below 1', () => {
    expect(cebraspecSchema.safeParse({ ...validCebraspecBase, basicosExpectedQuestions: 0 }).success).toBe(false)
  })

  it('rejects especificosExpectedQuestions below 1', () => {
    expect(cebraspecSchema.safeParse({ ...validCebraspecBase, especificosExpectedQuestions: 0 }).success).toBe(false)
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

  it('rejects non-PDF file', () => {
    const result = fgvSchema.safeParse({
      file: new File(['x'], 'a.jpg', { type: 'image/jpeg' }),
      cargo: 'Auditor Fiscal',
      examType: 'TIPO 1',
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
