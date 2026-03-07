import { z } from 'zod'

const pdfFile = z
  .instanceof(File)
  .refine((f) => f.size > 0, { message: 'Selecione um arquivo' })
  .refine((f) => f.type === 'application/pdf', { message: 'O arquivo deve ser um PDF' })

const expectedQuestionsField = z.coerce
  .number({ invalid_type_error: 'Número inválido' })
  .int()
  .min(1, 'Mínimo 1 questão')
  .max(200, 'Máximo 200 questões')

export const cebraspecSchema = z.object({
  basicosFile: pdfFile,
  especificosFile: pdfFile,
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  basicosExpectedQuestions: expectedQuestionsField,
  especificosExpectedQuestions: expectedQuestionsField,
})

export const fgvSchema = z.object({
  file: pdfFile,
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  examType: z.string().min(1, 'Tipo é obrigatório'),
  expectedQuestions: expectedQuestionsField,
})

export type CebraspecFormValues = z.infer<typeof cebraspecSchema>
export type FgvFormValues = z.infer<typeof fgvSchema>
